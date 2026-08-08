import { ArrowRight, Sparkles } from 'lucide-react'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { CosmicSceneStage } from './CosmicSceneStage'
import { ExplorerCharacter } from './ExplorerCharacter'
import { VoyageMascot } from './VoyageMascot'

interface CinematicPlanetIntroProps {
  onStart: () => void
  onExplore: () => void
}

export function CinematicPlanetIntro({
  onStart,
  onExplore,
}: CinematicPlanetIntroProps) {
  const { reducedMotion, saveData } = useMotionPreference()

  return (
    <CosmicSceneStage
      as="main"
      className="cinematic-intro"
      reducedMotion={reducedMotion || saveData}
      visualId="intro"
    >
      <p className="sr-only" role="status">
        {reducedMotion || saveData ? '地球静态视图已就绪' : '地球动态视图已就绪'}
      </p>

      <header className="cinematic-intro__brand">
        <span aria-hidden="true">CYIS</span>
        <p>成都理工大学青年科技创新服务中心</p>
        <i aria-hidden="true" />
      </header>

      <section className="cinematic-intro__content" aria-labelledby="voyage-title">
        <p className="cinematic-intro__eyebrow">SIGNAL 00 / CHENGDU CAMPUS ORBIT</p>
        <h1 id="voyage-title">科创夜航</h1>
        <p className="cinematic-intro__lead">
          今晚不做测试。跟着一束信号，看看一个想法怎样变成真实行动。
        </p>
        <div className="cinematic-intro__actions">
          <button
            className="voyage-button voyage-button--primary voyage-control voyage-control--primary"
            onClick={onStart}
            type="button"
          >
            <span>进入夜航</span>
            <ArrowRight aria-hidden="true" size={19} />
          </button>
          <button
            className="voyage-button voyage-button--quiet voyage-control voyage-control--quiet"
            onClick={onExplore}
            type="button"
          >
            <Sparkles aria-hidden="true" size={18} />
            <span>直接看看科创能做什么</span>
          </button>
        </div>
      </section>

      <aside className="cinematic-intro__guide">
        <div className="cinematic-intro__dialogue" role="status">
          <span>GUIDE SIGNAL</span>
          <p>先从一件小事开始，我带你去看看。</p>
        </div>
        <div className="cinematic-intro__explorer">
          <ExplorerCharacter decorative pose={reducedMotion ? 'idle' : 'enter'} />
        </div>
        <VoyageMascot
          compact
          pose="launch"
          side="right"
        />
      </aside>

      <footer className="cinematic-intro__coordinates" aria-hidden="true">
        <span>30.67 N</span>
        <span>104.06 E</span>
        <span>LOCAL SIGNAL / ONLINE</span>
      </footer>
    </CosmicSceneStage>
  )
}
