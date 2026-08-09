import type { CSSProperties, ReactNode } from 'react'
import { CinematicBackdrop } from './CinematicBackdrop'

interface CosmicSceneStageProps {
  as?: 'main' | 'section'
  className?: string
  children: ReactNode
  reducedMotion?: boolean
  style?: CSSProperties
  visualId?: string
}

export function CosmicSceneStage({ as = 'section', className = '', children, reducedMotion = false, style, visualId = 'atlas' }: CosmicSceneStageProps) {
  const Tag = as
  return <Tag className={`cosmic-scene-stage ${className}`.trim()} data-visual-id={visualId} style={style}><CinematicBackdrop alt="科创部门探索图鉴的深空环境" desktopVideoSrc="/media/night-voyage/hub-starlight-valley-desktop.mp4" mobileVideoSrc="/media/night-voyage/hub-starlight-valley-mobile.mp4" posterSrc="/media/night-voyage/hub-starlight-valley.webp" reducedMotion={reducedMotion} />{children}</Tag>
}
