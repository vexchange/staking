import styled from '@emotion/styled'

import { BaseModal } from '../../design'

import theme from '../../design/theme'
import colors from '../../design/colors'

export const StyledModal = styled(BaseModal)`
  .modal-dialog {
    width: 95vw;
    max-width: ${props => props.maxwidth}px;
    margin-left: auto;
    margin-right: auto;
  }

  .modal-content {
    transition: min-height 0.25s;
    min-height: ${props => props.height}px;
    overflow: hidden;
    background-color: ${props => (props.theme ? `${props.theme}0A` : '')};
  }
`

export const BackButton = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 48px;
  z-index: 2;

  & > i {
    color: #ffffff;
  }
`

export const CloseButton = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: ${theme.border.width} ${theme.border.style}
    ${props => (props.theme ? `${colors.primaryText}0A` : `${colors.border}`)};
  border-radius: 48px;
  color: ${colors.text};
  z-index: 2;
`

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: -32px;
  left: 0;
  height: calc(100% + 32px);
  width: 100%;
  padding: 16px;
`

export const ModalHeaderBackground = styled.div`
  background: ${colors.background.two};
  height: 72px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`
