import React, { useContext, createContext } from 'react'

import defaultStakingPoolData from '../models/staking'

import {
  defaultV2VaultData,
  VaultData,
  V2VaultData,
  defaultVaultData,
} from '../models/vault'
import useFetchAssetBalanceData, {
  defaultUserAssetBalanceData,
  UserAssetBalanceData,
} from '../hooks/useFetchAssetBalanceData'

import useFetchStakingPoolData from '../hooks/useFetchStakingPoolData'
import useFetchV2VaultData from '../hooks/useFetchV2VaultData'
import useFetchVaultData from '../hooks/useFetchVaultData'

// export type Web3DataContextType = {
//   v1: VaultData;
//   v2: V2VaultData;
//   assetBalance: UserAssetBalanceData;
//   stakingPool: StakingPoolData;
// };

export const DataContext = createContext({
  v1: defaultVaultData,
  v2: defaultV2VaultData,
  assetBalance: defaultUserAssetBalanceData,
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

export const useStakingPoolData = vault => {
  const contextData = useContext(DataContext)

  return {
    data: contextData.stakingPool.responses[vault],
    loading: contextData.stakingPool.loading,
  }
}

export const DataContextProvider = ({
  children,
}) => {
  const vaultData = useFetchVaultData()
  const v2VaultData = useFetchV2VaultData()
  const assetBalance = useFetchAssetBalanceData()
  const stakingPool = useFetchStakingPoolData()

  return (
    <DataContextProvider.Provider
      value={{
        v1: vaultData,
        v2: v2VaultData,
        assetBalance,
        stakingPool,
      }}
    >
      {children}
    </DataContextProvider.Provider>
  )
}
