import styled from '@emotion/styled'

import theme from '../../design/theme'
import sizes from '../../design/sizes'
import colors from '../../design/colors'

export const FooterContainer = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  border-top: ${theme.border.width} ${theme.border.style} ${colors.border};

  @media (max-width: ${sizes.md}px) {
    display: none;
  }
`

export const LinksContainer = styled.div`
  display: flex;
  align-items: center;
`

export const LeftContainer = styled(LinksContainer)`
  flex-grow: 1;
`

export const LinkItem = styled.div`
  padding: 0px 24px;
  opacity: 0.48;

  &:hover {
    opacity: 1;
  }
`
