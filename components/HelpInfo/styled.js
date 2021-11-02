
import styled from '@emotion/styled'

import colors from '../../design/colors'
import theme from '../../design/theme'

export const HelpContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  width: 16px;
  border: ${theme.border.width} ${theme.border.style}
    ${(props) => (props.color ? props.color : colors.borderLight)};
  border-radius: 100px;
  margin-left: 8px;
  z-index: 1;
`
