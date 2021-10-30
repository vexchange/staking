import colors from '../../design/colors'

import {
  BaseModalContentColumn,
  BaseUnderlineLink,
  PrimaryText,
  SecondaryText,
} from '../../design'

import Logo from '../Logo'
import { ActionButton } from '../Button'

import {
  LogoContainer,
  ApproveAssetTitle,
  ErrorMessage,
} from './styled'

const ApproveModalInfo = ({
  vaultOption,
  stakingPoolData,
  onApprove,
}) => {
  const color = colors.orange

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
          {' '}
          {vaultOption}
          {' '}
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
          color={color}
          disabled={stakingPoolData.userData.unstakedBalance.isZero()}
        >
          Approve
        </ActionButton>
      </BaseModalContentColumn>
      {stakingPoolData.userData.unstakedBalance.isZero() && (
        <BaseModalContentColumn marginTop={16}>
          <ErrorMessage className="mb-2">WALLET BALANCE: 0</ErrorMessage>
        </BaseModalContentColumn>
      )}
    </>
  )
}

export default ApproveModalInfo
