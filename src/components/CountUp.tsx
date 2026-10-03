import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  format: (n: number) => string
  delay?: number
  duration?: number
}

/** Animates a number from 0 to `value` with an Apple-style ease-out. */
export function CountUp({ value, format, delay = 0, duration = 1.3 }: Props) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    let start = 0
    const tick = (ts: number) => {
      if (!start) start = ts
      const t = Math.min(1, (ts - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 4) // easeOutQuart
      setDisplay(value * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    const timer = window.setTimeout(() => {
      raf.current = requestAnimationFrame(tick)
    }, delay * 1000)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf.current)
    }
  }, [value, delay, duration])

  return <>{format(display)}</>
}
