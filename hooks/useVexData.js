import { useAppContext } from "../context/app";
import { useEffect, useState } from "react";
import {
  VECHAIN_NODE,
  VEX_ADDRESS,
  WVET_ADDRESS,
} from "../constants";
import useOverview from "./useOverview";
import { getMidPrice } from "../utils";

const useVexData = () => {
  const [usdPerVex, setUsdPerVex] = useState(0);
  const { usdPerVet } = useOverview()
  const { connex, tick } = useAppContext();

  const calculateVexTokenPrices = async () => {
    if (!connex && !usdPerVet) return;

    try {
      const result = await getMidPrice(
        connex,
        WVET_ADDRESS[VECHAIN_NODE],
        VEX_ADDRESS[VECHAIN_NODE]
      );

      const vexPerVet = result.base2quote;
      const usdPerVex = usdPerVet / vexPerVet;

      setUsdPerVex(usdPerVex);
    }
    catch (error) {
      console.error("Error fetching", error);
    }
  };

  useEffect(calculateVexTokenPrices, [connex, tick]);

  return { usdPerVex };
};

export default useVexData;
