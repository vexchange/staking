import { useEffect, useState } from 'react'
import { BigNumber, constants } from 'ethers'
import { find } from 'lodash'

import { useAppContext } from '../context/app'
import { REWARDS_ADDRESSES, STAKING_TOKEN_ADDRESSES } from '../constants'
import IERC20 from '../constants/abis/IERC20.js'

const useTokenAllowance = () => {
  const { account, connex } = useAppContext()
  const allowanceABI = find(IERC20, { name: 'allowance' })
  const [tokenAllowance, setTokenAllowance] = useState(constants.Zero)
  const [block, setBlock] = useState(0)

  useEffect(() => {
    let interval

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
      interval = setInterval(async () => {
        pollForUpdates()
      }, 10000)
    }

    if (account && connex) {
      getAllowance()
      initWatcher()
    }

    return () => clearInterval(interval)
  }, [connex, block, account])

  return { tokenAllowance }
}

export default useTokenAllowance
