import React, { useState, useCallback, useEffect, useRef } from 'react'

import { useAppContext } from '../../context/app'

import useOutsideAlerter from '../../hooks/useOutsideAlerter' 
import { truncateAddress, copyTextToClipboard } from '../../utils'

import MenuButton from '../MenuButton'
import ButtonArrow from '../ButtonArrow'
import Indicator from '../Indicator'

import {
  AccountStatusContainer,
  MenuItem,
  MenuItemText,
  MenuCloseItem,
  WalletButton,
  WalletButtonText,
  WalletContainer,
  WalletCopyIcon,
  WalletDesktopMenu,
  WalletMobileOverlayMenu,
} from './styled'

function AccountStatus({ variant }) {
  const {
    account,
    initAccount,
  } = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [copyState, setCopyState] = useState('hidden')

  // Track clicked area outside of desktop menu
  const desktopMenuRef = useRef(null)
  useOutsideAlerter(desktopMenuRef, () => {
    if (variant === 'desktop' && isMenuOpen) onCloseMenu()
  })


  useEffect(() => {
    let timer

    switch (copyState) {
      case 'visible':
        timer = setTimeout(() => {
          setCopyState('hiding')
        }, 800)
        break
      case 'hiding':
        timer = setTimeout(() => {
          setCopyState('hidden')
        }, 200)
    }

    if (timer) clearTimeout(timer)
  }, [copyState])

  const handleCopyAddress = useCallback(() => {
    if (account) {
      copyTextToClipboard(account)
      setCopyState('visible')
    }
  }, [account])

  const onToggleMenu = useCallback(() => {
    setIsMenuOpen((open) => !open)
  }, [])

  const onCloseMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const handleButtonClick = useCallback(async () => {
    if (account) {
      onToggleMenu()
      return
    }

    initAccount()
  }, [account, onToggleMenu])

  const handleChangeWallet = useCallback(() => {
    initAccount()
    onCloseMenu()
  }, [onCloseMenu])

  const handleOpenExplore = useCallback(() => {
    if (account) {
      window.open(`https://explore.vechain.org/accounts/${account}`)
    }
  }, [account])

  const renderButtonContent = () =>
      account ? (
          <>
            <Indicator connected={account}/>
            <WalletButtonText connected={account}>
              {truncateAddress(account)} <ButtonArrow isOpen={isMenuOpen}/>
            </WalletButtonText>
          </>
      ) : (
          <WalletButtonText connected={account}>Connect Wallet</WalletButtonText>
      )

  const renderMenuItem = (title, onClick, extra) => {
    return (
        <MenuItem onClick={onClick} role='button'>
          <MenuItemText>{title}</MenuItemText>
          {extra}
        </MenuItem>
    )
  }

  const renderCopiedButton = () => {
    return <WalletCopyIcon className="far fa-clone" state={copyState}/>
  }

  return (
      <AccountStatusContainer variant={variant}>
        <WalletContainer variant={variant} ref={desktopMenuRef}>
          <WalletButton variant={variant} onClick={handleButtonClick}>
            {renderButtonContent()}
          </WalletButton>
          <WalletDesktopMenu isMenuOpen={isMenuOpen}>
            {renderMenuItem('CHANGE WALLET', handleChangeWallet)}
            {renderMenuItem(
                copyState === 'hidden' ? 'Copy Address' : 'Address Copied',
                handleCopyAddress,
                renderCopiedButton()
            )}
            {renderMenuItem('Open in explorer', handleOpenExplore)}
          </WalletDesktopMenu>
        </WalletContainer>

      {/* Mobile Menu */}
      <WalletMobileOverlayMenu
        className="flex-column align-items-center justify-content-center"
        isMenuOpen={isMenuOpen}
        onClick={onCloseMenu}
        variant={variant}
        mountRoot="div#__next"
        overflowOnOpen={false}
      >
        {renderMenuItem(
          copyState === "hidden" ? "COPY ADDRESS" : "ADDRESS COPIED",
          handleCopyAddress,
          renderCopiedButton()
        )}
        {renderMenuItem("OPEN IN EXPLORER", handleOpenExplore)}
        <MenuCloseItem role="button" onClick={onCloseMenu}>
          <MenuButton isOpen={true} onToggle={onCloseMenu} />
        </MenuCloseItem>
      </WalletMobileOverlayMenu>

      </AccountStatusContainer>
  )
}

export default AccountStatus
