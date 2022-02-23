import { BigNumber, utils } from "ethers";
import {useEffect, useMemo} from "react";
import { Subtitle, Title, PrimaryText } from "../../design";
import useFetchStakingPoolsData from "../../hooks/useFetchStakingPoolsData";
import useTokenPriceData from "../../hooks/useTokenPriceData";
import { formatAmount, formatCurrency } from "../../utils";
import { ExternalIcon } from "../Icons";
import {
  OverviewContainer,
  OverviewDescription,
  OverviewInfo,
  OverviewKPI,
  OverviewKPIContainer,
  OverviewLabel,
  OverviewTag,
  UnderlineLink,
} from "./styled";
import {VECHAIN_NODE, VEX_ADDRESS} from "../../constants";

export default function Overview() {
  const { tokenPrices } = useTokenPriceData();
  const { poolData } = useFetchStakingPoolsData();
  const calculateTotalTvlUsd = useMemo(() => {
    let total = BigNumber.from(0);

    if (!poolData.length) return total;

    poolData.map((poolItem) => {
      total = total.add(poolItem.tvlInUsd);
    });

    return total;
  }, [poolData]);

  return (
    <OverviewContainer>
      <OverviewInfo>
        <OverviewTag>
          <Subtitle style={{ textTransform: "uppercase" }}>
            Staking on Vexchange
          </Subtitle>
        </OverviewTag>
        <Title className="mt-3 w-100">Liquidity Mining Program</Title>
        <OverviewDescription className="mt-3 w-100">
          The program aims to incentivize VEX liquidity, expand the voting power
          to those who miss out on the airdrop and to distribute the governance
          token to those who have the most skin in the game.
        </OverviewDescription>
        <UnderlineLink
          href="https://medium.com/@vexchange/vex-launch-information-9e14b9da4b64"
          target="_blank"
          rel="noreferrer noopener"
        >
          <div className="d-flex mt-4">
            <PrimaryText fontSize={14} className="mr-2">
              Read more about the VEX token
            </PrimaryText>
            <ExternalIcon color="white" />
          </div>
        </UnderlineLink>
      </OverviewInfo>
      <OverviewKPIContainer>
        <OverviewKPI>
          <OverviewLabel>VEX Price</OverviewLabel>
          <Title>
            {tokenPrices === null ? "Loading..." : formatCurrency(tokenPrices[VEX_ADDRESS[VECHAIN_NODE]].usdPrice)}
          </Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>USD Value Staked</OverviewLabel>
          <Title>
            {calculateTotalTvlUsd.gt(0)
              ? `$${formatAmount(utils.formatEther(calculateTotalTvlUsd))}`
              : "Loading..."}
          </Title>
        </OverviewKPI>
      </OverviewKPIContainer>
    </OverviewContainer>
  );
}
