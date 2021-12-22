import styled from '@emotion/styled'

import {
  BaseLink,
  BaseModalContentColumn,
  SecondaryText,
  Title,
} from '../../design'
import theme from '../../design/theme'
import colors from '../../design/colors'
import sizes from '../../design/sizes'

export const StakingPoolsContainer = styled.div`
  margin-top: 48px;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`

export const OverviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 48px;
  background: ${colors.background.two};
  border-radius: ${theme.border.radius};
`

export const OverviewInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  padding: 24px;
  background: linear-gradient(
    96.84deg,
    ${colors.orange}0A 1.04%,
    ${colors.orange}02 98.99%
  );
  border-radius: ${theme.border.radius} ${theme.border.radius} 0 0;
`

export const OverviewTag = styled.div`
  display: flex;
  background: #f5a78814;
  padding: 8px;
  border-radius: ${theme.border.radius};

  span {
    color: #f5a788;
  }
`

export const OverviewDescription = styled(SecondaryText)`
  line-height: 1.5;
`

export const UnderlineLink = styled(BaseLink)`
  text-decoration: underline;
  color: ${colors.primaryText};
  z-index: 1;

  &:hover {
    text-decoration: underline;
    color: ${colors.primaryText};
    opacity: ${theme.hover.opacity};
  }
`

export const OverviewKPIContainer = styled.div`
  display: flex;
  width: 100%;
`

export const OverviewKPI = styled.div`
  padding: 16px;
  width: calc(100% / 3);
  display: flex;
  flex-wrap: wrap;
  border-top: ${theme.border.width} ${theme.border.style} ${colors.border};

  @media (max-width: ${sizes.sm}px) {
    width: 100%;
  }

  &:not(:last-child) {
    border-right: ${theme.border.width} ${theme.border.style} ${colors.border};
  }
`

export const OverviewLabel = styled(SecondaryText)`
  font-size: 12px;
  line-height: 16px;
  width: 100%;
  margin-bottom: 8px;
`

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background: ${props => props.color};
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

export const InfoColumn = styled(BaseModalContentColumn)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const InfoData = styled(Title)`
  text-transform: none;
`
