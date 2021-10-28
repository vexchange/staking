import { useCallback, useMemo, useState } from 'react'
import { ethers, constants, utils } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import moment from 'moment'

import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'
import { Subtitle, BaseIndicator, SecondaryText } from '../../design'
import colors from '../../design/colors'

import useTextAnimation from '../../hooks/useTextAnimation'

import CapBar from '../CapBar'
import Logo from '../Logo'

import {
  ClaimableTokenAmount,
  ClaimableTokenPill,
  ClaimableTokenPillContainer,
  LogoContainer,
  PoolRewardData,
  PoolSubtitle,
  PoolCardFooter,
  PoolCardFooterButton,
  PoolTitle,
  Wrapper,
} from './styled'

export default function PoolCard({
  stakingPoolData,
  setModal,
  setIsStakeAction,
}) {
  const { transactions } = useTransactions()
  const { account, initAccount } = useAppContext()

  const color = colors.orange

  const ongoingTransaction = useMemo(() => {
    const ongoingTx = (transactions ||[]).find(currentTx =>
      ['stakingApproval', 'stake', 'unstake', 'rewardClaim'].includes(
        currentTx.type
      ) && currentTx.stakeAsset === 'vex-vet' && !currentTx.status
    )

    if (!ongoingTx) {
      return undefined;
    }

    return ongoingTx.type
  }, [transactions]);

  const actionLoadingTextBase = useMemo(() => {
    switch (ongoingTransaction) {
      case 'stake':
        return 'Staking'
      case 'stakingApproval':
        return 'Approving'
      case 'unstake':
        return 'Unstaking'
      case 'rewardClaim':
        return 'Claiming'
      default:
        return 'Loading'
    }
  }, [ongoingTransaction])

  const renderUnstakeBalance = useCallback(() => {
    if (!account) {
      return '---'
    }

    return ethers.utils.formatEther(stakingPoolData.unstakedBalance)
  }, [account, stakingPoolData])

  const primaryActionLoadingText = useTextAnimation(
    Boolean(ongoingTransaction),
    {
      texts: [
        actionLoadingTextBase,
        `${actionLoadingTextBase} .`,
        `${actionLoadingTextBase} ..`,
        `${actionLoadingTextBase} ...`,
      ],
      interval: 250,
    }
  )

  const renderEstimatedRewards = useCallback(() => {
    if (!account || stakingPoolData.currentStake.isZero()) {
      return "---"
    }

    return ethers.utils.formatEther(
      stakingPoolData.currentStake
        .mul(BigNumber.from(10).pow(18))
        .div(stakingPoolData.poolSize)
        .mul(stakingPoolData.poolRewardForDuration)
        .div(BigNumber.from(10).pow(18))
    )
  }, [account, stakingPoolData])

  const vexPill = useMemo(() => {
    if (
      moment(stakingPoolData.periodFinish, 'X').diff(moment()) &&
      stakingPoolData.claimableVex.isZero()
    ) {
      return (
        <ClaimableTokenPillContainer>
          <ClaimableTokenPill color={color}>
            <BaseIndicator
              size={8}
              color={color}
              className="mr-2"
              style={{ marginRight: '5px' }}
            />
            <Subtitle>AMOUNT CLAIMED</Subtitle>
            <ClaimableTokenAmount color={color} style={{ marginLeft: '8px' }}>
              {ethers.utils.formatEther(
                stakingPoolData.claimHistory.reduce(
                  (acc, curr) => acc.add(curr.amount),
                  BigNumber.from(0)
                )
              )}
            </ClaimableTokenAmount>
          </ClaimableTokenPill>
        </ClaimableTokenPillContainer>
      );
    }

    return (
      <ClaimableTokenPillContainer>
        <ClaimableTokenPill color={color}>
          <BaseIndicator
            size={8}
            color={color}
            className="mr-2"
            style={{ marginRight: '5px' }}
          />
          <Subtitle className="mr-2">EARNED $VEX</Subtitle>
            <ClaimableTokenAmount color={color} style={{ marginLeft: '8px' }}>
            {account
              ? ethers.utils.formatEther(stakingPoolData.claimableVex)
              : '---'}
          </ClaimableTokenAmount>
        </ClaimableTokenPill>
      </ClaimableTokenPillContainer>
    )
  }, [account, color, stakingPoolData])

  const stakingPoolButtons = useMemo(() => {
    if (!account) {
      return (
        <PoolCardFooterButton
          role="button"
          color={colors.orange}
          onClick={() => {
            initAccount()
          }}
          active={false}
        >
          CONNECT WALLET
        </PoolCardFooterButton>
      );
    }

    else if (
      !stakingPoolData.claimableVex.isZero() ||
      stakingPoolData.claimHistory.length
    ) {
      return (
        <PoolCardFooterButton
          role="button"
          color={color}
          onClick={() => setModal('claim')}
          active={ongoingTransaction === 'rewardClaim'}
        >
          {ongoingTransaction === 'rewardClaim'
            ? primaryActionLoadingText
            : `${
                (stakingPoolData.periodFinish &&
                  moment(stakingPoolData.periodFinish, 'X').diff(moment()) >
                    0) ||
                stakingPoolData.claimableVex.isZero()
                  ? "Claim Info"
                  : "Unstake & Claim"
              }`}
        </PoolCardFooterButton>
      );
    }

    else if (stakingPoolData.unstakedBalance.gt(constants.Zero)) {
      return (
          <PoolCardFooterButton
              role="button"
              color={color}
              onClick={() => {
                setModal('approve')
                setIsStakeAction(true)
              }}
              active={ongoingTransaction === 'stake'}
          >
            {ongoingTransaction === 'stake'
                ? primaryActionLoadingText
                : 'Stake'}
          </PoolCardFooterButton>
      );
    }

    else {
      return (
        <PoolCardFooterButton
          role="button"
          color={color}
          onClick={() => {
            setModal('action')
            setIsStakeAction(false)
          }}
          active={ongoingTransaction === 'unstake'}
        >
          {ongoingTransaction === 'unstake'
            ? primaryActionLoadingText
            : 'Unstake'}
        </PoolCardFooterButton>
      );
    }
  }, [
    account,
    color,
    ongoingTransaction,
    primaryActionLoadingText,
    setModal,
    stakingPoolData,
  ])

  return (
    <Wrapper color={color}>
      <div className="d-flex flex-wrap w-100 p-3">
        {/* Card Title */}
        <div className="d-flex align-items-center">
          <LogoContainer color="white">
            <Logo />
          </LogoContainer>
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center">
              <PoolTitle>vex-vet</PoolTitle>
              {/* <TooltipExplanation
                title={vaultOption}
                explanation={
                  productCopies[vaultOption].liquidityMining.explanation
                }
                renderContent={({ ref, ...triggerHandler }) => (
                  <HelpInfo containerRef={ref} {...triggerHandler}>
                    i
                  </HelpInfo>
                )}
                learnMoreURL="https://gov.ribbon.finance/t/rgp-2-ribbon-liquidity-mining-program/90"
              /> */}
            </div>
            <PoolSubtitle>
              Your Unstaked Balance:
              {' '}
              {renderUnstakeBalance()}
            </PoolSubtitle>
          </div>
        </div>

        {/* Claimable Pill */}
        {vexPill}

        {/* Capbar */}
        <div className="w-100 mt-4">
          <CapBar
            loading={false}
            current={parseFloat(
              utils.formatEther(stakingPoolData.currentStake)
            )}
            cap={parseFloat(utils.formatEther(stakingPoolData.poolSize))}
            copies={{
              current: "Your Current Stake",
              cap: "Pool Size",
            }}
            labelConfig={{
              fontSize: 14,
            }}
            statsConfig={{
              fontSize: 14,
            }}
            barConfig={{
              height: 8,
              extraClassNames: "my-2",
              radius: 2,
            }}
          />
        </div>

        {/* Estimated pool rewards */}
        <div className="d-flex align-items-center mt-4 w-100">
          <div className="d-flex align-items-center">
            <SecondaryText>Your estimated rewards</SecondaryText>
          </div>
          <PoolRewardData className="ml-auto" color={color}>
            {renderEstimatedRewards()} VEX
          </PoolRewardData>
        </div>
      </div>
      <PoolCardFooter>{stakingPoolButtons}</PoolCardFooter>
    </Wrapper>
  )
}
