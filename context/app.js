import { createContext, useRef, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { STAKING_POOLS, VECHAIN_NODE } from "../constants";
import { userAccount } from "../utils";

const AppContext = createContext({});

export const useAppContext = () => useContext(AppContext);
export function AppStateProvider({ children }) {
  const [connex, setConnex] = useState(null);
  const [account, setAccount] = useState(null);
  const [ticker, setTicker] = useState(null);
  const [tick, setTick] = useState(null);
  const [connexStakingPools, setConnexStakingPools] = useState(null);
  const ref = useRef(connex);

  useEffect(() => {
    ref.current = connex;
  });

  useEffect(() => {
    const initConnex = async () => {
      try {
        const { Connex } = await import("@vechain/connex");
        const _connex = new Connex({
          node: `https://${VECHAIN_NODE}.veblocks.net/`,
          network: VECHAIN_NODE === "testnet" ? "test" : "main",
        });
        const _ticker = _connex.thor.ticker();
        setConnex(_connex);
        setTicker(_ticker);
        const account = userAccount.get();
        if (account) {
          setAccount(account);
        }
        const connexStakingPools = {};
        STAKING_POOLS.map((stakingPool) => {
          connexStakingPools[stakingPool.id] = {
            stakingTokenContract: _connex.thor.account(
              stakingPool.stakingTokenAddress[VECHAIN_NODE]
            ),
            rewardsContract: _connex.thor.account(
              stakingPool.rewardsAddress[VECHAIN_NODE]
            ),
          };
        });
        setConnexStakingPools(connexStakingPools);
      } catch (error) {
        console.warn(`Unable to get connex: ${error}`);
      }
    };

    if (!connex) {
      initConnex();
    }
  }, [connex]);

  useEffect(async () => {
    if (ticker) {
      let _tick = await ticker.next();
      setTick(_tick);
    }
  }, [ticker, tick]);

  const initAccount = async () => {
    const _connex = ref.current;
    const sign = _connex.vendor.sign("cert", {
      purpose: "identification",
      payload: {
        type: "text",
        content: "Select account to sign certificate",
      },
    });
    try {
      const { annex } = await sign.request();
      setAccount(annex.signer);
      userAccount.set(annex.signer);
    } catch (error) {
      console.warn(`Unable to get account: ${error}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        connex,
        account,
        initAccount,
        ticker,
        tick,
        connexStakingPools,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

AppStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
