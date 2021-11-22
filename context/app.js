import {
  createContext,
  useRef,
  useContext,
  useEffect,
  useState,
} from 'react'
import PropTypes from 'prop-types'
import { REWARDS_ADDRESSES, STAKING_TOKEN_ADDRESSES } from '../constants'
import { userAccount } from '../utils'

const AppContext = createContext({})

export const useAppContext = () => useContext(AppContext)
export function AppStateProvider({ children }) {
  const [connex, setConnex] = useState(null)
  const [account, setAccount] = useState(null)
  const [ticker, setTicker] = useState(null)
  const [tick, setTick] = useState(null)
  const [stakingTokenContract, setStakingTokenContract] = useState(null)
  const [rewardsContract, setRewardsContract] = useState(null)
  const ref = useRef(connex)

  useEffect(() => {
    ref.current = connex
  })

  useEffect(() => {
    const initConnex = async () => {
      try {
        const { Connex } = await import('@vechain/connex')
        const _connex = new Connex({
          node: 'https://mainnet.veblocks.net/',
        })
        const _ticker = _connex.thor.ticker()
        setConnex(_connex)
        setStakingTokenContract(_connex.thor.account(STAKING_TOKEN_ADDRESSES.mainnet))
        setRewardsContract(_connex.thor.account(REWARDS_ADDRESSES.mainnet))
        setTicker(_ticker)
        const account = userAccount.get()
        if (account) {
          setAccount(account)
        }
      } catch (error) {
        console.warn(`Unable to get connex: ${error}`)
      }
    }

    if (!connex) {
      initConnex()
    }
  }, [connex])

  useEffect( async () => {
    if(ticker) {
      let _tick = await ticker.next()
      setTick(_tick)
    }
  }, [ticker, tick])

  const initAccount = async () => {
    const _connex = ref.current
    const sign = _connex.vendor.sign('cert', {
      purpose: 'identification',
      payload: {
        type: 'text',
        content: 'Select account to sign certificate',
      },
    })
    try {
      const { annex } = await sign.request()
      setAccount(annex.signer)
      userAccount.set(annex.signer)
    } catch (error) {
      console.warn(`Unable to get account: ${error}`)
    }
  }

  return (
    <AppContext.Provider
      value={{
        connex,
        account,
        initAccount,
        ticker,
        tick,
        stakingTokenContract,
        rewardsContract
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
