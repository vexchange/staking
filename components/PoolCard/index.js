import { useCallback, useMemo, useState } from 'react'
import { ethers, constants, utils } from 'ethers'
import { Tooltip } from 'react-tippy'

import { formatBigNumber } from '../../utils'
import { useAppContext } from '../../context/app'
import { useTransactions } from '../../context/transactions'
import { Subtitle, BaseIndicator, SecondaryText, TooltipContainer } from '../../design'
import colors from '../../design/colors'

import useAPRandVexPrice from "../../hooks/useAPRandVexPrice";
import useTextAnimation from '../../hooks/useTextAnimation'
import useTokenAllowance from '../../hooks/useTokenAllowance'

import CapBar from '../CapBar'
import Logo from '../Logo'
import HelpInfo from '../HelpInfo'

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
  const { tvlInUsd } = useAPRandVexPrice()

  const color = colors.orange

  const [usdValueStaked, usdValuePoolSize] = useMemo(() => {
    if (!tvlInUsd || !stakingPoolData) {
      return [null, null];
    }
    return [
      formatBigNumber(
        tvlInUsd
          .mul(stakingPoolData.userData.currentStake)
          .div(stakingPoolData.poolData.poolSize)
      ),
      utils.formatEther(tvlInUsd),
    ];
  }, [tvlInUsd, stakingPoolData]);

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

    return ethers.utils.formatEther(stakingPoolData.userData.unstakedBalance)
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
      <ClaimableTokenPillContainer onClick={ () => { setShowClaimModal(true) } }>
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
              ? formatBigNumber(stakingPoolData.userData.claimableVex)
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

    const showApprove = tokenAllowance.lt(stakingPoolData.userData.unstakedBalance)
    const showClaim = stakingPoolData.userData.claimableVex.gt(0)
    const showUnstake = stakingPoolData.userData.currentStake.gt(0)

    return (
      <ButtonsContainer>
        {/*Show approve or stake depending on the balance and allowance*/}
        {showApprove
            ?
            // APPROVE
            (<PoolCardFooterButton
                role="button"
                color={color}
                onClick={() => {
                    setShowApprovalModal(true)
                }}
                active={ongoingTransaction === 'approve'}
            >
                {ongoingTransaction === 'approve'
                    ? primaryActionLoadingText
                    : 'approve'}
            </PoolCardFooterButton>)
            :
            // STAKE
            (<PoolCardFooterButton
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
            </PoolCardFooterButton>)
        }

        {/* CLAIM */}
        <PoolCardFooterButton
          role="button"
          color={color}
          onClick={() => {
            setShowClaimModal(true)
          }}
          active={ongoingTransaction === 'rewardClaim'}
          hidden={!showClaim}
        >
          {ongoingTransaction === 'rewardClaim'
            ? primaryActionLoadingText
            : `${stakingPoolData.userData.claimableVex.isZero()
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
          hidden={!showUnstake}
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
              <Tooltip
                interactive
                position="top"
                trigger="mouseenter"
                html={(
                  <TooltipContainer>
                    <p className="title"><b>vex-vet</b></p>
                    <p>vex-vet is a token that represents VEX deposits in the vex-vet liquidity pool. Stake your vex-vet tokens in the vex-vet staking pool to earn vex rewards ;)</p>
                    <p>
                      you can add your liquidity
                      {' '}
                      <a
                        className="link"
                        target="_blank"
                        href="https://vexchange.io/add/0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997-0x0BD802635eb9cEB3fCBe60470D2857B86841aab6">
                          here
                      </a>
                    </p>
                  </TooltipContainer>
                )}
              >
                <HelpInfo>i</HelpInfo>
              </Tooltip>
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
            loading={!(usdValueStaked && usdValuePoolSize)}
            current={usdValueStaked}
            cap={usdValuePoolSize}
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

        <div className="d-flex align-items-center mt-4 w-100">
          <div>
            <SecondaryText size="12px">Need liquidity tokens?</SecondaryText>
            {' '}
            <SecondaryText size="12px">
              <a
                className="link"
                target="_blank"
                href="https://vexchange.io/add/0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997-0x0BD802635eb9cEB3fCBe60470D2857B86841aab6">
                  Get VEX-VET LP tokens
              </a>
            </SecondaryText>
          </div>
        </div>
      </div>


      <PoolCardFooter>{stakingPoolButtons}</PoolCardFooter>
    </Wrapper>
  )
}