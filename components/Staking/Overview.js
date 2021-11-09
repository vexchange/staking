import { useMemo } from 'react'
import moment from 'moment'
import { Subtitle, Title, PrimaryText } from '../../design'
import useAPRandVexPrice from '../../hooks/useAPRandVexPrice'
import useFetchStakingPoolData from "../../hooks/useFetchStakingPoolData";
import useTextAnimation from '../../hooks/useTextAnimation'
import useStakingPool from '../../hooks/useStakingPool'
import { formatBigNumber } from "../../utils";
import { ExternalIcon } from '../Icons'

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


export default function Overview() {
  const { stakingPools, loading: stakingLoading } = useStakingPool('vex-vet')
  const { usdPerVex, apr } = useAPRandVexPrice()
  const { poolData } = useFetchStakingPoolData()
  const loadingText = useTextAnimation(stakingLoading)


  const vexPrice = useMemo(() => {
    if (stakingLoading || !usdPerVex) {
      return loadingText
    }

    return ('$' + usdPerVex.toPrecision(4))
  }, [stakingLoading, loadingText, usdPerVex])

  const percentageAPR = useMemo(() => {
    if (!apr) {
      return loadingText
    }

    // return apr
    if (apr._isBigNumber) return formatBigNumber(apr)
    else return apr

  }, [apr])

  const timeTillProgramsEnd = useMemo( () => {
    if(!poolData.periodFinish) return

    const periodFinish = moment(poolData.periodFinish)
    let timeLeftDuration = moment.duration(periodFinish.diff(moment()))

    if (timeLeftDuration <= 0) {
      return 'End of Rewards'
    }

    const days = Math.floor( timeLeftDuration.asDays() )
    timeLeftDuration.subtract(moment.duration(days, 'days'))

    const hours = Math.floor( timeLeftDuration.asHours() )
    timeLeftDuration.subtract(moment.duration(hours, 'hours'))

    const minutes = Math.floor( timeLeftDuration.asMinutes() )

    return `${days}D ${hours}H ${minutes}M`
  }, [poolData])

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
      <OverviewKPIContainer>
        <OverviewKPI>
          <OverviewLabel>VEX Price</OverviewLabel>
          <Title>{vexPrice}</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>Estimated APR</OverviewLabel>
          <Title>{percentageAPR} %</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>Time till rewards adjust</OverviewLabel>
          <Title>{timeTillProgramsEnd}</Title>
        </OverviewKPI>
      </OverviewKPIContainer>
    </OverviewContainer>
  )
}
