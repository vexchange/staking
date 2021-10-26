import React, { useContext, createContext } from 'react'

import defaultStakingPoolData from '../models/staking'

import useFetchStakingPoolData from '../hooks/useFetchStakingPoolData'

export const DataContext = createContext({
  stakingPool: defaultStakingPoolData,
})

export const useVaultsData = () => {
  const contextData = useContext(DataContext)

  return {
    data: contextData.v1.responses,
    loading: contextData.v1.loading,
  }
}

export const useVaultData = vault => {
  const contextData = useContext(DataContext)

  return {
    ...contextData.v1.responses[vault],
    asset: 'vex',
    displayAsset: 'vex',
    decimals: 18,
    userAssetBalance: contextData.assetBalance.data.vex,
    status:
      contextData.v1.loading || contextData.assetBalance.loading
        ? 'loading'
        : 'success',
  }
}

export const useV2VaultsData = () => {
  const contextData = useContext(DataContext)

  return {
    data: contextData.v2.responses,
    loading: contextData.v2.loading,
  }
}

export const useV2VaultData = vault => {
  const contextData = useContext(DataContext)

  return {
    data: {
      ...contextData.v2.responses[vault],
      asset: 'vex',
      displayAsset: 'vex',
      decimals: 18,
      userAssetBalance: contextData.assetBalance.data.vex,
    },
    loading: contextData.v2.loading || contextData.assetBalance.loading,
  }
}

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
