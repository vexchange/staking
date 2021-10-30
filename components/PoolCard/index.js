import { useCallback, useMemo, useState } from 'react'
import { ethers, constants, utils } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import moment from 'moment'

import { formatBigNumber } from '../../utils'
import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'
import { Subtitle, BaseIndicator, SecondaryText } from '../../design'
import colors from '../../design/colors'

import useTextAnimation from '../../hooks/useTextAnimation'
import useTokenAllowance from '../../hooks/useTokenAllowance'

import CapBar from '../CapBar'
import Logo from '../Logo'

import {
  ButtonsContainer,
  ClaimableTokenAmount,
  ClaimableTokenPill,
  ClaimableTokenPillContainer,
  LogoContainer,
  PoolCardFooter,
  PoolCardFooterButton,
  PoolRewardData,
  PoolSubtitle,
  PoolTitle,
  Wrapper,
} from './styled'

export default function PoolCard({
  stakingPoolData,
  setIsStakeAction,
  setShowApprovalModal,
  setShowClaimModal,
  setShowActionModal,
}) {
  const { transactions } = useTransactions()
  const { account, initAccount } = useAppContext()
  const { tokenAllowance } = useTokenAllowance()

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

  const vexPill = useMemo(() => {
    return (
      <ClaimableTokenPillContainer>
        <ClaimableTokenPill color={color}>
          <BaseIndicator
            size={8}
            color={color}
            className="mr-2"
            style={{ marginRight: '5px' }}
          />
          <Subtitle className="mr-2">VEX to claim</Subtitle>
            <ClaimableTokenAmount color={color} style={{ marginLeft: '8px' }}>
            {account
              ? formatBigNumber(stakingPoolData.claimableVex)
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
    } else if (tokenAllowance.lt(stakingPoolData.unstakedBalance)) {
      return (
          <PoolCardFooterButton
              role="button"
              color={color}
              onClick={() => {
                setShowApprovalModal(true)
                setIsStakeAction(true)
              }}
              active={ongoingTransaction === 'approve'}
          >
            {ongoingTransaction === 'approve'
                ? primaryActionLoadingText
                : 'approve'}
          </PoolCardFooterButton>
      );
    }

    return (
      <ButtonsContainer>
        {/* STAKE */}
        <PoolCardFooterButton
            role="button"
            color={color}
            onClick={() => {
              setShowActionModal(true)
              setIsStakeAction(true)
            }}
            active={ongoingTransaction === 'stake'}
        >
          {ongoingTransaction === 'stake'
              ? primaryActionLoadingText
              : 'Stake'}
        </PoolCardFooterButton>
        {/* CLAIM */}
        <PoolCardFooterButton
          role="button"
          color={color}
          onClick={() => {
            setShowClaimModal(true)
            setIsStakeAction(true)
          }}
          active={ongoingTransaction === 'rewardClaim'}
        >
          {ongoingTransaction === 'rewardClaim'
            ? primaryActionLoadingText
            : `${stakingPoolData.claimableVex.isZero()
                  ? "Claim Info"
                  : "Claim"
              }`}
        </PoolCardFooterButton>
        {/* UNSTAKE */}
        <PoolCardFooterButton
          role="button"
          color={color}
          onClick={() => {
            setShowActionModal(true)
            setIsStakeAction(false)
          }}
          active={ongoingTransaction === 'unstake'}
        >
          {ongoingTransaction === 'unstake'
            ? primaryActionLoadingText
            : 'Unstake'}
        </PoolCardFooterButton>
      </ButtonsContainer>
    )
  }, [
    account,
    color,
    ongoingTransaction,
    primaryActionLoadingText,
    setShowApprovalModal,
    setShowClaimModal,
    setShowActionModal,
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
      </div>
      <PoolCardFooter>{stakingPoolButtons}</PoolCardFooter>
    </Wrapper>
  )
}
