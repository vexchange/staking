import { BigNumber } from "ethers";

export const defaultStakingPoolData = {
  poolSize: BigNumber.from(0),
  poolRewardForDuration: BigNumber.from(0),
  loading: true,
  lastTimeRewardApplicable: null,
  periodFinish: null,
};

export const defaultUserData = {
  currentStake: BigNumber.from(0),
  claimableRewardToken: BigNumber.from(0),
  loading: true,
  unstakedBalance: BigNumber.from(0),
  unstakedAllowance: BigNumber.from(0),
};
