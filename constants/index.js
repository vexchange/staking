export const VECHAIN_NETWORK = process.env.NEXT_PUBLIC_VECHAIN_NETWORK;
export const NUM_SECONDS_IN_A_YEAR = parseFloat(31536000);
export const VEX_ADDRESS = {
  mainnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
  testnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
};

export const WVET_ADDRESS = {
  mainnet: "0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997",
  testnet: "0x93E5Fa8011612FAB061eF58CbAB9262d2e76407b",
};

export const CHAIN_ID = {
  mainnet: 1,
  testnet: 42,
};

export const VECHAIN_NODES = {
  mainnet: "https://jp.mainnet-node.vexchange.io/",
}

/**
 * stakingTokenAddress: Fill in the actual V2Pair token address (eg. VEX-VET)
 * rewardsAddress: multirewards contract address for the stakingTokenAddress
 * rewardTokens: reward tokens to be given out (eg. VEX)
 */
export const STAKING_POOLS = [
  {
    id: 1,
    description:
      '<p class="title"> <b>vex-vet</b> </p> <p> vex-vet is a token that represents VEX deposits in the vex-vet liquidity pool. Stake your vex-vet tokens in the vex-vet staking pool to earn vex rewards ;) </p> <p> you can add your liquidity <a class="link" target="_blank" href="https://vexchange.io/add/0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997-0x0BD802635eb9cEB3fCBe60470D2857B86841aab6" > here </a> </p>',
    stakeAsset: "VEX-VET",
    stakeAssetLogo: "/imgs/tokens/vex.svg",
    stakeAssetUrlPart:
      "0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997-0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
    rewardTokens: [
      {
        name: "VEX",
        address: {
          mainnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
          testnet: "0x7e46cAd7eB7ebc587ac36c30fE705eD77a686f60",
        },
      },
    ],
    stakingTokenAddress: {
      mainnet: "0x39cd888a1583498AD30E716625AE1a00ff51286D",
      testnet: "0x136f4e8CD2A5dda330EF1B47A102B25122bf066C",
    },
    rewardsAddress: {
      mainnet: "0x538f8890a383c44e59df4c7263d96ca8048da2c7",
      testnet: "0x03ec9c93ed8a0dd68a9a4ac868c06fae3eecad01",
    },
  },
  {
    id: 2,
    description: "-",
    stakeAsset: "WOV-VET",
    stakeAssetLogo: "/imgs/tokens/wov.png",
    stakeAssetUrlPart:
      "0x170F4BA8e7ACF6510f55dB26047C83D13498AF8A-0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997",
    rewardTokens: [
      {
        name: "WOV",
        address: {
          mainnet: "0x170F4BA8e7ACF6510f55dB26047C83D13498AF8A",
          testnet: "0xa9d948658eDFf0273deE1D610F2552b6954f77e8",
        },
      },
      {
        name: "VEX",
        address: {
          mainnet: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6",
          testnet: "0x7e46cAd7eB7ebc587ac36c30fE705eD77a686f60",
        },
      }
    ],
    stakingTokenAddress: {
      mainnet: "0xD86bed355d9d6A4c951e96755Dd0c3cf004d6CD0",
      testnet: "0x0000000000000000000000000000456E65726779",
    },
    rewardsAddress: {
      mainnet: "0xa8d1a1c88329320234581e203474fe19b99473d3",
      testnet: "0x8d6b6445e0428304a330ce2502203cc49654f314",
    },
  },
];

export const API_BASE_URL = "https://api.vexchange.io/";
export const API_ENDPOINT = "v1/tokens";
