import styled from '@emotion/styled'

export const BackgroundBar = styled.div`
  height: ${props => props.height}px;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: ${props => props.radius}px;
`

export const ForegroundBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: ${props => props.height}px;
  background: #ffffff;
  border-radius: ${props => props.radius}px;
  width: 100%;
`
