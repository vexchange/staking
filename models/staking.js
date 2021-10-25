import { BigNumber } from 'ethers'

import { FullVaultList } from '../constants'

const defaultStakingPoolData = {
  responses: Object.fromEntries(
    FullVaultList.map(vault => [
      vault,
      {
        currentStake: BigNumber.from(0),
        poolSize: BigNumber.from(0),
        poolRewardForDuration: BigNumber.from(0),
        claimHistory: [],
        claimableVex: BigNumber.from(0),
        unstakedBalance: BigNumber.from(0),
      },
    ]),
  ),
  loading: true,
}

export default defaultStakingPoolData
