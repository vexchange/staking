import { useEffect, useState } from 'react'

const useTextAnimation = (
  animating = true,
  {
    texts,
    interval,
  } = {
    texts: ['Loading', 'Loading .', 'Loading ..', 'Loading ...'],
    interval: 250,
  },
) => {
  const [currentText, setCurrentText] = useState(texts[0])
  const [, setCounter] = useState(0)

  useEffect(() => {
    if (animating) {
      const timeInterval = setInterval(() => {
        setCounter(curr => {
          const newCounter = curr + 1
          setCurrentText(texts[newCounter % texts.length])
          return newCounter
        })
      }, interval)

      return () => {
        clearInterval(timeInterval)
      }
    }
  }, [])

  return currentText
}

export default useTextAnimation
