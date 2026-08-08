import { motion } from 'motion/react'
import { useAppReducedMotion } from '../hooks/useAppReducedMotion'

export type MascotVariant = 'cheer' | 'research' | 'focus' | 'launch'

interface SignalMascotProps {
  className?: string
  variant: MascotVariant
}

const labels: Record<MascotVariant, string> = {
  cheer: '加油',
  research: '科海破浪',
  focus: '专注探索',
  launch: '向目标出发',
}

const assetUrl = (asset: string) => {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${baseUrl}${asset.replace(/^\/+/, '')}`
}

export function SignalMascot({ className = '', variant }: SignalMascotProps) {
  const reducedMotion = useAppReducedMotion()

  return (
    <motion.img
      alt={`科创 IP 小人：${labels[variant]}`}
      animate={reducedMotion ? undefined : { y: [0, -7, 0], rotate: [0, -1.5, 0] }}
      className={`signal-mascot ${className}`.trim()}
      initial={reducedMotion ? false : undefined}
      loading="lazy"
      src={assetUrl(`ip/${variant}.png`)}
      transition={reducedMotion ? { duration: 0 } : { duration: 4.4, ease: 'easeInOut', repeat: Infinity }}
    />
  )
}

export function CenterSignalMark({ className = '' }: { className?: string }) {
  return (
    <img
      alt="成都理工大学青年科技创新服务中心动态标志"
      className={`center-signal-mark ${className}`.trim()}
      loading="lazy"
      src={assetUrl('ip/center-signal.gif')}
    />
  )
}
