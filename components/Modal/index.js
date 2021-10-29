import { Modal } from 'react-bootstrap'

import { BaseModalHeader } from '../../design'

import MenuButton from '../MenuButton'

import {
  BackButton,
  CloseButton,
  ModalContent,
  ModalHeaderBackground,
  StyledModal,
} from './styled'

export default function BasicModal({
  show,
  height,
  maxWidth = 343,
  onClose,
  closeButton = true,
  backButton,
  children,
  animationProps = {},
  headerBackground = false,
  backgroundColor,
  theme,
}) {
  return (
    <StyledModal
      show={show}
      centered
      height={height}
      maxwidth={maxWidth}
      onHide={onClose}
      backdrop
      theme={theme}
      backgroundcolor={backgroundColor}
    >
      <BaseModalHeader>
        {backButton && (
          <BackButton role="button" onClick={backButton.onClick}>
            <i className="fas fa-arrow-left" />
          </BackButton>
        )}

        {closeButton && (
          <CloseButton role="button" onClick={onClose}>
            <MenuButton isOpen onToggle={onClose} size={20} color="#FFFFFFA3" />
          </CloseButton>
        )}
      </BaseModalHeader>

      <Modal.Body>
        <ModalContent>
          {children}
          {headerBackground && <ModalHeaderBackground />}
        </ModalContent>
      </Modal.Body>

    </StyledModal>
  )
}
