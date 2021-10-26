import {
  createContext,
  useRef,
  useContext,
  useEffect,
  useState,
} from 'react'
import PropTypes from 'prop-types'

const AppContext = createContext({})

export const useAppContext = () => useContext(AppContext)
export function AppStateProvider({ children }) {
  const [connex, setConnex] = useState(null)
  const [account, setAccount] = useState(null)
  const ref = useRef(connex)

  useEffect(() => {
    ref.current = connex
  })

  useEffect(() => {
    const initConnex = async () => {
      try {
        const { Connex } = await import('@vechain/connex')
        const _connex = new Connex({
          node: 'https://testnet.veblocks.net/',
          network: 'test',
        })
        setConnex(_connex)
      } catch (error) {
        console.warn(`Unable to get connex: ${error}`)
      }
    }
    if (!connex) {
      initConnex()
    }
  }, [connex])

  const initAccount = async () => {
    const _connex = ref.current
    const sign = _connex.vendor.sign('cert', {
      purpose: 'identification',
      payload: {
        type: 'text',
        content: 'Select account to sign tx',
      },
    })
    try {
      const { annex } = await sign.request()
      setAccount(annex.signer)
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
