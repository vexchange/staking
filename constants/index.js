export const FullVaultList = ['vex-vet']

export const NETWORK_NAMES = {
  1: 'mainnet',
  42: 'testnet',
}

export const STAKING_TOKEN_ADDRESSES = {
  // Fill in the actual V2Pair token address for VEX-VET
  mainnet: '',

  // Just a random ERC20/VIP180 token
  // Get Alex to transfer you some
  testnet: '0x136f4e8CD2A5dda330EF1B47A102B25122bf066C',
}

// Multirewards contract address for the staking token address
// defined above
export const REWARDS_ADDRESSES = {
  mainnet: '',

  // This addressed is now correct, configured to work
  // With the correct staking token and reward token
  testnet: '0x03ec9c93ed8a0dd68a9a4ac868c06fae3eecad01',
}

// This is the rewards token to be given out
// In our case it is VEX
export const REWARD_TOKEN_ADDRESSES = {
  mainnet: '',
  testnet: '0x7e46cAd7eB7ebc587ac36c30fE705eD77a686f60',
}
