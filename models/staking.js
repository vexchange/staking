import { BigNumber } from "ethers";

export const defaultStakingPoolData = {
  poolSize: BigNumber.from(0),
  loading: true,
};

export const defaultUserData = {
  currentStake: BigNumber.from(0),
  claimableRewardTokens: [],
  loading: true,
  unstakedBalance: BigNumber.from(0),
  unstakedAllowance: BigNumber.from(0),
};
