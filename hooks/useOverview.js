import { useAppContext } from "../context/app";
import { useEffect, useState } from "react";
import { Fetcher, Token, Route } from "vexchange-sdk";
import {
  CHAIN_ID,
  STAKING_POOLS,
  VECHAIN_NODE,
  WVET_ADDRESS,
} from "../constants";
import CoinGecko from "coingecko-api";
import { getMidPrice } from "../utils";

const useOverview = () => {
  const [usdPerVet, setUsdPerVet] = useState(0);
  const [poolInfo, setPoolInfo] = useState(null);
  const { connex, tick } = useAppContext();

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

      let poolInfo = [];
      await Promise.all(
        STAKING_POOLS.map(async (stakingPool) => {
          const result = await getMidPrice(
            connex,
            WVET_ADDRESS[VECHAIN_NODE],
            stakingPool.rewardTokens[0].address[VECHAIN_NODE]
          );

          const tokenPerVet = result.base2quote;
          const usdPerToken = usdPerVet / tokenPerVet;
          const pair = result.pair;

          poolInfo[stakingPool.id] = {
            tokenPerVet,
            usdPerToken,
            pair,
          };
        })
      );

      setUsdPerVet(usdPerVet);
      setPoolInfo(poolInfo);
    } catch (error) {
      console.error("Error fetching", error);
    }
  };

  useEffect(calculateIndividualTokenPrices, [connex, tick]);

  return { usdPerVet, poolInfo };
};

export default useOverview;
