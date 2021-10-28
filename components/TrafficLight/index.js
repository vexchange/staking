import { useState, useEffect } from 'react'
import { uniqueId } from 'lodash'

import { Container, LightBar } from './styled'

const ProductList = [
  'yield',
  'volatility',
  'principalProtection',
  'capitalAccumulation',
]

export default function TrafficLight({
  active,
  interval = 350,
  lightBarConfig = {
    width: 200,
    height: 16,
    spacing: 24,
  },
}) {
  const [activeIndex, setActiveIndex] = useState()

  useEffect(() => {
    if (!active) {
      setActiveIndex(undefined)
      return
    }

    const timeInterval = setInterval(() => {
      setActiveIndex(curr => (curr !== undefined ? (curr + 1) % 4 : 0))
    }, interval)

    return () => clearInterval(timeInterval)
  }, [active, interval])

  return (
    <Container width={lightBarConfig.width}>
      {ProductList.map((product, index) => (
        <LightBar
          key={uniqueId('light_')}
          height={lightBarConfig.height}
          spacing={lightBarConfig.spacing}
          product={product}
          active={activeIndex === index}
          interval={interval}
        />
      ))}
    </Container>
  )
}
