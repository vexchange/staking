import styled from '@emotion/styled'

import colors from '../../design/colors'
import theme from '../../design/theme'

const EndingBorder = styled.div`
  height: 16px;
  margin: ${props => props.config?.my ?? '0'}px
    ${props => props.config?.mx ?? '-16'}px
    ${props => props.config?.my ?? '0'}px
    ${props => props.config?.mx ?? '-16'}px;
  border-radius: ${theme.border.radius};
  background: ${colors.background.two};
  z-index: 1;
`

const ExtraContainer = styled.div`
  display: flex;
  background: ${props => (props.backgroundColor ? props.backgroundColor : colors.background.three)};
  border-radius: ${theme.border.radius};
  margin: -16px ${props => props.config?.mx ?? '-16'}px
    ${props => props.config?.my ?? '-16'}px
    ${props => props.config?.mx ?? '-16'}px;
  padding: 16px;
  padding-top: 32px;
`

export default function ModalContentExtra(props) {
  const { config } = props

  return (
    <>
      <EndingBorder config={config} />
      <ExtraContainer {...props} />
    </>
  )
}
