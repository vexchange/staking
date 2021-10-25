import { useCallback, useMemo, useState } from 'react'
import { ethers, constants } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import moment from 'moment'

import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'
import { Subtitle, BaseIndicator, SecondaryText } from '../../design'
import colors from '../../design/colors'
import { formatBigNumber } from '../../utils'

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
  color = '#e79631',
  active,
  stakingPoolData,
  setModal,
  setIsStakeAction,
}) {
  const { transactions } = useTransactions()
  const { account, initAccount } = useAppContext()

  const ongoingTransaction = useMemo(() => {
    const ongoingTx = transactions.find(currentTx =>
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
    if (!active) {
      return '---'
    }

    return formatBigNumber(constants.Zero, 18)
  }, [active])

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
    if (!active) {
      return '---'
    }

    return formatBigNumber(BigNumber.from('100')
        .mul(BigNumber.from(10).pow(18))
        .div(BigNumber.from('2'))
        .mul(BigNumber.from('1'))
        .div(BigNumber.from(10).pow(18)),
      0
    )
  }, [active])

  const rbnPill = useMemo(() => {
    if (
      moment(stakingPoolData.periodFinish, 'X').diff(moment()) &&
      stakingPoolData.claimableRbn.isZero()
    ) {
      return (
        <ClaimableTokenPillContainer>
          <ClaimableTokenPill color={color}>
            <BaseIndicator size={8} color={color} className="mr-2" />
            <Subtitle className="mt-2">AMOUNT CLAIMED</Subtitle>
            <ClaimableTokenAmount color={color}>
              {formatBigNumber(constants.Zero, 18, 2)}
            </ClaimableTokenAmount>
          </ClaimableTokenPill>
        </ClaimableTokenPillContainer>
      );
    }

    return (
      <ClaimableTokenPillContainer>
        <ClaimableTokenPill color={color}>
          <BaseIndicator size={8} color={color} className="mr-2" />
          <Subtitle className="mr-2">EARNED $VEX</Subtitle>
          <ClaimableTokenAmount color={color}>
            {active
              ? formatBigNumber(constants.Zero, 18, 2)
              : "---"}
          </ClaimableTokenAmount>
        </ClaimableTokenPill>
      </ClaimableTokenPillContainer>
    )
  }, [active, color, stakingPoolData])

  const stakingPoolButtons = useMemo(() => {
    if (!account) {
      return (
        <PoolCardFooterButton
          role="button"
          color={colors.green}
          onClick={() => {
            initAccount()
          }}
          active={false}
        >
          CONNECT WALLET
        </PoolCardFooterButton>
      );
    }

    if (
      !stakingPoolData.claimableRbn.isZero() ||
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
                stakingPoolData.claimableRbn.isZero()
                  ? "Claim Info"
                  : "Unstake & Claim"
              }`}
        </PoolCardFooterButton>
      );
    }

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
  }, [
    active,
    account,
    color,
    ongoingTransaction,
    primaryActionLoadingText,
    setModal,
    // setShowConnectWalletModal,
    stakingPoolData,
  ])

  return (
    <Wrapper color={color}>
      <div className="d-flex flex-wrap w-100 p-3">
        {/* Card Title */}
        <div className="d-flex align-items-center">
          <LogoContainer color={color}>
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
              {renderUnstakeBalance()}
            </PoolSubtitle>
          </div>
        </div>

        {/* Claimable Pill */}
        {rbnPill}

        {/* Capbar */}
        <div className="w-100 mt-4">
          <CapBar
            loading={false}
            current={parseFloat(
              ethers.utils.formatUnits(constants.Zero, 18)
            )}
            cap={parseFloat(ethers.utils.formatUnits(constants.Zero, 18))}
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
