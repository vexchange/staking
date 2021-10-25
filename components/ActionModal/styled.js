import styled from '@emotion/styled'

import colors from '../../design/colors'

import { BaseModalContentColumn, Title, Subtitle } from '../../design'

export const InfoColumn = styled(BaseModalContentColumn)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const ModalTitle = styled(Title)`
  z-index: 2;
`

export const InfoData = styled(Title)`
  text-transform: none;
  ${props => {
    if (props.error) {
      return `
        color: ${colors.red};
      `
    }

    return ''
  }}
`

export const CurrentStakeTitle = styled(Subtitle)`
  color: ${colors.text};
`

export const Arrow = styled.i`
  font-size: 12px;
  color: ${props => props.color};
`

export const AssetTitle = styled(Title)`
  text-transform: none;

  ${props => (props.str.length > 12
    ? `
      font-size: 24px;
      line-height: 36px;
  ` : `
      font-size: 40px;
      line-height: 52px;
  `)}
`
