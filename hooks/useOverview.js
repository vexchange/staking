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
        const result = await getMidPrice(
          connex,
          stakingPool.stakeAssetUrlPart.split("-")[0],
          stakingPool.stakeAssetUrlPart.split("-")[1]
        );

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
