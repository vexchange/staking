import { useAppContext } from "../context/app";
import { useEffect, useState } from "react";
import { Fetcher, Token, Route } from "vexchange-sdk";
import { REWARD_TOKEN_ADDRESSES, WVET_ADDRESS} from "../constants";
import { find } from "lodash";
import { ethers } from "ethers";
import MultiRewards from "../constants/abis/MultiRewards";
import { parseUnits } from "ethers/lib/utils";

const useAPR = () => {
    const API_ENDPOINT = "https://api.nomics.com/v1/currencies/ticker?key=c0d543cde170fa5cd3c090442bd3fd2dd9611feb&ids=VET&interval=1h"
    const NUM_SECONDS_IN_A_YEAR = parseFloat(31536000);
    const [usdPerVet, setUsdPerVet] = useState(0)
    const [vexPerVet, setVexPerVet] = useState(0)
    const [usdPerVex, setUsdPerVex] = useState(0)
    /** Note: this is the TVL of the LP on Vexchange
     * Not the TVL on the staking site itself
     * As we cannot guarantee that every single LP token
     * Is staked onto our Multirewards contract
     * If we want to refactor in the future
     * We need to take into account the number of LP tokens
     * In existence and the number of LP tokens staked
     */
    const [tvl, setTvl] = useState(0)
    const [apr, setApr] = useState(0)
    const { connex, rewardsContract } = useAppContext()

    const getMidPrice = async(
        connex,
        baseToken,
        quoteToken,
        baseDecimal = 18,
        quoteDecimal = 18,
        chainId = 1,
    ) => {
        if (chainId == undefined) {
            chainId = ChainId.MAINNET
        }

        let base = new Token(chainId, baseToken, baseDecimal);
        let quote = new Token(chainId, quoteToken, quoteDecimal);
        let pair = await Fetcher.fetchPairData(quote, base, connex);
        let route = await new Route([pair], base);
        let base2quote = await route.midPrice.toSignificant(6);
        let quote2base = await route.midPrice.invert().toSignificant(6);
        return {
            base2quote: parseFloat(base2quote),
            quote2base: parseFloat(quote2base),
            pair
        }
    }

    const calculateIndividualTokenPrices = async () => {
        if (!connex) return;

        // Debug Code
        // To remove for mainnet
        const { Connex } = await import('@vechain/connex')
        const _connex = new Connex({
            node: 'https://mainnet.veblocks.net/',
        })

        try {
            const res = await fetch(API_ENDPOINT, { mode: 'cors' })
            const data = await res.json()
            const usdPerVet = parseFloat(data[0].price)
            setUsdPerVet(usdPerVet)

            const result = await getMidPrice(_connex,
                // Base token
                WVET_ADDRESS.mainnet,
                // Using the VTHO mainnet token address
                // as a placeholder for now
                // TODO: replace with mainnet VEX token
                "0x0000000000000000000000000000456E65726779"
            );

            const vexPerVet = result.base2quote;
            const usdPerVex = usdPerVet / vexPerVet
            setVexPerVet(vexPerVet);
            setUsdPerVex(usdPerVex);

            const pair = result.pair;

            const vexAmountInPair = pair.tokenAmounts[0].toSignificant(10)
            const vetAmountInPair = pair.tokenAmounts[1].toSignificant(10)

            // The following two amounts should be roughly equivalent
            const vexValueInUSD = parseFloat(vexAmountInPair) * usdPerVex;
            const vetValueInUSD = parseFloat(vetAmountInPair) * usdPerVet;
            const lpTotalValueInUsd = vexValueInUSD + vetValueInUSD;
            setTvl(lpTotalValueInUsd)
        } catch (error) {
            console.error("Error fetching", error)
        }
    }

    useEffect(calculateIndividualTokenPrices, [connex])

    const calculateApr = async () => {
        if (!rewardsContract || !tvl || !usdPerVex) return;

        const rewardDataABI = find(MultiRewards, { name: 'rewardData'});
        let method = rewardsContract.method(rewardDataABI);
        let res = await method.call(REWARD_TOKEN_ADDRESSES.testnet);
        const rewardRate = ethers.BigNumber.from(res.decoded.rewardRate);
        try {
            const apr = rewardRate.mul(NUM_SECONDS_IN_A_YEAR)
                .div(parseUnits('1', 'ether')).toNumber() * usdPerVex / tvl * 100

            // Display to 1 decimal point
            setApr(apr.toFixed(1))
        }
        catch (error) {
            console.error("Error in calculateApr", error)
            setApr('TBD')
        }
    }

    useEffect(calculateApr, [usdPerVex, tvl, rewardsContract])

    return { apr }
}

export default useAPR
