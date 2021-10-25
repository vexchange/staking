import React, { useState } from 'react'
import { useRouter } from 'next/router'

import { BaseLink, Title } from '../../design'
import colors from '../../design/colors'
import AccountStatus from '../AccountStatus'

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
          <Title fontSize={18} color={`${colors.primaryText}7A`}>
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
        Vexchange
      </LogoContainer>

      <HeaderAbsoluteContainer>
        <LinksContainer>
          {renderLinkItem(
            'STAKING',
            '/',
            router.asPath === '',
          )}
        </LinksContainer>
      </HeaderAbsoluteContainer>

      <AccountStatus variant="desktop" />

    </HeaderContainer>
  )
}

export default Header
