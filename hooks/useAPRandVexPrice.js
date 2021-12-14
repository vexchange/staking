import { useAppContext } from "../context/app";
import { useEffect, useState } from "react";
import { Fetcher, Token, Route } from "vexchange-sdk";
import { CHAIN_ID, REWARD_TOKEN_ADDRESSES, STAKING_TOKEN_ADDRESSES, VECHAIN_NODE, WVET_ADDRESS } from "../constants";
import { find } from "lodash";
import { BigNumber, ethers } from "ethers";
import MultiRewards from "../constants/abis/MultiRewards";
import { parseUnits } from "ethers/lib/utils";
import CoinGecko from 'coingecko-api';
import IERC20 from "../constants/abis/IERC20";
import useFetchStakingPoolsData from "./useFetchStakingPoolsData";

const useAPRandVexPrice = () => {
    const NUM_SECONDS_IN_A_YEAR = parseFloat(31536000);
    const [usdPerVet, setUsdPerVet] = useState(0)
    const [vexPerVet, setVexPerVet] = useState(0)
    const [usdPerVex, setUsdPerVex] = useState(0)
    const [tvlInUsd, setTvlInUsd] = useState(0)
    const [pair, setPair] = useState(null)

    /**
     * This is a percentage in BigNumber representation
     * i.e. 20% will be represented as 20_000_000_000_000_000_000
     */
    const [apr, setApr] = useState(0)
    const { connex, rewardsContract } = useAppContext()
    const { poolsData } = useFetchStakingPoolsData()

    const getMidPrice = async(
        connex,
        baseToken,
        quoteToken,
        baseDecimal = 18,
        quoteDecimal = 18,
        chainId = CHAIN_ID.mainnet,
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
            pair
        }
    }

    const calculateIndividualTokenPrices = async () => {
        if (!connex) return;

        const cgClient = new CoinGecko();

        try {
            const res = await cgClient.simple.price({
                ids: ['vechain'],
                vs_currencies: ['usd']
            })
            const data = res.data.vechain.usd
            const usdPerVet = parseFloat(data)
            setUsdPerVet(usdPerVet)

            const result = await getMidPrice(
                connex,
                WVET_ADDRESS[VECHAIN_NODE],
                REWARD_TOKEN_ADDRESSES[VECHAIN_NODE]
            );

            const vexPerVet = result.base2quote;
            const usdPerVex = usdPerVet / vexPerVet
            setVexPerVet(vexPerVet);
            setUsdPerVex(usdPerVex);

            const pair = result.pair;
            setPair(pair)
        } catch (error) {
            console.error("Error fetching", error)
        }
    }

    useEffect(calculateIndividualTokenPrices, [connex])

    const calculateApr = async () => {
        if (!rewardsContract || !pair || poolsData.poolSize.eq('0') ||
            !connex || !usdPerVex) return;

        const rewardDataABI = find(MultiRewards, { name: 'rewardData' });
        let method = rewardsContract.method(rewardDataABI);
        let res = await method.call(REWARD_TOKEN_ADDRESSES[VECHAIN_NODE]);
        const rewardRate = ethers.BigNumber.from(res.decoded.rewardRate);

        try {
            const totalSupplyABI = find(IERC20, { name: 'totalSupply' })
            method = connex.thor.account(STAKING_TOKEN_ADDRESSES[VECHAIN_NODE]).method(totalSupplyABI)
            res = await method.call()

            const totalLPTokenSupply = BigNumber.from(res.decoded[0])
            const numberOfLPTokensStaked = poolsData.poolSize;

            console.assert(numberOfLPTokensStaked.lte(totalLPTokenSupply),
                "Staking Pool Size greater than total LP token supply. Something's wrong")

            // This is calculated in the amount of vex tokens instead of usd
            const vexTvl = pair.tokenAmounts[0].toFixed(18)
            // Multiply by two to get the pool TVL as this is a 50-50 pool
            const tvlInVex = parseUnits(vexTvl, 18).mul(2)

            const apr = rewardRate.mul(NUM_SECONDS_IN_A_YEAR)
                                  .mul(parseUnits('1','ether')) // More units for precision
                                  .mul(100) // Convert into percentage
                                  // The following two lines take into account
                                  // that not all LP tokens are staked on the staking site
                                  .mul(totalLPTokenSupply)
                                  .div(numberOfLPTokensStaked)
                                  // We divide all the rewards by the total VEX TVL
                                  .div(tvlInVex)
            setApr(apr)

            const tvlInUsd = tvlInVex.mul(parseUnits(usdPerVex.toString()))
                                .mul(numberOfLPTokensStaked)
                                .div(totalLPTokenSupply)
                                .div(parseUnits('1', 'ether'))

            setTvlInUsd(tvlInUsd)
        }
        catch (error) {
            console.error("Error in calculateApr", error)
            setApr('TBD')
            setTvlInUsd('TBD')
        }
    }

    useEffect(calculateApr, [connex, rewardsContract, pair, poolsData, usdPerVex])

    return { usdPerVex, apr, tvlInUsd }
}

export default useAPRandVexPrice
