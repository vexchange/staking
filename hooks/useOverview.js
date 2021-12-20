import { useAppContext } from "../context/app";
import { useEffect, useState } from "react";
import { Fetcher, Token, Route } from "vexchange-sdk";
import {
  CHAIN_ID,
  REWARD_TOKEN_ADDRESSES,
  STAKING_TOKEN_ADDRESSES,
  VECHAIN_NODE,
  WVET_ADDRESS,
} from "../constants";
import { find } from "lodash";
import { BigNumber, ethers } from "ethers";
import MultiRewards from "../constants/abis/MultiRewards";
import { parseUnits } from "ethers/lib/utils";
import CoinGecko from "coingecko-api";
import IERC20 from "../constants/abis/IERC20";
import useFetchStakingPoolsData from "./useFetchStakingPoolsData";
import { calculateAprAndTvl } from "../utils";

const useOverview = () => {
  const [usdPerVet, setUsdPerVet] = useState(0);
  const [vexPerVet, setVexPerVet] = useState(0);
  const [usdPerVex, setUsdPerVex] = useState(0);
  const [tvlInUsd, setTvlInUsd] = useState(0);
  const [pair, setPair] = useState(null);

  /**
   * This is a percentage in BigNumber representation
   * i.e. 20% will be represented as 20_000_000_000_000_000_000
   */
  const [apr, setApr] = useState(0);
  const { connex } = useAppContext();
  const { poolsData } = useFetchStakingPoolsData();

  const getMidPrice = async (
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

  const calculateIndividualTokenPrices = async () => {
    if (!connex) return;

    const cgClient = new CoinGecko();

    try {
      const res = await cgClient.simple.price({
        ids: ["vechain"],
        vs_currencies: ["usd"],
      });
      const data = res.data.vechain.usd;
      const usdPerVet = parseFloat(data);
      setUsdPerVet(usdPerVet);

      const result = await getMidPrice(
        connex,
        WVET_ADDRESS[VECHAIN_NODE],
        REWARD_TOKEN_ADDRESSES[VECHAIN_NODE]
      );

      const vexPerVet = result.base2quote;
      const usdPerVex = usdPerVet / vexPerVet;
      setVexPerVet(vexPerVet);
      setUsdPerVex(usdPerVex);

      const pair = result.pair;
      setPair(pair);
    } catch (error) {
      console.error("Error fetching", error);
    }
  };

  useEffect(calculateIndividualTokenPrices, [connex]);

  return { usdPerVex, apr, tvlInUsd };
};

export default useOverview;
