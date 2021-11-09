import { useEffect, useState } from 'react'
import { BigNumber, constants } from 'ethers'
import { find } from 'lodash'

import { useAppContext } from '../context/app'
import { REWARDS_ADDRESSES, STAKING_TOKEN_ADDRESSES } from '../constants'
import IERC20 from '../constants/abis/IERC20.js'

const useTokenAllowance = () => {
  const { account, connex, tick, stakingTokenContract } = useAppContext()
  const allowanceABI = find(IERC20, { name: 'allowance' })
  const [tokenAllowance, setTokenAllowance] = useState(constants.Zero)

  const getAllowance = async () => {
    if (connex && account) {
      const method = stakingTokenContract.method(allowanceABI)
      const {
        decoded: {
          0: _allowance,
        },
      } = await method.call(account, REWARDS_ADDRESSES.mainnet)
      setTokenAllowance(BigNumber.from(_allowance))
    }
  }

  useEffect(getAllowance, [connex, account, tick])

  return { tokenAllowance }
}

export default useTokenAllowance
