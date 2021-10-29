import { useEffect, useState } from 'react'
import { BigNumber, constants } from 'ethers'
import { find } from 'lodash'

import { useAppContext } from '../context/app'
import { REWARDS_ADDRESSES, STAKING_TOKEN_ADDRESSES } from '../constants'
import IERC20 from '../constants/abis/IERC20.json'

const useTokenAllowance = () => {
  const { account, connex } = useAppContext()
  const allowanceABI = find(IERC20.abi, { name: 'allowance' })
  const [tokenAllowance, setTokenAllowance] = useState(constants.Zero)
  const [block, setBlock] = useState(0)

  useEffect(() => {
    const getAllowance = async () => {
      const method = connex.thor.account(STAKING_TOKEN_ADDRESSES.testnet).method(allowanceABI)
      const {
        decoded: {
          0: _allowance,
        },
      } = await method.call(account, REWARDS_ADDRESSES.testnet)

      setTokenAllowance(BigNumber.from(_allowance))
    }

    const pollForUpdates = async () => {
      const ticker = connex.thor.ticker()
      const { number } = await ticker.next()

      if (number !== block) {
        setBlock(number)
        getAllowance()
      }
    }

    const initWatcher = async () => {
      setInterval(async () => {
        pollForUpdates()
      }, 10000)
    }

    if (account && connex) {
      getAllowance()
      initWatcher()
    }
  }, [connex, block, account])

  return { tokenAllowance }
}

export default useTokenAllowance
