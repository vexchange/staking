import { useMemo } from 'react'
import moment from 'moment'
import { BigNumber } from '@ethersproject/bignumber'

import { Subtitle, Title, PrimaryText } from '../../design'
import { formatBigNumber } from '../../utils'

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

import { ExternalIcon } from '../Icons'

export default function Overview() {
  const totalRewardDistributed = useMemo(() => {
    const totalDistributed = BigNumber.from(0)

    return formatBigNumber(totalDistributed, 18)
  }, [])

  const numHolderText = useMemo(() => 10, [])

  const timeTillProgramsEnd = useMemo(() => {
    const endStakeReward = moment
      .utc('2021-07-17')
      .set('hour', 10)
      .set('minute', 30)

    if (endStakeReward.diff(moment()) <= 0) {
      return 'End of Rewards'
    }

    // Time till next stake reward date
    const startTime = moment.duration(
      endStakeReward.diff(moment()),
      'milliseconds',
    )

    return `${startTime.days()}D ${startTime.hours()}H ${startTime.minutes()}M`
  }, [])

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
          The program aims to grow vault adjusted TVL, expand the voting power
          to those who missed out on the airdrop and to distribute the
          governance token to those who have the most skin in the game. The
          program ends on July 19th, 2021.
        </OverviewDescription>
        <UnderlineLink
          href="https://ribbonfinance.medium.com/rgp-2-liquidity-mining-program-cc81f0b7a270"
          target="_blank"
          rel="noreferrer noopener"
        >
          <a className="d-flex mt-4">
            <PrimaryText fontSize={14} className="mr-2">
              Learn more about our liquidity mining program
            </PrimaryText>
            <ExternalIcon color="white" />
          </a>
        </UnderlineLink>
      </OverviewInfo>
      <OverviewKPIContainer>
        <OverviewKPI>
          <OverviewLabel>$VEX Distributed</OverviewLabel>
          <Title>{totalRewardDistributed}</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>No. of $VEX Holders</OverviewLabel>
          <Title>{numHolderText}</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>Time till programs end</OverviewLabel>
          <Title>{timeTillProgramsEnd}</Title>
        </OverviewKPI>
      </OverviewKPIContainer>
    </OverviewContainer>
  )
}
