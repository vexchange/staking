import styled from '@emotion/styled'
import { keyframes, css } from '@emotion/react'

import { Title } from '../../design'
import theme from '../../design/theme'
import colors from '../../design/colors'

import Logo from '../Logo'
import { Waves } from '../Icons'

const changingColorBackground = keyframes`
  0% {
    background: ${colors.products.yield};
    box-shadow: 16px 24px 160px ${colors.products.yield};
  }

  23% {
    background: ${colors.products.yield};
    box-shadow: 16px 24px 160px ${colors.products.yield};
  }

  25% {
    background: ${colors.products.volatility};
    box-shadow: 16px 24px 160px ${colors.products.volatility};
  }

  48% {
    background: ${colors.products.volatility};
    box-shadow: 16px 24px 160px ${colors.products.volatility};
  }

  50% {
    background: ${colors.products.principalProtection};
    box-shadow: 16px 24px 160px ${colors.products.principalProtection};
  }

  73% {
    background: ${colors.products.principalProtection};
    box-shadow: 16px 24px 160px ${colors.products.principalProtection};
  }

  75% {
    background: ${colors.products.capitalAccumulation};
    box-shadow: 16px 24px 160px ${colors.products.capitalAccumulation};
  }

  98% {
    background: ${colors.products.capitalAccumulation};
    box-shadow: 16px 24px 160px ${colors.products.capitalAccumulation};
  }

  100% {
    background: ${colors.products.yield};
    box-shadow: 16px 24px 160px ${colors.products.yield};
  }
`
const marquee = keyframes`
  from {
    transform: translateX(650px);
  }

  to {
    transform: translateX(-650px);
  }
`

const changingColorStroke = keyframes`
  0% {
    stroke: ${colors.products.yield};
  }

  23% {
    stroke: ${colors.products.yield};
  }

  25% {
    stroke: ${colors.products.volatility};
  }

  48% {
    stroke: ${colors.products.volatility};
  }

  50% {
    stroke: ${colors.products.principalProtection};
  }

  73% {
    stroke: ${colors.products.principalProtection};
  }

  75% {
    stroke: ${colors.products.capitalAccumulation};
  }

  98% {
    stroke: ${colors.products.capitalAccumulation};
  }

  100% {
    stroke: ${colors.products.yield};
  }
`

export const ColorChangingWaves = styled(Waves)`
  margin-bottom: -16px;
  min-width: 500px;
  max-height: 80px;
  opacity: 0.24;

  path {
    animation: 12s ${changingColorStroke} linear infinite;
  }
`

export const ClaimingText = styled(Title)`
  font-size: 120px;
  animation: ${marquee} 20s linear infinite;
  white-space: nowrap;
`

export const Pole = styled.div`
  width: 160px;
  height: 320px;
  border-radius: ${theme.border.radius};

  ${props => {
    switch (props.type) {
      case 'animate':
        return css`
          animation: 12s ${changingColorBackground} linear infinite;
        `
      case 'ribbon':
        return `
          box-shadow: 16px 24px 160px ${colors.products.yield};
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        `
      default:
        return `
          background: #ffffff0a;
        `
    }
  }}
`

export const PoleLogo = styled(Logo)`
  min-width: 500px;
  min-height: 500px;
  margin-top: 50px;
`
