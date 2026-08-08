import type { MascotPose, MascotState } from '../content/types'

const stateToPose: Record<MascotState, MascotPose> = {
  idle: 'launch',
  guide: 'launch',
  focus: 'focus',
  react: 'research',
  celebrate: 'cheer',
  projector: 'research',
}

const altText: Record<MascotState, string> = {
  idle: '科创小助手正在等待下一束信号',
  guide: '科创小助手正在指引夜航方向',
  focus: '科创小助手正在仔细观察信号',
  react: '科创小助手正在回应新的发现',
  celebrate: '科创小助手为完成探索挥手庆祝',
  projector: '科创小助手正在操作科创放映舱',
}

interface VoyageMascotProps {
  state?: MascotState
  pose?: MascotPose
  dialogue?: string
  side?: 'left' | 'right'
  className?: string
  decorative?: boolean
  reducedMotion?: boolean
  compact?: boolean
}

export function VoyageMascot({
  state,
  pose,
  dialogue,
  side = 'left',
  className = '',
  decorative = false,
  reducedMotion = false,
  compact = false,
}: VoyageMascotProps) {
  const resolvedState = state ?? (pose === 'cheer' ? 'celebrate' : pose === 'focus' ? 'focus' : pose === 'research' ? 'react' : 'guide')
  const resolvedPose = pose ?? stateToPose[resolvedState]
  const src = `${import.meta.env.BASE_URL}ip/${resolvedPose}.png`.replace(/\/+/g, '/')

  return (
    <div
      aria-hidden={decorative || undefined}
      className={`voyage-mascot-shell is-${side} is-${resolvedState} ${compact ? 'is-compact' : ''} ${reducedMotion ? 'is-reduced' : ''} ${className}`.trim()}
      data-testid="voyage-mascot"
    >
      {dialogue ? (
        <div className="voyage-mascot__dialogue" role="status">
          <p>{dialogue}</p>
        </div>
      ) : null}
      <img
        alt={decorative ? '' : altText[resolvedState]}
        className="voyage-mascot"
        data-mascot-state={resolvedState}
        decoding="async"
        draggable={false}
        key={resolvedPose}
        src={src}
      />
    </div>
  )
}
