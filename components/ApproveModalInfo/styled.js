import styled from '@emotion/styled'

import { Title, PrimaryText } from '../../design'
import colors from '../../design/colors'

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 100px;
  background: ${props => props.color}29;
`

export const ApproveAssetTitle = styled(Title)`
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

export const ErrorMessage = styled(Title)`
  color: ${colors.red};
`