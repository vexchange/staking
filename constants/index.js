export const VECHAIN_NODE = "testnet";

export const VEX_ADDRESS = {
  mainnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
  testnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
};

export const WVET_ADDRESS = {
  mainnet: "0xd8ccdd85abdbf68dfec95f06c973e87b1b5a9997",
  testnet: "0x93e5fa8011612fab061ef58cbab9262d2e76407b",
};

export const NETWORK_NAMES = {
  1: "mainnet",
  42: "testnet",
};

export const CHAIN_ID = {
  mainnet: 1,
  testnet: 42,
};

/**
 * stakingTokenAddress: Fill in the actual V2Pair token address (eg. VEX-VET)
 * rewardsAddress: multirewards contract address for the stakingTokenAddress
 * rewardTokenAddress: rewards token to be given out (eg. VEX)
 */
export const STAKING_POOLS = [
  {
    id: 1,
    stakeAsset: "VEX-VET",
    stakeAssetLogo: "/imgs/tokens/vex.svg",
    stakeAssetUrlPart:
      "0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997-0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
    rewardToken: "VEX",
    stakingTokenAddress: {
      mainnet: "0x39cd888a1583498AD30E716625AE1a00ff51286D",
      testnet: "0x136f4e8CD2A5dda330EF1B47A102B25122bf066C",
    },
    rewardsAddress: {
      mainnet: "0x538f8890a383c44e59df4c7263d96ca8048da2c7",
      testnet: "0x03ec9c93ed8a0dd68a9a4ac868c06fae3eecad01",
    },
    rewardTokenAddress: {
      mainnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
      testnet: "0x7e46cAd7eB7ebc587ac36c30fE705eD77a686f60",
    },
  },
  {
    id: 2,
    stakeAsset: "VTHO",
    stakeAssetLogo: "/imgs/tokens/vex.svg",
    stakeAssetUrlPart:
      "0x0000000000000000000000000000456E65726779-0x0000000000000000000000000000456E65726779",
    rewardToken: "VTHO",
    stakingTokenAddress: {
      mainnet: "0x39cd888a1583498AD30E716625AE1a00ff51286D",
      testnet: "0x0000000000000000000000000000456E65726779",
    },
    rewardsAddress: {
      mainnet: "0x538f8890a383c44e59df4c7263d96ca8048da2c7",
      testnet: "0xeaad8ec04957373694843bbb486a0c206e2e5120",
    },
    rewardTokenAddress: {
      mainnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
      testnet: "0x0000000000000000000000000000456E65726779",
    },
  },
];
