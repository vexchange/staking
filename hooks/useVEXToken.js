const vexData = {
  name: 'Vexchange',
  symbol: 'VEX',
  numHolders: '0',
  holders: '0',
  totalSupply: '1000',
}

export default function useVEXToken() {
  return ({
    data: vexData,
    loading: false,
  })
}
