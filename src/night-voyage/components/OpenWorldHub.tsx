import {
  Antenna,
  ArrowRight,
  Check,
  Orbit,
  Radio,
  Route,
  ScanSearch,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { SceneId } from '../content/types'
import { hubDestinations } from '../content/journey'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { CosmicSceneStage } from './CosmicSceneStage'
import { ZeroGravitySignal } from './ZeroGravitySignal'

interface OpenWorldHubProps {
  completedSceneIds: SceneId[]
  onEnterScene: (sceneId: SceneId) => void
  onBeginReveal: () => void
}

const destinationIcons: Record<
  (typeof hubDestinations)[number]['objectType'],
  LucideIcon
> = {
  lens: ScanSearch,
  orbit: Orbit,
  relay: Radio,
  route: Route,
  broadcast: Antenna,
}

export function OpenWorldHub({
  completedSceneIds,
  onEnterScene,
  onBeginReveal,
}: OpenWorldHubProps) {
  const [selectedSceneId, setSelectedSceneId] = useState<SceneId>('observation')
  const [bonusOpen, setBonusOpen] = useState(false)
  const { reducedMotion } = useMotionPreference()
  const selected = hubDestinations.find(
    ({ sceneId }) => sceneId === selectedSceneId,
  )!
  const allComplete = completedSceneIds.length === hubDestinations.length
  const selectedIndex = hubDestinations.findIndex(({ sceneId }) => sceneId === selectedSceneId)

  return (
    <CosmicSceneStage as="main" className="voyage-hub" reducedMotion={reducedMotion} visualId="hub">
      <header className="voyage-hub__header">
        <div>
          <span>CYIS / NIGHT VOYAGE</span>
          <strong>夜航枢纽</strong>
        </div>
        <p>
          已回收 {completedSceneIds.length} / {hubDestinations.length} 束信号
        </p>
      </header>

      <section className="voyage-hub__world" data-testid="hub-world" data-world="hub" aria-label="夜航目的地">
        <article className="voyage-hub__preview" aria-live="polite">
          <p>SIGNAL DESTINATION / {String(selectedIndex + 1).padStart(2, '0')}</p>
          <h1>{selected.title}</h1>
          <span>{selected.invitation}</span>
          <blockquote>{selected.dialogue}</blockquote>
          <button
            className="voyage-button voyage-button--primary voyage-control voyage-control--primary"
            onClick={() => onEnterScene(selected.sceneId)}
            type="button"
          >
            <span>进入{selected.title}</span>
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </article>

        <nav className="voyage-hub__destinations" data-testid="hub-flightline" aria-label="夜航航线">
          {hubDestinations.map((destination, index) => {
            const Icon = destinationIcons[destination.objectType]
            const complete = completedSceneIds.includes(destination.sceneId)
            const selectedDestination = selectedSceneId === destination.sceneId

            return (
              <button
                aria-label={`${destination.title}，${complete ? '已完成' : destination.duration}`}
                aria-pressed={selectedDestination}
                className={`${complete ? 'is-complete' : ''} ${selectedDestination ? 'is-selected' : ''}`.trim()}
                data-testid="hub-destination"
                key={destination.sceneId}
                onClick={() => setSelectedSceneId(destination.sceneId)}
                onFocus={() => setSelectedSceneId(destination.sceneId)}
                type="button"
              >
                <span className="voyage-hub__destination-object">
                  {complete ? <Check aria-hidden="true" size={22} /> : <Icon aria-hidden="true" size={24} />}
                </span>
                <strong>{destination.title}</strong>
                <small>{complete ? '信号已回收' : `0${index + 1} / ${destination.duration}`}</small>
              </button>
            )
          })}
        </nav>
      </section>

      <footer className="voyage-hub__footer">
        <p>{allComplete ? '五束信号已经返回，可以看看它们连成了什么。' : '顺序由你决定，每一站只需要一个小动作。'}</p>
        <div className="voyage-hub__footer-actions">
          {completedSceneIds.length >= 2 && (
            <button className="voyage-button voyage-button--quiet voyage-control voyage-control--quiet" onClick={() => setBonusOpen(true)} type="button">
              <Sparkles aria-hidden="true" size={18} />
              <span>发现一束异常信号</span>
            </button>
          )}
          <button
            className="voyage-button voyage-button--quiet voyage-control voyage-control--quiet"
            disabled={!allComplete}
            onClick={onBeginReveal}
            type="button"
          >
            <Orbit aria-hidden="true" size={18} />
            <span>汇聚行动星图</span>
          </button>
        </div>
      </footer>
      {bonusOpen && <ZeroGravitySignal onClose={() => setBonusOpen(false)} />}
    </CosmicSceneStage>
  )
}
