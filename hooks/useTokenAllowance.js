import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { find } from 'lodash'

import { useAppContext } from '../context/app'
import { REWARD_TOKEN_ADDRESSES, STAKING_TOKEN_ADDRESSES } from '../constants'
import IERC20 from '../constants/abis/IERC20.json'

const useTokenAllowance = () => {
  const { account, connex } = useAppContext()
  const allowanceABI = find(IERC20.abi, { name: 'allowance' })
  const [tokenAllowance, setTokenAllowance] = useState()
  const [block, setBlock] = useState(0)

  useEffect(() => {
    const getAllowance = async () => {
      const method = connex.thor.account(STAKING_TOKEN_ADDRESSES.testnet).method(allowanceABI)
      const {
        decoded: {
          0: _allowance,
        },
      } = await method.call(account, REWARD_TOKEN_ADDRESSES.testnet)

      setTokenAllowance(BigNumber.from(_allowance))
    }

    const updateBlock = async () => {
      const ticker = connex.thor.ticker()
      const { number } = await ticker.next()

      if (number !== block) {
        setBlock(number)
        getAllowance()
      }
    }

    const initWatcher = async () => {
      setInterval(async () => {
        updateBlock()
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
