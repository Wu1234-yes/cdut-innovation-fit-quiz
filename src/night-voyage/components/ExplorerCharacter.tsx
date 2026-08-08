import { useState } from 'react'
import { explorerPoseSources } from '../content/sceneVisuals'
import type { ExplorerPose } from '../content/types'

interface ExplorerCharacterProps {
  pose: ExplorerPose
  label?: string
  decorative?: boolean
  className?: string
}

export function ExplorerCharacter({
  pose,
  label = '白色探索者正在科创夜航世界中行动',
  decorative = false,
  className = '',
}: ExplorerCharacterProps) {
  const [failedPose, setFailedPose] = useState<ExplorerPose | null>(null)
  const source = failedPose === pose
    ? explorerPoseSources.idle
    : explorerPoseSources[pose]

  return (
    <span
      aria-hidden={decorative || undefined}
      className={`explorer-character is-${pose} ${className}`.trim()}
      data-explorer-pose={pose}
      data-testid="explorer-avatar"
    >
      <span aria-hidden="true" className="explorer-character__trail" />
      <img
        alt={decorative ? '' : label}
        data-explorer-pose={pose}
        onError={() => setFailedPose(pose)}
        src={source}
      />
      <span aria-hidden="true" className="explorer-character__contact" />
    </span>
  )
}
