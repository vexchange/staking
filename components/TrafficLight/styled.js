import styled from '@emotion/styled'

import colors from '../../design/colors'

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: ${props => props.width}px;
`

export const LightBar = styled.div`
  height: ${props => props.height}px;
  width: 100%;
  background: ${props => (props.active ? colors.products[props.product] : '#FFFFFF0A')};
  box-shadow: 8px 16px 80px
    ${props => (props.active ? colors.products[props.product] : 'none')};
  border-radius: 2px;
  ${props => `transition: background ${props.interval}ms ease-in-out, box-shadow ${props.interval}ms ease-in-out;`}

  &:not(div:first-of-type) {
    margin-top: ${props => props.spacing}px;
  }
`
