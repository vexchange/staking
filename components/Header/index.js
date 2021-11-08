import React, { useState } from 'react'
import { useRouter } from 'next/router'

import { BaseLink, Title } from '../../design'
import colors from '../../design/colors'
import AccountStatus from '../AccountStatus'

import Logo from '../Logo'

import {
  SecondaryMobileNavItem,
  HeaderAbsoluteContainer,
  HeaderContainer,
  LinksContainer,
  LogoContainer,
  NavItem,
  NavLinkText,
} from './styled'

function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const renderLinkItem = (
    title,
    href,
    isSelected,
    primary = true,
    external = false,
  ) => (
    <BaseLink
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer noopener' : undefined}
      onClick={() => {
        if (!external) setIsMenuOpen(false)
      }}
    >
      {primary ? (
        <NavItem isSelected={isSelected}>
          <NavLinkText>{title}</NavLinkText>
        </NavItem>
      ) : (
        <SecondaryMobileNavItem>
          <Title fontSize={18} color={`${colors.primaryText}7A`} style={{ textTransform: 'uppercase' }}>
            {title}
          </Title>
        </SecondaryMobileNavItem>
      )}
    </BaseLink>
  )

  return (
    <HeaderContainer
      isMenuOpen={isMenuOpen}
      className="d-flex align-items-center"
    >
      <LogoContainer>
        <Logo />
      </LogoContainer>

      {/* <HeaderAbsoluteContainer>
        <LinksContainer>
          
          {renderLinkItem(
            'Add Liquidity',
            'https://vexchange.io/add/0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997-0x0BD802635eb9cEB3fCBe60470D2857B86841aab6',
            null,
            true,
            true
          )}
        </LinksContainer>
      </HeaderAbsoluteContainer> */}

      <AccountStatus variant="desktop" />

    </HeaderContainer>
  )
}

export default Header
