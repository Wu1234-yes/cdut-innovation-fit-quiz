import { useEffect, useState } from 'react'
import { useAppReducedMotion } from '../hooks/useAppReducedMotion'

interface AnimatedNumberProps {
  value: number
  suffix?: string
  duration?: number
  reducedMotion?: boolean
}

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

export function AnimatedNumber({
  value,
  suffix = '',
  duration = 700,
  reducedMotion,
}: AnimatedNumberProps) {
  const systemReducedMotion = useAppReducedMotion()
  const shouldReduce = reducedMotion ?? systemReducedMotion
  const target = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
  const [animatedValue, setAnimatedValue] = useState(0)
  const displayValue = shouldReduce || duration <= 0 ? target : animatedValue

  useEffect(() => {
    if (shouldReduce || duration <= 0) {
      return
    }

    let frameId = 0
    let startTime: number | null = null

    const update = (time: number) => {
      startTime ??= time
      const progress = Math.min(1, (time - startTime) / duration)
      setAnimatedValue(Math.round(target * easeOutCubic(progress)))

      if (progress < 1) {
        frameId = window.requestAnimationFrame(update)
      }
    }

    frameId = window.requestAnimationFrame(update)

    return () => window.cancelAnimationFrame(frameId)
  }, [duration, shouldReduce, target])

  return (
    <span className="animated-number">
      {displayValue}
      {suffix}
    </span>
  )
}
