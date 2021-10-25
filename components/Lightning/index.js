import React, { useMemo } from 'react'
import styled from '@emotion/styled'
import { keyframes, css } from '@emotion/react'

import colors from '../../design/colors'

const lightningEffect = keyframes`
  0% {
    opacity: 0;
  }

  80% {
    opacity: 0;
  }

  90% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`

const LightningBar = styled.div`
  position: absolute;
  ${props => css`
    height: ${props.height}px;
    width: ${props.width}px;
    background: ${props.fill};
    animation: ${props.duration}s ${lightningEffect} linear infinite;
    ${props.top ? `top: ${props.top}px;` : ''}
    ${props.left ? `left: ${props.left}px;` : ''}
    ${props.right ? `right: ${props.right}px;` : ''}
    ${props.bottom ? `bottom: ${props.bottom}px;` : ''}
  `}
`

const Lightning = ({
  themeColor = colors.products.yield,
  ...props
}) => {
  const color = useMemo(() => (Math.random() <= 0.6 ? themeColor : 'white'), [themeColor])

  const duration = useMemo(() => Math.random() * 3 + 1, [])

  return <LightningBar {...props} fill={color} duration={duration} />
}

export default Lightning
