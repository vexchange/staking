import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import moment from 'moment'
import { find } from 'lodash'

import IERC20 from '../constants/abis/IERC20.js'
import MultiRewards from '../constants/abis/MultiRewards.js'

import { REWARDS_ADDRESSES, REWARD_TOKEN_ADDRESSES, STAKING_POOLS, STAKING_TOKEN_ADDRESSES, VECHAIN_NODE } from '../constants'
import { useAppContext } from '../context/app'
import { defaultStakingPoolData, defaultUserData } from '../models/staking'

const useFetchStakingPoolData = () => {
  const { connex, account, tick } = useAppContext()
  const [poolData, setPoolData] = useState(defaultStakingPoolData)
  const [userData, setUserData] = useState(defaultUserData)

  const totalSupplyABI = find(IERC20, { name: 'totalSupply'})
  const balanceOfABI = find(IERC20, { name: 'balanceOf' })
  const allowanceABI = find(IERC20, { name:'allowance' })
  const getRewardForDurationABI = find(MultiRewards, { name: 'getRewardForDuration' })
  const lastTimeRewardApplicableABI = find(MultiRewards, { name: 'lastTimeRewardApplicable' })
  const periodFinishABI = find(MultiRewards, { name: 'rewardData' })
  const accountBalanceOfABI = find(MultiRewards, { name: 'balanceOf' })
  const earnedABI = find(MultiRewards, { name: 'earned' })

  let stakingPoolsFunctions = []
  STAKING_POOLS.map(async (stakingPool) => {
    stakingPoolsFunctions[stakingPool.id] = {
      // Pool size
      getBalanceOf: connex?.thor
        .account(REWARDS_ADDRESSES[VECHAIN_NODE])
        .method(totalSupplyABI),

      // Pool Reward For Duration
      getRewardForDuration: connex?.thor
        .account(REWARDS_ADDRESSES[VECHAIN_NODE])
        .method(getRewardForDurationABI),

      // Last Time Reward Applicable
      getLastTimeRewardApplicable: connex?.thor
        .account(REWARDS_ADDRESSES[VECHAIN_NODE])
        .method(lastTimeRewardApplicableABI),

      // Period Finish
      getPeriodFinish: connex?.thor
        .account(REWARDS_ADDRESSES[VECHAIN_NODE])
        .method(periodFinishABI),

      //  Current stake
      getAccountBalanceOf: connex?.thor
        .account(REWARDS_ADDRESSES[VECHAIN_NODE])
        .method(accountBalanceOfABI),

      // Unstaked staking token balance
      getUnstakedBalanceOf: connex?.thor
        .account(STAKING_TOKEN_ADDRESSES[VECHAIN_NODE])
        .method(balanceOfABI),

      // Unstaked staking token approval amount
      getUnstakedAllowanceAmount: connex?.thor
          .account(STAKING_TOKEN_ADDRESSES[VECHAIN_NODE])
          .method(allowanceABI),

      // Claimable vex
      getEarned: connex?.thor
        .account(REWARDS_ADDRESSES[VECHAIN_NODE])
        .method(earnedABI)
    }
  })

  const getPoolData = async () => {
    return await Promise.all(STAKING_POOLS.map(async (stakingPool) => {
      // Pool size
      const { decoded: { 0: poolSize } } = await stakingPoolsFunctions[stakingPool.id].getBalanceOf.call()
      // Pool Reward For Duration
      const { decoded: { 0: poolRewardForDuration } } = await stakingPoolsFunctions[stakingPool.id].getRewardForDuration.call(REWARD_TOKEN_ADDRESSES[VECHAIN_NODE])
      // Last Time Reward Applicable
      // Is this value even used?
      const { decoded: { 0: lastTimeRewardApplicable } } = await stakingPoolsFunctions[stakingPool.id].getLastTimeRewardApplicable.call(REWARD_TOKEN_ADDRESSES[VECHAIN_NODE])
      // Period Finish
      const { decoded: { periodFinish } } = await stakingPoolsFunctions[stakingPool.id].getPeriodFinish.call(REWARD_TOKEN_ADDRESSES[VECHAIN_NODE])

      return {
        poolId: stakingPool.id,
        vault: stakingPool.stakeAsset,
        poolSize: BigNumber.from(poolSize),
        poolRewardForDuration: BigNumber.from(poolRewardForDuration),
        lastTimeRewardApplicable,
        periodFinish: moment(periodFinish, 'X')
      }
    }))
  }

  const getUserData = async () => {
    return await Promise.all(STAKING_POOLS.map(async (stakingPool) => {
      //  Current stake
      const { decoded: { 0: accountBalanceOf } } = await stakingPoolsFunctions[stakingPool.id].getAccountBalanceOf.call(account)

      // Claimable vex
      const { decoded: { 0: earned } } = await stakingPoolsFunctions[stakingPool.id].getEarned.call(account, REWARD_TOKEN_ADDRESSES[VECHAIN_NODE])

      // Unstaked balance
      const { decoded: { 0: unstakedBalance } }  = await stakingPoolsFunctions[stakingPool.id].getUnstakedBalanceOf.call(account);

      // Unstaked allowance
      const { decoded: { 0: unstakedAllowance } } = await stakingPoolsFunctions[stakingPool.id].getUnstakedAllowanceAmount.call(account, REWARDS_ADDRESSES[VECHAIN_NODE])

      return {
        currentStake: BigNumber.from(accountBalanceOf),
        claimableRewardToken: BigNumber.from(earned),
        unstakedBalance: BigNumber.from(unstakedBalance),
        unstakedAllowance: BigNumber.from(unstakedAllowance)
      }
    }))
  }

  useEffect(() => {
    const getStakingPoolData = async () => {
      const stakingPoolData = await getPoolData()
      setPoolData(stakingPoolData)
    }

    if (connex) {
      getStakingPoolData()
    }
  }, [connex, tick])

  useEffect(() => {
    const getAccountData = async () => {
      const accountData = await getUserData()
      setUserData(accountData)
    }

    if (account) {
      getAccountData()
    }
  }, [account, tick])

  return { poolData, userData }
}

export default useFetchStakingPoolData
