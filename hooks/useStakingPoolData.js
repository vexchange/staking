import defaultStakingPoolData from '../models/staking'

const useStakingPoolData = vault => ({
  data: defaultStakingPoolData.responses[vault],
  loading: defaultStakingPoolData.loading,
})

export default useStakingPoolData
