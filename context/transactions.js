import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useAppContext } from './app'

import { useGlobalState } from '../store/store'

const initialState = {
  transactions: [],
  transactionsCounter: 0,
}

export const TransactionsContext = createContext(initialState)

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
  const { connex } = useAppContext()
  const [transactions, setTransactions] = useGlobalState('transactions')
  const [transactionsCounter, setTransactionsCounter] = useState(0)

  /**
   * Keep track with first confirmation
   */
  useEffect(() => {
    transactions.forEach(async transaction => {
      if (!transaction.status) {
        const receipt = await connex.vendor.waitForTransaction(
          transaction.txhash,
          5,
        )
        setTransactionsCounter(counter => counter + 1)
        setTransactions(_transactions => {
          _transactions.map(_transaction => {
            if (_transaction.txhash !== transaction.txhash) {
              return _transaction
            }

            return {
              ..._transaction,
              firstConfirmation: true,
              status: receipt.status ? 'success' : 'error',
            }
          })
        })
      }
    }, [])
  }, [transactions, connex, setTransactions])

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
