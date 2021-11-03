import React, { useEffect, useRef } from 'react'

import useScreenSize from '../../hooks/useScreenSize'

import { MobileOverlayContainer } from './styled'

const MobileOverlayMenu = ({
  isMenuOpen,
  children,
  onClick,
  mountRoot,
  boundingDivProps,
  overflowOnOpen = true,
  ...props
}) => {
  const containerRef = useRef(null)
  const { height } = useScreenSize()

  useEffect(() => {
    if (!containerRef.current || !mountRoot) {
      return
    }

    document.querySelector(mountRoot).appendChild(containerRef.current)
  }, [containerRef, mountRoot])

  useEffect(() => {
    if (isMenuOpen && overflowOnOpen) {
      document.querySelector('body').style.overflow = 'hidden'
      return;
    }

    document.querySelector('body').style.removeProperty('overflow')
  }, [isMenuOpen, overflowOnOpen])

  return (
    <MobileOverlayContainer
      isMenuOpen={isMenuOpen}
      height={height}
      onClick={(event) => {
        onClick && onClick(event);
      }}
      ref={containerRef}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <div onClick={(e) => e.stopPropagation()} {...boundingDivProps}>
          {child}
        </div>
      ))}
    </MobileOverlayContainer>
  )
}

export default MobileOverlayMenu
