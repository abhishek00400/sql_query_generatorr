import { useEffect, useMemo, useState } from 'react'

export function useTypewriter(fullText, speed = 18, enabled = true) {
  const text = fullText || ''
  const [displayText, setDisplayText] = useState(enabled === false ? text : '')

  const shouldAnimate = enabled !== false

  const steps = useMemo(() => text.length, [text])

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayText(text)
      return
    }

    setDisplayText('')
    let i = 0
    const id = setInterval(() => {
      i += 1
      setDisplayText(text.slice(0, i))
      if (i >= steps) clearInterval(id)
    }, speed)

    return () => clearInterval(id)
  }, [text, speed, steps, shouldAnimate])

  return { displayText, isDone: displayText.length >= text.length && text.length > 0 }
}
