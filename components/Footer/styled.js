import styled from '@emotion/styled'

import theme from '../../design/theme'
import sizes from '../../design/sizes'

export const FooterContainer = styled.div`
  height: ${theme.footer.desktop.height}px;
  width: 100%;
  display: flex;
  justify-content: center;
  backdrop-filter: blur(40px);
  /**
   * Firefox desktop come with default flag to have backdrop-filter disabled
   * Firefox Android also currently has bug where backdrop-filter is not being applied
   * More info: https://bugzilla.mozilla.org/show_bug.cgi?id=1178765
   **/
  @-moz-document url-prefix() {
    background-color: rgba(0, 0, 0, 0.9);
  }

  ${(props) => `
    position: sticky;
    top: calc(${props.screenHeight ? `${props.screenHeight}px` : `100%`} - ${
    theme.footer.desktop.height
  }px);
  `}

  @media (max-width: ${sizes.md}px) {
    position: fixed;
    top: unset;
    bottom: 0px;
    height: ${(props) =>
      props.showVaultPosition
        ? theme.footer.mobile.heightWithPosition
        : theme.footer.mobile.height}px;
    z-index: 5;
  }
`

export const MobileFooterOffsetContainer = styled.div`
  @media (max-width: ${sizes.md}px) {
    height: ${(props) =>
      props.showVaultPosition
        ? theme.footer.mobile.heightWithPosition
        : theme.footer.mobile.height}px;
  }
`