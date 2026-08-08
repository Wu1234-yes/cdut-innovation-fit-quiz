import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { sceneVisuals } from '../content/sceneVisuals'
import type { CosmicWorldId } from '../content/types'
import { CinematicBackdrop } from './CinematicBackdrop'

interface CosmicSceneStageProps {
  as?: 'div' | 'main' | 'section'
  visualId: CosmicWorldId
  children?: ReactNode
  foreground?: ReactNode
  reducedMotion?: boolean
  className?: string
  style?: CSSProperties
}

type StageStyle = CSSProperties & {
  '--scene-accent': string
  '--scene-focal-point': string
  '--scene-x': string
  '--scene-y': string
}

export function CosmicSceneStage({
  as: StageElement = 'div',
  visualId,
  children,
  foreground,
  reducedMotion = false,
  className = '',
  style: customStyle,
}: CosmicSceneStageProps) {
  const visual = sceneVisuals[visualId]
  const [hidden, setHidden] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || hidden) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    event.currentTarget.style.setProperty('--scene-x', x.toFixed(3))
    event.currentTarget.style.setProperty('--scene-y', y.toFixed(3))
  }

  const style: StageStyle = {
    ...customStyle,
    '--scene-accent': visual.accent,
    '--scene-focal-point': visual.focalPoint,
    '--scene-x': '0',
    '--scene-y': '0',
  }

  return (
    <StageElement
      className={`cosmic-scene-stage world-${visualId} ${visual.videoSrc || visual.desktopVideoSrc || visual.mobileVideoSrc ? 'has-video' : ''} ${reducedMotion ? 'is-reduced' : ''} ${hidden ? 'is-hidden' : ''} ${className}`.trim()}
      data-testid="cosmic-scene-stage"
      data-world={visualId}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--scene-x', '0')
        event.currentTarget.style.setProperty('--scene-y', '0')
      }}
      onPointerMove={handlePointerMove}
      ref={stageRef}
      style={style}
    >
      <div className="cosmic-scene-stage__picture">
        <CinematicBackdrop
          alt={visual.alt}
          desktopVideoSrc={visual.desktopVideoSrc}
          focalPoint={visual.focalPoint}
          mobileVideoSrc={visual.mobileVideoSrc}
          mobilePosterSrc={visual.mobileSrc}
          posterSrc={visual.posterSrc ?? visual.desktopSrc}
          reducedMotion={reducedMotion}
          videoSrc={visual.videoSrc}
        />
      </div>
      <span aria-hidden="true" className="cosmic-scene-stage__dust" />
      <span aria-hidden="true" className="cosmic-scene-stage__light" />
      <span aria-hidden="true" className="cosmic-scene-stage__grain" />
      <span aria-hidden="true" className="cosmic-scene-stage__vignette" />
      {foreground && <div className="cosmic-scene-stage__foreground">{foreground}</div>}
      <div className="cosmic-scene-stage__content">{children}</div>
    </StageElement>
  )
}
