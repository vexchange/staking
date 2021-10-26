import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";

import { RibbonStakingRewards } from "../codegen";
import { RibbonStakingRewardsFactory } from "../codegen/RibbonStakingRewardsFactory";
import { VaultLiquidityMiningMap, VaultOptions } from "../constants/constants";
import { useAppContext } from "../context/app";

export const getStakingReward = (library, vaultOption, useSigner = true) => {
  const provider = useSigner ? library.getSigner() : library;

  if (!VaultLiquidityMiningMap[vaultOption]) {
    return null;
  }

  return RibbonStakingRewardsFactory.connect(
    VaultLiquidityMiningMap[vaultOption]!,
    provider
  );
};

const useStakingReward = vaultOption => {
  const { connex } = useAppContext()
  const [stakingReward, setStakingReward] =
    useState<RibbonStakingRewards | null>(null);

  useEffect(() => {
    if (connex) {
      const vault = getStakingReward(library || provider, vaultOption, active);
      setStakingReward(vault);
    }
  }, [connex, active, library, vaultOption]);

  return stakingReward;
};

export default useStakingReward;
