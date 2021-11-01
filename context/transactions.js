import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import PropTypes from 'prop-types'

import { useGlobalState } from '../store/store'
import { useAppContext } from './app'

export const TransactionsContext = createContext({
  transactions: [],
  transactionsCounter: 0,
})

export const useTransactions = () => {
  const [, setTransactions] = useGlobalState('transactions')
  const context = useContext(TransactionsContext)

  const addTransaction = useCallback(transaction => {
    setTransactions(transactions => [
      ...transactions,
      transaction,
    ])
  }, [setTransactions])

  return { ...context, addTransaction }
}

export const TransactionsProvider = ({ children }) => {
  const { connex, ticker, tick } = useAppContext()
  const [transactions, setTransactions] = useGlobalState('transactions')
  const [transactionsCounter, setTransactionsCounter] = useState(0)
  /**
   * Keep track with first confirmation
   */
  useEffect(() => {
    (transactions || []).forEach(async (transaction) => {
      if (!transaction.status) {
        const tx = connex.thor.transaction(transaction.txhash)

        try {
          await ticker.next()
          const receipt = await tx.getReceipt()

          const newArray = transactions.map(_transaction => {
            if (_transaction.txhash !== transaction.txhash) {
              return _transaction
            }
            return {
              ..._transaction,
              firstConfirmation: true,
              status: receipt.reverted ? 'error' : 'success',
            }
          })

          setTransactionsCounter(counter => counter + 1)
          setTransactions(newArray)
        } catch (error) {
          console.warn(error)
        }
      }
    }, [])
  }, [transactions, connex, setTransactions])

  useEffect(() => console.log(transactions), [tick])

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        transactionsCounter,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

TransactionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
