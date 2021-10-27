import { useCallback, useState, useMemo } from 'react'
import moment from 'moment'
import { find } from 'lodash'

import { formatBigNumber } from '../../utils'

import { REWARDS_ADDRESSES } from '../../constants/'
import MultiRewards from '../../constants/abis/MultiRewards.json'
import { useTransactions } from '../../context/transactions'
import { useAppContext } from '../../context/app'

import { BaseModalContentColumn, BaseUnderlineLink, SecondaryText } from '../../design'
import colors from '../../design/colors'

import { ActionButton } from '../Button'
import VEXClaimModalContent from '../VEXModalClaimContent'
import Modal from '../Modal'
import Logo from '../Logo'
import { ExternalIcon } from '../Icons'

import {
  AssetTitle,
  InfoColumn,
  InfoData,
  LogoContainer,
  WarningText,
} from './styled'
import { ethers } from 'ethers'

export default function ClaimModal({
  show,
  onClose,
  stakingPoolData,
  vaultOption,
}) {
  const { addTransaction } = useTransactions()
  const { connex } = useAppContext()
  const [step, setStep] = useState('info')

  const exitABI = find(MultiRewards.abi, { name: 'exit' })
  const method = connex?.thor
    .account(REWARDS_ADDRESSES.testnet)
    .method(exitABI)
  const clause = method?.asClause()

  const handleClose = useCallback(() => {
    onClose()
    if (step === 'claim' || step === 'claimed') {
      setStep('info')
    }
  }, [onClose, step])

  const handleClaim = useCallback(async () => {
    setStep('claim')

    try {
      const response = await connex.vendor
        .sign('tx', [{ ...clause }])
        .comment(`Claim ${ethers.utils.formatEther(stakingPoolData.claimableVex)}`)
        .request()

      setStep('claiming')

      const txhash = response.txid

      addTransaction({
        txhash,
        type: 'rewardClaim',
        amount: ethers.utils.formatEther(stakingPoolData.claimableVex),
        stakeAsset: vaultOption,
      })

      await connex.vendor.waitForTransaction(txhash, 5)
      setStep('claimed')
    } catch (err) {
      setStep('info')
    }
  }, [
    addTransaction,
    connex,
    clause,
    stakingPoolData,
    vaultOption,
  ])

  const timeTillNextRewardWeek = useMemo(() => {
    const startDate = moment
      .utc('2021-06-18')
      .set('hour', 10)
      .set('minute', 30)

    let weekCount

    if (moment().diff(startDate) < 0) {
      weekCount = 1
    } else {
      weekCount = moment().diff(startDate, 'weeks') + 2
    }

    // Next stake reward date
    const nextStakeReward = startDate.add(weekCount - 1, 'weeks')

    const endStakeReward = moment
      .utc('2021-07-16')
      .set('hour', 10)
      .set('minute', 30)

    if (endStakeReward.diff(moment()) <= 0) {
      return 'End of Rewards'
    }

    // Time till next stake reward date
    const startTime = moment.duration(
      nextStakeReward.diff(moment()),
      'milliseconds'
    )

    return `${startTime.days()}D ${startTime.hours()}H ${startTime.minutes()}M`
  }, [])


  const body = useMemo(() => {
    const color = colors.orange

    switch (step) {
      case 'info':
        const periodFinish = stakingPoolData.periodFinish
          ? moment(stakingPoolData.periodFinish, 'X')
          : undefined;
        return (
          <>
            <BaseModalContentColumn>
              <LogoContainer color={color}>
                <Logo />
              </LogoContainer>
            </BaseModalContentColumn>
            <BaseModalContentColumn marginTop={8}>
              <AssetTitle str="vex-vet">vex-vet</AssetTitle>
            </BaseModalContentColumn>
            <InfoColumn marginTop={40}>
              <SecondaryText>Unclaimed $VEX</SecondaryText>
              <InfoData>
                {ethers.utils.formatEther(stakingPoolData.claimableVex)}
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <SecondaryText>Claimed $VEX</SecondaryText>
              <InfoData>
                {/* {formatBigNumber(BigNumber.from('22'))} */}
                22
              </InfoData>
            </InfoColumn>
            <InfoColumn>
              <SecondaryText>Time till next reward</SecondaryText>
              <InfoData>{timeTillNextRewardWeek}</InfoData>
            </InfoColumn>
            <InfoColumn>
              <div className="d-flex align-items-center">
                <SecondaryText>Pool rewards</SecondaryText>
              </div>
              <InfoData>
                {/* {formatBigNumber(stakingPoolData.poolRewardForDuration, 18)} VEX */}
                22 VEX
              </InfoData>
            </InfoColumn>
            <BaseModalContentColumn marginTop="auto">
              <BaseUnderlineLink
                href="https://ribbonfinance.medium.com/rbn-airdrop-distribution-70b6cb0b870c"
                target="_blank"
                rel="noreferrer noopener"
                className="d-flex align-items-center"
              >
                <>
                  <SecondaryText>Read about $VEX</SecondaryText>
                  <ExternalIcon className="ml-1" />
                </>
              </BaseUnderlineLink>
            </BaseModalContentColumn>
            {periodFinish && periodFinish.diff(moment()) > 0 ? (
              <ModalContentExtra>
                <WarningText color={color}>
                  In order to claim your VEX rewards you must remain staked
                  until the end of the liquidity mining program (
                  {periodFinish.format("MMM Do, YYYY")}
                  ).
                </WarningText>
              </ModalContentExtra>
            ) : (
              <BaseModalContentColumn>
                <ActionButton
                  className="btn py-3 mb-2"
                  onClick={handleClaim}
                  color={color}
                  disabled={stakingPoolData.claimableVex.isZero()}
                >
                  {"Unstake & Claim"}
                </ActionButton>
              </BaseModalContentColumn>
            )}
          </>
        )
      default:
        return <VEXClaimModalContent step={step} />
    }
  }, [
    step,
    vaultOption,
    stakingPoolData,
    handleClaim,
    timeTillNextRewardWeek,
  ])

  return (
    <Modal
      show={show}
      onClose={handleClose}
      height={580}
      backButton={
        step === 'preview' ? { onClick: () => setStep('form') } : undefined
      }
      // headerBackground={step !== 'warning' && step !== 'form'}
    >
      {body}
    </Modal>
  )
}
