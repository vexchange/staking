import { useAppContext } from "../context/app";
import { useEffect, useState } from "react";
import {
  STAKING_POOLS,
} from "../constants";
import { getMidPrice } from "../utils";

const useOverview = () => {
  const [poolInfo, setPoolInfo] = useState(null);
  const { connex, tick } = useAppContext();

  const fetchPairInfo = async () => {
    if (!connex) return;

    try {
      let poolInfo = [];
      STAKING_POOLS.map(async (stakingPool) => {
        let result;
        if (stakingPool.id == 1)
        {
          result = await getMidPrice(
              connex,
              stakingPool.stakeAssetUrlPart.split("-")[0],
              stakingPool.stakeAssetUrlPart.split("-")[1],
              6, // band-aid fix for the VeUSD 6 decimal places problem, to refactor
          );
        }
        else
        {
          result = await getMidPrice(
              connex,
              stakingPool.stakeAssetUrlPart.split("-")[0],
              stakingPool.stakeAssetUrlPart.split("-")[1],
          );
        }

        const pair = result.pair;

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
