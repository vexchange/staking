import React, { useContext, createContext } from 'react'

import defaultStakingPoolData from '../models/staking'

import useFetchStakingPoolData from '../hooks/useFetchStakingPoolData'

export const DataContext = createContext({
  stakingPool: defaultStakingPoolData,
})

export const useStakingPoolData = () => {
  const { stakingPool } = useContext(DataContext)

  return { stakingPoolData: stakingPool }
}

export const DataContextProvider = ({
  children,
}) => {
  const stakingPool = useFetchStakingPoolData()

  return (
    <DataContext.Provider
      value={{
        stakingPool,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
