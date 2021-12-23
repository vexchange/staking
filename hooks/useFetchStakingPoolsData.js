import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
import { find } from "lodash";
import IERC20 from "../constants/abis/IERC20.js";
import MultiRewards from "../constants/abis/MultiRewards.js";
import {
  NUM_SECONDS_IN_A_YEAR,
  STAKING_POOLS,
  VECHAIN_NODE,
} from "../constants";
import { useAppContext } from "../context/app";
import useOverview from "../hooks/useOverview";
import { defaultStakingPoolData, defaultUserData } from "../models/staking";
import { parseUnits } from "@ethersproject/units";

const useFetchStakingPoolsData = () => {
  const { poolInfo } = useOverview();
  const { connex, connexStakingPools, account, tick } = useAppContext();
  const [poolData, setPoolData] = useState(defaultStakingPoolData);
  const [userData, setUserData] = useState(defaultUserData);
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
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(totalSupplyABI),

      // Pool Reward For Duration
      getRewardForDuration: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(getRewardForDurationABI),

      // Last Time Reward Applicable
      getLastTimeRewardApplicable: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(lastTimeRewardApplicableABI),

      // Period Finish
      getPeriodFinish: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(periodFinishABI),

      //  Current stake
      getAccountBalanceOf: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(accountBalanceOfABI),

      // Unstaked staking token balance
      getUnstakedBalanceOf: connex?.thor
        .account(stakingPool.stakingTokenAddress[VECHAIN_NODE])
        .method(balanceOfABI),

      // Unstaked staking token approval amount
      getUnstakedAllowanceAmount: connex?.thor
        .account(stakingPool.stakingTokenAddress[VECHAIN_NODE])
        .method(allowanceABI),

      // Claimable token
      getEarned: connex?.thor
        .account(stakingPool.rewardsAddress[VECHAIN_NODE])
        .method(earnedABI),
    };
  });

  const getPoolData = async () => {
    return await Promise.all(
      STAKING_POOLS.map(async (stakingPool) => {
        let poolSize = BigNumber.from(0);
        let apr = BigNumber.from(0);
        let tvlInUsd = BigNumber.from(0);
        try {
          // Pool size
          const {
            decoded: { 0: poolBalanceOf },
          } = await stakingPoolsFunctions[stakingPool.id].getBalanceOf.call();
          poolSize = BigNumber.from(poolBalanceOf)
          const rewardDataABI = find(MultiRewards, { name: "rewardData" });
          let method =
            connexStakingPools[stakingPool.id].rewardsContract.method(
              rewardDataABI
            );
          let res = await method.call(
            stakingPool.rewardTokens[0].address[VECHAIN_NODE]
          );
          const rewardRate = ethers.BigNumber.from(res.decoded.rewardRate);
          const totalSupplyABI = find(IERC20, { name: "totalSupply" });
          method = connex.thor
            .account(stakingPool.stakingTokenAddress[VECHAIN_NODE])
            .method(totalSupplyABI);
          res = await method.call();
          const totalLPTokenSupply = BigNumber.from(res.decoded[0]);
          const numberOfLPTokensStaked = poolSize;

          // This is calculated in the amount of vex tokens instead of usd
          const tokenTvl =
            poolInfo[stakingPool.id].pair.tokenAmounts[0].toFixed(18);

          // Multiply by two to get the pool TVL as this is a 50-50 pool
          const tvlInToken = parseUnits(tokenTvl, 18).mul(2);

          apr = rewardRate
            .mul(NUM_SECONDS_IN_A_YEAR)
            .mul(parseUnits("1", "ether")) // More units for precision
            .mul(100) // Convert into percentage
            // The following two lines take into account
            // that not all LP tokens are staked on the staking site
            .mul(totalLPTokenSupply)
            .div(numberOfLPTokensStaked)
            // We divide all the rewards by the total reward token TVL
            .div(tvlInToken);

          tvlInUsd = tvlInToken
            .mul(parseUnits(poolInfo[stakingPool.id].usdPerToken.toString()))
            .mul(numberOfLPTokensStaked)
            .div(totalLPTokenSupply)
            .div(parseUnits("1", "ether"));
        } catch (err) {
          console.log(stakingPool.id, err);
        }

        return {
          poolId: stakingPool.id,
          vault: stakingPool.stakeAsset,
          poolSize,
          apr,
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
        await Promise.all(
          stakingPool.rewardTokens.map(async (rewardToken) => {
            return new Promise(async (resolve) => {
              // Claimable token
              const {
                decoded: { 0: earned },
              } = await stakingPoolsFunctions[stakingPool.id].getEarned.call(
                account,
                rewardToken.address[VECHAIN_NODE]
              );

              claimableRewardTokens = [
                ...claimableRewardTokens,
                { [rewardToken.name]: BigNumber.from(earned) },
              ];

              resolve();
            });
          })
        );

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
          stakingPool.rewardsAddress[VECHAIN_NODE]
        );

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
      poolInfo &&
      stakingPoolsFunctions.length > 0
    ) {
      getStakingPoolsData();
    }
  }, [connex, tick]);

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getUserData();
      setUserData(accountData);
    };

    if (account) {
      getAccountData();
    }
  }, [account, tick]);

  return { poolData, userData };
};

export default useFetchStakingPoolsData;
