import { useRef, useCallback } from 'react'
import styled from '@emotion/styled'

import theme from '../../design/theme'
import colors from '../../design/colors'

export const BaseButton = styled.div`
  display: flex;
  border-radius: ${theme.border.radius};
  padding: 12px 16px;
`

export const Button = styled.button`
  font-family: VCR, sans-serif;
  width: 100%;
  border-radius: 4px;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  text-transform: uppercase;
  outline: none;

  &:active,
  &:focus {
    outline: none;
    box-shadow: none;
  }
`

export const BaseActionButton = styled(Button)`
  ${props => {
    if (props.error) {
      return `
        background: ${colors.red}14;
        color: ${colors.red};
        
        && {
          opacity: 1;
        }

        &:hover {
          background: ${colors.red}14;
          color: ${colors.red};
        }
      `
    }

    switch (props.variant) {
      case 'primary':
        return props.color
          ? `
            background: ${props.color}14;
            color: ${props.color};
            box-shadow: 8px 16px 64px ${props.color}14;
    
            &:hover {
              background: ${props.color}${props.disabled ? 14 : 29};
              color: ${props.color};
            }
          `
          : `
            background: ${colors.buttons.primary}${props.disabled ? 29 : ''};
            color: ${colors.primaryText};
    
            &:hover {
              color: ${colors.primaryText};
            }
          `
      case 'secondary':
        return props.color
          ? `
            color: ${props.color};
            border: 1px solid ${props.color};
            border-radius: ${theme.border.radiusSmall}; 
          `
          : `
            color: ${colors.primaryText};
            border: 1px solid ${colors.primaryText};
            border-radius: ${theme.border.radiusSmall}; 

            &:hover {
              color: ${colors.primaryText};
              opacity: ${theme.hover.opacity};
            }
          `
      default:
        return ''
    }
  }}
`
const InternalButtonLink = styled.a`
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: none;
    color: inherit;
  }
`

export const ActionButton = ({
  onClick = () => {},
  link = '',
  className = '',
  children,
  color,
  error,
  disabled = false,
  variant = 'primary',
}) => {
  const hasLink = link !== ''
  const linkRef = useRef(null)

  const openLink = useCallback(() => {
    if (linkRef !== null && linkRef.current !== null) {
      linkRef.current.click()
    }
  }, [])

  const handleClick = hasLink ? openLink : onClick

  return (
    <BaseActionButton
      disabled={disabled}
      onClick={handleClick}
      type="button"
      color={color}
      error={error}
      className={`btn ${className}`}
      variant={variant}
    >
      {link !== '' ? (
        <InternalButtonLink
          ref={linkRef}
          href={link}
          target="_blank"
          rel="noreferrer noopener"
        >
          <>
            {children}
          </>
        </InternalButtonLink>
      ) : (
        children
      )}
    </BaseActionButton>
  )
}
