import React from 'react'
import styled from '@emotion/styled'

const Container = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  z-index: 100;
`

const Line = styled.div`
  height: ${props => `calc(${props.size}px * 0.1)`};
  width: ${props => props.size}px;
  background-color: ${props => props.color};

  transition: 0.2s all ease-in;
`

const LineTop = styled(Line)`
  ${props => `
    margin-top: calc(${props.size}px * (0.8/3));
    transform: ${
      props.isOpen
        ? `
      translateY(calc(${props.size}px * (0.5 - 0.05 - (0.8/3)))) rotate(-45deg)
    `
        : `
      none
    `
    };
  `}
`
const LineBottom = styled(Line)`
  ${props => `
    margin-top: calc(${props.size}px * (0.8/3));
    transform: ${
      props.isOpen
        ? `
      translateY(calc(${props.size}px * (0.5 - 0.05 - (0.8/3)) * -1)) rotate(45deg)
    `
        : `
      none
    `
    };
  `}
`

const MenuButton = ({
  size = 24,
  color = 'white',
  isOpen,
  onToggle,
}) => (
  <Container onClick={onToggle} size={size}>
    <LineTop size={size} isOpen={isOpen} color={color} />
    <LineBottom size={size} isOpen={isOpen} color={color} />
  </Container>
)

export default MenuButton
