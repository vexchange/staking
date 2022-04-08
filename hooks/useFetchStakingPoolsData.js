import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
import { find } from "lodash";
import IERC20 from "../constants/abis/IERC20.js";
import MultiRewards from "../constants/abis/MultiRewards.js";
import {
  NUM_SECONDS_IN_A_YEAR,
  STAKING_POOLS,
  VECHAIN_NETWORK,
} from "../constants";
import { useAppContext } from "../context/app";
import useOverview from "../hooks/useOverview";
import { defaultStakingPoolData, defaultUserData } from "../models/staking";
import { parseUnits } from "@ethersproject/units";
import useTokensInfo from "./useTokensInfo";

const useFetchStakingPoolsData = () => {
  const { poolInfo } = useOverview();
  const { connex, connexStakingPools, account, tick } = useAppContext();
  const [poolData, setPoolData] = useState(defaultStakingPoolData);
  const [userData, setUserData] = useState(defaultUserData);
  const { tokensInfo } = useTokensInfo();

  const totalSupplyABI = find(IERC20, { name: "totalSupply" });
  const balanceOfABI = find(IERC20, { name: "balanceOf" });
  const allowanceABI = find(IERC20, { name: "allowance" });
  const getRewardForDurationABI = find(MultiRewards, {
    name: "getRewardForDuration",
  });
  const lastTimeRewardApplicableABI = find(MultiRewards, {
    name: "lastTimeRewardApplicable",
  });
  const periodFinishABI = find(MultiRewards, { name: "rewardData" });
  const accountBalanceOfABI = find(MultiRewards, { name: "balanceOf" });
  const earnedABI = find(MultiRewards, { name: "earned" });

  let stakingPoolsFunctions = [];
  STAKING_POOLS.map(async (stakingPool) => {
    stakingPoolsFunctions[stakingPool.id] = {
      // Pool size
      getBalanceOf: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NETWORK])
        .method(totalSupplyABI),

      // Pool Reward For Duration
      getRewardForDuration: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NETWORK])
        .method(getRewardForDurationABI),

      // Last Time Reward Applicable
      getLastTimeRewardApplicable: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NETWORK])
        .method(lastTimeRewardApplicableABI),

      // Period Finish
      getPeriodFinish: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NETWORK])
        .method(periodFinishABI),

      //  Current stake
      getAccountBalanceOf: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NETWORK])
        .method(accountBalanceOfABI),

      // Unstaked staking token balance
      getUnstakedBalanceOf: connex?.thor
        .account(stakingPool.stakingTokenAddress[VECHAIN_NETWORK])
        .method(balanceOfABI),

      // Unstaked staking token approval amount
      getUnstakedAllowanceAmount: connex?.thor
        .account(stakingPool.stakingTokenAddress[VECHAIN_NETWORK])
        .method(allowanceABI),

      // Claimable token
      getEarned: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NETWORK])
        .method(earnedABI),
    };
  });

  const getPoolData = async () => {
    return await Promise.all(
      STAKING_POOLS.map(async (stakingPool) => {
        let poolSize = BigNumber.from(0);
        let totalApr = BigNumber.from(0);
        let tvlInUsd = BigNumber.from(0);
        try {
          // Pool size
          const {
            decoded: { 0: poolBalanceOf },
          } = await stakingPoolsFunctions[stakingPool.id].getBalanceOf.call();
          poolSize = BigNumber.from(poolBalanceOf);

          // placeholder for function call return values
          let method;
          let res;

          const totalSupplyABI = find(IERC20, { name: "totalSupply" });
          method = connex.thor
              .account(stakingPool.stakingTokenAddress[VECHAIN_NETWORK])
              .method(totalSupplyABI);
          res = await method.call();
          const totalLPTokenSupply = BigNumber.from(res.decoded[0]);
          const numberOfLPTokensStaked = poolSize;

          // normalizing everything to 18 decimals for calculation purposes
          const token0UsdPrice = parseUnits(tokensInfo[poolInfo[stakingPool.id].pair.token0.address].usdPrice.toFixed(18));
          const token1UsdPrice = parseUnits(tokensInfo[poolInfo[stakingPool.id].pair.token1.address].usdPrice.toFixed(18));
          const token0Amount = parseUnits(poolInfo[stakingPool.id].pair.reserve0.toExact());
          const token1Amount = parseUnits(poolInfo[stakingPool.id].pair.reserve1.toExact());

          tvlInUsd = token0Amount.mul(token0UsdPrice)
                      .add(token1Amount.mul(token1UsdPrice))
                      // Takes into account that not all LP tokens are staked
                      .mul(numberOfLPTokensStaked)
                      .div(totalLPTokenSupply)
                      .div(ethers.constants.WeiPerEther);

          const rewardDataABI = find(MultiRewards, { name: "rewardData" });
          method = connexStakingPools[stakingPool.id].rewardsContract.method(rewardDataABI);

          // reduce the different token rewards into a single APR number
          totalApr = await stakingPool.rewardTokens.reduce(async (accumulated, curr) => {
            const tokenAddress = curr.address[VECHAIN_NETWORK];
            // convert to BigNumber for calculation, complains of underflow otherwise
            const tokenUsdPrice = parseUnits(tokensInfo[tokenAddress].usdPrice.toFixed(18), 18);

            res = await method.call(curr.address[VECHAIN_NETWORK]);
            const rewardRate = BigNumber.from(res.decoded.rewardRate);

            const tokenApr = rewardRate
                              .mul(tokenUsdPrice)
                              .mul(NUM_SECONDS_IN_A_YEAR)
                              .mul(100) // convert into percentage
                              .div(tvlInUsd)

            // need to await as this function given to reduce is async and therefore returns a promise
            return (await accumulated).add(tokenApr);
          }, ethers.constants.Zero);
        }
        catch (err) {
          console.log(stakingPool.id, err);
        }

        return {
          poolId: stakingPool.id,
          vault: stakingPool.stakeAsset,
          poolSize,
          apr: totalApr,
          tvlInUsd,
        };
      })
    );
  };

  const getUserData = async () => {
    return await Promise.all(
      STAKING_POOLS.map(async (stakingPool) => {
        //  Current stake
        const {
          decoded: { 0: accountBalanceOf },
        } = await stakingPoolsFunctions[
          stakingPool.id
        ].getAccountBalanceOf.call(account);

        let claimableRewardTokens = [];
        stakingPool.rewardTokens.map(async (rewardToken) => {
          // Claimable token
          const {
            decoded: { 0: earned },
          } = await stakingPoolsFunctions[stakingPool.id].getEarned.call(
            account,
            rewardToken.address[VECHAIN_NETWORK]
          );

          claimableRewardTokens = [
            ...claimableRewardTokens,
            { [rewardToken.name]: BigNumber.from(earned) },
          ];
        });

        // Unstaked balance
        const {
          decoded: { 0: unstakedBalance },
        } = await stakingPoolsFunctions[
          stakingPool.id
        ].getUnstakedBalanceOf.call(account);

        // Unstaked allowance
        const {
          decoded: { 0: unstakedAllowance },
        } = await stakingPoolsFunctions[
          stakingPool.id
        ].getUnstakedAllowanceAmount.call(
          account,
          stakingPool.rewardsAddress[VECHAIN_NETWORK]
        );

        // depending on the event, claimableRewardTokens doesn't come
        // in this case we just return the previous state
        if (!userData.loading) {
          const previousUserDataState = userData.filter(item => item.poolId === stakingPool.id)[0]
          if (
            previousUserDataState.claimableRewardTokens &&
            previousUserDataState.claimableRewardTokens.length > 0 &&
            claimableRewardTokens.length !== previousUserDataState.claimableRewardTokens.length
          ) {
            return previousUserDataState
          }
        }

        return {
          poolId: stakingPool.id,
          currentStake: BigNumber.from(accountBalanceOf),
          claimableRewardTokens,
          unstakedBalance: BigNumber.from(unstakedBalance),
          unstakedAllowance: BigNumber.from(unstakedAllowance),
        };
      })
    );
  };

  useEffect(() => {
    const getStakingPoolsData = async () => {
      const stakingPoolData = await getPoolData();
      setPoolData(stakingPoolData);
    };

    if (
      connex &&
      connexStakingPools &&
      poolInfo.length > 0 &&
      stakingPoolsFunctions.length > 0 &&
      tokensInfo
    ) {
      getStakingPoolsData();
    }
  }, [connex, tick, connexStakingPools, poolInfo, tokensInfo]);

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getUserData();
      setUserData(accountData);
    };

    if (account) {
      getAccountData();
    }
  }, [account, connex, tick, connexStakingPools, poolInfo]);

  return { poolData, userData };
};

export default useFetchStakingPoolsData;
