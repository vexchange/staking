import { utils } from "ethers";
import currency from "currency.js";
import {
  CHAIN_ID,
  VECHAIN_NETWORK,
} from "../constants";
import { Fetcher, Token, Route } from "vexchange-sdk";
import numeral from "numeral";

const { commify, formatEther } = utils;

export const getExploreURI = () => "https://explore.vechain.org";


export const getDefaultSignificantDecimalsFromAssetDecimals = (decimals) => {
  switch (decimals) {
    case 18:
      return 6;
    case 8:
      return 5;
    case 6:
    default:
      return 2;
  }
};

export const userAccount = {
  get: (account) => {
    const savedAccount = localStorage.getItem(`staking-wallet-${VECHAIN_NETWORK}`);
    return savedAccount ?? account;
  },
  set: (account) => {
    localStorage.setItem(`staking-wallet-${VECHAIN_NETWORK}`, account);
  },
  remove: () => {
    localStorage.removeItem(`staking-wallet-${VECHAIN_NETWORK}`);
    window.location.href = "/";
  },
};

export const copyTextToClipboard = (text) => {
  const textField = document.createElement("textarea");
  textField.innerText = text;
  document.body.appendChild(textField);
  if (window.navigator.platform === "iPhone") {
    textField.setSelectionRange(0, 99999);
  } else {
    textField.select();
  }
  document.execCommand("copy");
  textField.remove();
};

export const formatBigNumber = (num) => {
  const remainder = num.mod(1e14);
  return commify(formatEther(num.sub(remainder)));
};

export const truncateAddress = (address) =>
  `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;

export const formatAmount = (n) => {
  if (n < 1e4) return `${currency(n, { separator: ",", symbol: "" }).format()}`;
  if (n >= 1e4 && n < 1e6) return `${parseFloat((n / 1e3).toFixed(2))}K`;
  if (n >= 1e6 && n < 1e9) return `${parseFloat((n / 1e6).toFixed(2))}M`;
  if (n >= 1e9 && n < 1e12) return `${parseFloat((n / 1e9).toFixed(2))}B`;
  if (n >= 1e12) return `${parseFloat((n / 1e12).toFixed(2))}T`;

  return "";
};

export const getMidPrice = async (
  connex,
  baseToken,
  quoteToken,
  baseDecimal = 18,
  quoteDecimal = 18,
  chainId = CHAIN_ID.mainnet
) => {
  let base = new Token(chainId, baseToken, baseDecimal);
  let quote = new Token(chainId, quoteToken, quoteDecimal);
  let pair = await Fetcher.fetchPairData(quote, base, connex);
  let route = new Route([pair], base);
  let base2quote = route.midPrice.toSignificant(6);
  let quote2base = route.midPrice.invert().toSignificant(6);
  return {
    base2quote: parseFloat(base2quote),
    quote2base: parseFloat(quote2base),
    pair,
  };
};

export const formatCurrency = (n) => numeral(n).format("$0,0.00");
