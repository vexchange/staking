import { useAppContext } from "../context/app";
import { useEffect, useState } from "react";
import {
  CHAIN_ID,
  STAKING_POOLS, VECHAIN_NETWORK,
} from "../constants";
import { Fetcher } from "vexchange-sdk";

const useOverview = () => {
  const [poolInfo, setPoolInfo] = useState(null);
  const { connex, tick } = useAppContext();

  const fetchPairInfo = async () => {
    if (!connex) return;

    try {
      let poolInfo = [];
      STAKING_POOLS.map(async (stakingPool) => {

        const [token0, token1] = await Promise.all([
            Fetcher.fetchTokenData(CHAIN_ID[VECHAIN_NETWORK],
            stakingPool.stakeAssetUrlPart.split("-")[0],
            connex),
            Fetcher.fetchTokenData(CHAIN_ID[VECHAIN_NETWORK],
            stakingPool.stakeAssetUrlPart.split("-")[1],
            connex)
        ]);

        const pair = await Fetcher.fetchPairData(
            token0,
            token1,
            connex);

        poolInfo[stakingPool.id] = {
          pair,
        };
      })

      setPoolInfo(poolInfo);
    }
    catch (error) {
      console.error("Error fetching", error);
    }
  };

  useEffect(fetchPairInfo, [connex, tick]);

  return { poolInfo };
};

export default useOverview;
