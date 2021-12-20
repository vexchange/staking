import { BigNumber, ethers, utils } from "ethers";
import currency from "currency.js";
import {
  CHAIN_ID,
  NUM_SECONDS_IN_A_YEAR,
  VECHAIN_NODE,
  VEX_ADDRESS,
  WVET_ADDRESS,
} from "../constants";
import IERC20 from "../constants/abis/IERC20";
import { parseUnits } from "ethers/lib/utils";
import { find } from "lodash";
import MultiRewards from "../constants/abis/MultiRewards";
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
    const savedAccount = localStorage.getItem(`staking-wallet-${VECHAIN_NODE}`);
    return savedAccount ?? account;
  },
  set: (account) => {
    localStorage.setItem(`staking-wallet-${VECHAIN_NODE}`, account);
  },
  remove: () => {
    localStorage.removeItem(`staking-wallet-${VECHAIN_NODE}`);
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

export const calculateAprAndTvl = async (
  connex,
  vaultOption,
  stakingPoolData,
  rewardsContract
) => {
  if (
    !connex ||
    stakingPoolData.poolData.loading ||
    !vaultOption.rewardsAddress[VECHAIN_NODE]
  )
    return;

  try {

    const rewardDataABI = find(MultiRewards, { name: "rewardData" });
    let method = rewardsContract.method(rewardDataABI);
    let res = await method.call(vaultOption.rewardsAddress[VECHAIN_NODE]);
    const rewardRate = ethers.BigNumber.from(res.decoded.rewardRate);
    const totalSupplyABI = find(IERC20, { name: "totalSupply" });

    method = connex.thor
      .account(vaultOption.stakingTokenAddress[VECHAIN_NODE])
      .method(totalSupplyABI);
    res = await method.call();

    const totalLPTokenSupply = BigNumber.from(res.decoded[0]);
    const numberOfLPTokensStaked = stakingPoolData.poolData.poolSize;

    const result = await getMidPrice(
      connex,
      WVET_ADDRESS.mainnet,
      VEX_ADDRESS.mainnet
    );

    const pair = result.pair;

    // This is calculated in the amount of vex tokens instead of usd
    const tokenTvl = pair.tokenAmounts[0].toFixed(18);
    // Multiply by two to get the pool TVL as this is a 50-50 pool
    const poolTvl = parseUnits(tokenTvl, 18).mul(2);
    const usdPerVex = 1; // TODO: what value should it be?

    const apr = rewardRate
      .mul(NUM_SECONDS_IN_A_YEAR)
      .mul(parseUnits("1", "ether")) // More units for precision
      .mul(100) // Convert into percentage
      // The following two lines take into account
      // that not all LP tokens are staked on the staking site
      .mul(totalLPTokenSupply)
      .div(numberOfLPTokensStaked)
      // We divide all the rewards by the total VEX TVL
      .div(poolTvl);

    const usdValuePoolSize =
      poolTvl
        .mul(parseUnits(usdPerVex.toString()))
        .mul(numberOfLPTokensStaked)
        .div(totalLPTokenSupply)
        .div(parseUnits("1", "ether"))
    ;

    console.log(usdValuePoolSize)

    const usdValueStaked = formatBigNumber(
      usdValuePoolSize
        .mul(stakingPoolData.userData.currentStake)
        .div(stakingPoolData.poolData.poolSize)
    );

    // TODO: do the proper math
    return { apr, usdValueStaked, usdValuePoolSize };
    // return { apr: 1, usdValueStaked: 1, usdValuePoolSize: 1 };
  } catch (err) {
    console.log(err)
    return { apr: 1, usdValueStaked: 1, usdValuePoolSize: 1 }
  }
};

export const formatCurrency = (n) => numeral(n).format("$0,0.00");
