import { BigNumber } from 'ethers'
import { useState, useCallback, useEffect } from 'react'

const fetchStakingPools = async vaults => (
  Object.fromEntries(
    vaults.map(vault => {
      const data = {
        numDepositors: 0,
        totalSupply: 1000,
        totalRewardClaimed: 0
      }

      if (!data) {
        return [vault, undefined];
      }

      return [
        vault,
        {
          ...data,
          totalSupply: BigNumber.from(data.totalSupply),
          totalRewardClaimed: BigNumber.from(data.totalRewardClaimed),
        },
      ]
    }),
  )
)

export default function useStakingPool() {
  // TODO: Global state
  const [stakingPools, setStakingPools] = useState({})
  const [loading, setLoading] = useState(false)

  const loadStakingPools = useCallback(async vs => {
    setLoading(true)
    setStakingPools(await fetchStakingPools(vs))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStakingPools(['vex-vet'])
  }, [loadStakingPools])

  return { stakingPools, loading }
}
