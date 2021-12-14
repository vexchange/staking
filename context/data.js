import React, { useContext, createContext } from 'react'
import defaultStakingPoolData from '../models/staking'
import useFetchStakingPoolsData from '../hooks/useFetchStakingPoolsData'

export const DataContext = createContext({
  stakingPools: defaultStakingPoolData,
})

export const useStakingPoolsData = () => {
  const { stakingPools } = useContext(DataContext)

  return { stakingPoolsData: stakingPools }
}

export const DataContextProvider = ({
  children,
}) => {
  const stakingPools = useFetchStakingPoolsData()
  return (
    <DataContext.Provider
      value={{
        stakingPools,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}
