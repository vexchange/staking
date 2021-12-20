import { useMemo } from 'react'
import { Subtitle, Title, PrimaryText } from '../../design'
import useOverview from '../../hooks/useOverview'
import useTextAnimation from '../../hooks/useTextAnimation'
import { formatBigNumber, formatAmount } from "../../utils";
import { ExternalIcon } from '../Icons'
import { formatEther } from "ethers/lib/utils";
import {
  OverviewContainer,
  OverviewDescription,
  OverviewInfo,
  OverviewKPI,
  OverviewKPIContainer,
  OverviewLabel,
  OverviewTag,
  UnderlineLink,
} from './styled'
import { VECHAIN_NODE } from '../../constants';

export default function Overview() {
  return null
  const { usdPerVex, apr, tvlInUsd } = VECHAIN_NODE === 'mainnet'
    ? useOverview()
    : { usdPerVex: 1, apr: 1, tvlInUsd: 1 }
  const loadingText = useTextAnimation(true)
  const vexPrice = useMemo(() => {
    if (!usdPerVex) {
      return loadingText
    }

    return ('$' + usdPerVex.toPrecision(4))
  }, [loadingText, usdPerVex])

  const percentageAPR = useMemo(() => {
    if (!apr) return loadingText

    // return apr
    if (apr._isBigNumber) return formatBigNumber(apr)
    else return apr

  }, [apr])

  const usdValueStaked = useMemo( () => {
    if (!tvlInUsd) {
      return loadingText;
    }

    if (tvlInUsd._isBigNumber) return '$' + formatAmount(formatEther(tvlInUsd))
    else return tvlInUsd
  }, [tvlInUsd])

  return (
    <OverviewContainer>
      <OverviewInfo>
        <OverviewTag>
          <Subtitle style={{ textTransform: 'uppercase' }}>
            Staking on Vexchange
          </Subtitle>
        </OverviewTag>
        <Title className="mt-3 w-100">Liquidity Mining Program</Title>
        <OverviewDescription className="mt-3 w-100">
          The program aims to incentivize VEX liquidity, expand the voting power to those who miss out on the airdrop and to distribute the governance token to those who have the most skin in the game.
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
      {/* <OverviewKPIContainer>
        <OverviewKPI>
          <OverviewLabel>VEX Price</OverviewLabel>
          <Title>{vexPrice}</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>Estimated APR</OverviewLabel>
          <Title>{percentageAPR} %</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>USD Value Staked</OverviewLabel>
          <Title>{usdValueStaked}</Title>
        </OverviewKPI>
      </OverviewKPIContainer> */}
    </OverviewContainer>
  )
}
