import { useMemo } from 'react'
import moment from 'moment'
import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { FullVaultList, REWARD_TOKEN_ADDRESSES } from '../../constants'
import { Subtitle, Title, PrimaryText } from '../../design'
import { formatBigNumber } from '../../utils'
import useAPR from '../../hooks/useAPR'
import useFetchStakingPoolData from "../../hooks/useFetchStakingPoolData";
import useTextAnimation from '../../hooks/useTextAnimation'
import useStakingPool from '../../hooks/useStakingPool'

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
  const { stakingPools, loading: stakingLoading } = useStakingPool('vex-vet')
  const { apr } = useAPR()
  const { poolData } = useFetchStakingPoolData()
  const loadingText = useTextAnimation(stakingLoading)


  const totalRewardDistributed = useMemo(() => {
    if (stakingLoading) {
      return loadingText
    }

    let totalDistributed = BigNumber.from(0)

    for (let i = 0; i < FullVaultList.length; i++) {
      const stakingPool = stakingPools[FullVaultList[i]]
      if (!stakingPool) {
        continue
      }
      totalDistributed = totalDistributed.add(stakingPool.totalRewardClaimed)
    }

    return ethers.utils.formatEther(totalDistributed)
  }, [stakingLoading, loadingText, stakingPools])

  const percentageAPR = useMemo(() => {
    if (!apr) {
      return loadingText
    }
    return apr
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
          href="https://ribbonfinance.medium.com/rgp-2-liquidity-mining-program-cc81f0b7a270"
          target="_blank"
          rel="noreferrer noopener"
        >
          <div className="d-flex mt-4">
            <PrimaryText fontSize={14} className="mr-2">
              To change to link to our medium article?
            </PrimaryText>
            <ExternalIcon color="white" />
          </div>
        </UnderlineLink>
      </OverviewInfo>
      <OverviewKPIContainer>
        <OverviewKPI>
          <OverviewLabel>$VEX Distributed</OverviewLabel>
          <Title>{totalRewardDistributed}</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>Estimated APR</OverviewLabel>
          <Title>{percentageAPR} %</Title>
        </OverviewKPI>
        <OverviewKPI>
          <OverviewLabel>Time till program ends</OverviewLabel>
          <Title>{timeTillProgramsEnd}</Title>
        </OverviewKPI>
      </OverviewKPIContainer>
    </OverviewContainer>
  )
}
