import { useCallback } from 'react'

import {
  BaseModalContentColumn,
  Title,
  PrimaryText,
  FloatingContainer,
} from '../../design'

import Lightning from '../Lightning'

import {
  Pole,
  PoleLogo,
  ClaimingText,
  ColorChangingWaves,
} from './styled'

export default function VEXClaimModalContent({
  step,
  title,
  themeColor,
  children,
}) {
  const renderLightning = useCallback(
    () => (
      <>
        <Lightning
          themeColor={themeColor}
          height={16}
          width={80}
          left={183}
          top={48}
        />
        <Lightning
          themeColor={themeColor}
          height={16}
          width={40}
          left={24}
          top={152}
        />
        <Lightning
          themeColor={themeColor}
          height={16}
          width={24}
          left={319}
          top={232}
        />
        <Lightning
          themeColor={themeColor}
          height={16}
          width={64}
          left={0}
          top={362}
        />
        <Lightning
          themeColor={themeColor}
          height={16}
          width={16}
          left={276}
          top={426}
        />
      </>
    ),
    [themeColor],
  )

  switch (step) {
    case 'claim':
      return (
        <>
          <BaseModalContentColumn marginTop={8}>
            <Title style={{ textTransform: 'uppercase' }}>
              {title || 'Confirm Transaction'}
            </Title>
          </BaseModalContentColumn>
          <BaseModalContentColumn marginTop="auto">
            <PrimaryText className="text-center">
              Confirm this transaction in your wallet
            </PrimaryText>
          </BaseModalContentColumn>
          <FloatingContainer>{children || <Pole />}</FloatingContainer>
        </>
      )
    case 'claiming':
      return (
        <>
          <BaseModalContentColumn marginTop={8}>
            <Title style={{ textTransform: 'uppercase' }}>{title || 'Pending Transaction'}</Title>
          </BaseModalContentColumn>
          <FloatingContainer>
            {children || <Pole type="animate" />}
          </FloatingContainer>
          <FloatingContainer>
            <ClaimingText>Claiming $VEX</ClaimingText>
          </FloatingContainer>
          <BaseModalContentColumn marginTop="auto">
            <ColorChangingWaves />
          </BaseModalContentColumn>
        </>
      )
    case 'claimed':
      return (
        <>
          <BaseModalContentColumn marginTop={8}>
            <Title style={{ textTransform: 'uppercase' }}>{title || '$Vex Claimed'}</Title>
          </BaseModalContentColumn>
          <BaseModalContentColumn marginTop="auto">
            <PrimaryText className="text-center">
              Thank you for being part of the community!
            </PrimaryText>
          </BaseModalContentColumn>
          <FloatingContainer>
            {children || (
              <Pole type="ribbon">
                <PoleLogo />
              </Pole>
            )}
          </FloatingContainer>
          {renderLightning()}
        </>
      )
    default:
      return <div>ken</div>
  }
}
