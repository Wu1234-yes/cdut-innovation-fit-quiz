import type { ReactNode } from 'react'
import { CosmicSceneStage } from '../components/CosmicSceneStage'
import { VoyageMascot } from '../components/VoyageMascot'
import type { CosmicWorldId, MascotState } from '../content/types'
import { useMotionPreference } from '../hooks/useMotionPreference'

interface SceneScaffoldProps {
  sceneClass: string
  eyebrow: string
  title: string
  prompt: string
  instruction: string
  status?: string
  mascotState?: MascotState
  mascotDialogue?: string
  visualId: CosmicWorldId
  currentStep?: number
  totalSteps?: number
  onSkip?: () => void
  children: ReactNode
}

export function SceneScaffold({
  sceneClass,
  eyebrow,
  title,
  prompt,
  instruction,
  status,
  mascotState = 'focus',
  mascotDialogue,
  visualId,
  currentStep = 1,
  totalSteps = 3,
  onSkip,
  children,
}: SceneScaffoldProps) {
  const { reducedMotion } = useMotionPreference()

  return (
    <CosmicSceneStage className="voyage-scene-world" reducedMotion={reducedMotion} visualId={visualId}>
    <section className={`voyage-scene ${sceneClass}`}>
      <header className="voyage-scene__header">
        <div>
          <p className="voyage-scene__eyebrow">{eyebrow}</p>
          <div className="voyage-scene__progress" aria-label={`场景进度 ${currentStep} / ${totalSteps}`}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <i className={index < currentStep ? 'is-active' : ''} key={index} />
            ))}
            <span>{String(currentStep).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}</span>
          </div>
          <h1 tabIndex={-1}>{title}</h1>
          <p className="voyage-scene__prompt">{prompt}</p>
          <p className="voyage-scene__instruction">{instruction}</p>
        </div>
        <VoyageMascot
          decorative={!mascotDialogue}
          dialogue={mascotDialogue}
          side="right"
          state={mascotState}
        />
        {onSkip && (
          <button className="voyage-scene__skip" onClick={onSkip} type="button">
            跳过这站
          </button>
        )}
      </header>
      <div className="voyage-scene__action">{children}</div>
      <p aria-live="polite" className="voyage-scene__completion">
        {status}
      </p>
    </section>
    </CosmicSceneStage>
  )
}
