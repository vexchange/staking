import React, { useCallback } from 'react'
import moment from 'moment'

import colors from '../../design/colors'

import {
  BaseModalContentColumn,
  BaseUnderlineLink,
  PrimaryText,
  SecondaryText,
} from '../../design'

import Logo from '../Logo'
import { ActionButton } from '../Button'
import ModalContentExtra from '../ModalContentExtra'

import {
  LogoContainer,
  ApproveAssetTitle,
  ErrorMessage,
  WarningText,
} from './styled'

const ApproveModalInfo = ({
  vaultOption,
  stakingPoolData,
  onApprove,
}) => {
  const color = colors.orange

  const renderStakingFinishDate = useCallback(() => {
    if (stakingPoolData.periodFinish) {
      const finishPeriod = moment(stakingPoolData.periodFinish, 'X')

      if (finishPeriod.diff(moment()) > 0) {
        return finishPeriod.format('MMM Do, YYYY')
      }
    }

    return 'TBA'
  }, [stakingPoolData])

  return (
    <>
      <BaseModalContentColumn>
        <LogoContainer color={color}>
          <Logo />
        </LogoContainer>
      </BaseModalContentColumn>
      <BaseModalContentColumn marginTop={8}>
        <ApproveAssetTitle str={vaultOption}>{vaultOption}</ApproveAssetTitle>
      </BaseModalContentColumn>
      <BaseModalContentColumn>
        <PrimaryText className="text-center font-weight-normal">
          Before you stake, the pool needs your permission to hold your
            {" "}{vaultOption}{" "}
          tokens.
        </PrimaryText>
      </BaseModalContentColumn>
      <BaseModalContentColumn marginTop={16}>
        <BaseUnderlineLink
          href="https://ribbon.finance/faq"
          target="_blank"
          rel="noreferrer noopener"
          className="d-flex"
        >
          <SecondaryText>Why do I have to do this?</SecondaryText>
        </BaseUnderlineLink>
      </BaseModalContentColumn>
      <BaseModalContentColumn marginTop="auto">
        <ActionButton
          className="btn py-3 mb-2"
          onClick={onApprove}
          // color={getVaultColor(vaultOption)}
          color="blue"
          disabled={stakingPoolData.unstakedBalance.isZero()}
        >
          Approve
        </ActionButton>
      </BaseModalContentColumn>
      {stakingPoolData.unstakedBalance.isZero() ? (
        <BaseModalContentColumn marginTop={16}>
          <ErrorMessage className="mb-2">WALLET BALANCE: 0</ErrorMessage>
        </BaseModalContentColumn>
      ) : (
        <ModalContentExtra>
            {/*TODO: To remove
                I think this is not relevant / true anymore.
               Stakers can claim rewards and exit the pool anytime they wish
            */}
          <WarningText color={color}>
            IMPORTANT: To claim RBN rewards you must remain staked in the pool
            until the end of the liquidity mining program (
            {renderStakingFinishDate()}
            ).
          </WarningText>
        </ModalContentExtra>
      )}
    </>
  )
}

export default ApproveModalInfo
