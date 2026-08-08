import { ArrowLeft } from 'lucide-react'
import type { SceneSignalSubmission } from '../app/journeyReducer'
import type { JourneySignals, SceneId } from '../content/types'
import { ClueScene } from '../scenes/ClueScene'
import { DialogueScene } from '../scenes/DialogueScene'
import { ExpressionScene } from '../scenes/ExpressionScene'
import { MapScene } from '../scenes/MapScene'
import { ObservationScene } from '../scenes/ObservationScene'

interface SceneDirectorProps {
  activeSceneId: SceneId
  signals: JourneySignals
  onReturn: () => void
  onComplete: (sceneId: SceneId, signal: SceneSignalSubmission) => void
}

export function SceneDirector({
  activeSceneId,
  signals,
  onReturn,
  onComplete,
}: SceneDirectorProps) {
  const scene = (() => {
    switch (activeSceneId) {
      case 'observation':
        return (
          <ObservationScene
            initial={signals.observation}
            onComplete={(observation) => onComplete(activeSceneId, { observation })}
          />
        )
      case 'clues':
        return (
          <ClueScene
            initial={signals.clues}
            onComplete={(clues) => onComplete(activeSceneId, { clues })}
          />
        )
      case 'dialogue':
        return (
          <DialogueScene
            initial={signals.dialogue}
            onComplete={(dialogue) => onComplete(activeSceneId, { dialogue })}
          />
        )
      case 'map':
        return (
          <MapScene
            initial={signals.route}
            onComplete={(route) => onComplete(activeSceneId, { route })}
          />
        )
      case 'expression':
        return (
          <ExpressionScene
            initialExpression={signals.expression}
            initialTuning={signals.expressionTuning}
            onComplete={({ expression, tuning }) =>
              onComplete(activeSceneId, {
                expression,
                expressionTuning: tuning,
              })
            }
          />
        )
    }
  })()

  return (
    <main className="scene-director">
      <nav className="scene-director__nav" aria-label="探索场景导航">
        <button onClick={onReturn} type="button">
          <ArrowLeft aria-hidden="true" size={18} />
          <span>返回夜航枢纽</span>
        </button>
        <p>SCENE DIRECTOR / {activeSceneId.toUpperCase()}</p>
      </nav>
      {scene}
    </main>
  )
}
