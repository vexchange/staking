import React from 'react'
import styled from '@emotion/styled'

const ButtonArrowI = styled.i`
  transition: 0.2s all ease-out;
  transform: ${(props) => (props.isOpen ? 'rotate(-180deg)' : 'none')};
  ${(props) => (props.color ? `color: ${props.color};` : '')}
`

const ButtonArrow = ({ className, ...props }) => (
  <ButtonArrowI className={`fas fa-chevron-down ${className}`} {...props} />
)

export default ButtonArrow
