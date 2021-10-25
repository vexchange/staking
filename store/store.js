import { createGlobalState } from 'react-hooks-global-state'

export const initialState = {
  transactions: [],
  showConnectWallet: false,
  gasPrice: '',
  desktopView: 'grid',
  airdropInfo: undefined,
  notificationLastReadTimestamp: undefined,
}

export const { useGlobalState } = createGlobalState(initialState)
