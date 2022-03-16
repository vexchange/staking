import { useEffect, useState } from 'react'
import { BigNumber, constants } from 'ethers'
import { find } from 'lodash'

import { useAppContext } from '../context/app'
import { VECHAIN_NETWORK } from '../constants'
import IERC20 from '../constants/abis/IERC20.js'

const useTokenAllowance = (vaultOption) => {
  const { account, connex, tick, connexStakingPools } = useAppContext()
  const allowanceABI = find(IERC20, { name: 'allowance' })
  const [tokenAllowance, setTokenAllowance] = useState(constants.Zero)

  const getAllowance = async () => {
    if (connex && account && connexStakingPools) {
      const method = connexStakingPools[vaultOption.id].stakingTokenContract.method(allowanceABI)
      const {
        decoded: {
          0: _allowance,
        },
      } = await method.call(account, vaultOption.rewardsAddress[VECHAIN_NETWORK])
      setTokenAllowance(BigNumber.from(_allowance))
    }
  }

  useEffect(getAllowance, [connex, account, tick])

  return { tokenAllowance }
}

export default useTokenAllowance
