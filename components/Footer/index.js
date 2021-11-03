
import { useState } from 'react'
import useScreenSize from '../../hooks/useScreenSize'

import DesktopFooter from '../DesktopFooter'
import AccountStatus from '../AccountStatus'

import { FooterContainer, MobileFooterOffsetContainer } from './styled'

function Footer() {
  const { height: screenHeight } = useScreenSize()
  const [showVaultPosition, setShowVaultPosition] = useState(false)

  return (
    <>
      <FooterContainer
        screenHeight={screenHeight}
        showVaultPosition={showVaultPosition}
      >
        {/** Desktop */}
        <DesktopFooter />

        {/** Mobile */}
        <AccountStatus
          variant="mobile"
          vault="vex-vet"
          showVaultPositionHook={setShowVaultPosition}
        />
      </FooterContainer>
      <MobileFooterOffsetContainer showVaultPosition={showVaultPosition} />
    </>
  )
}

export default Footer
