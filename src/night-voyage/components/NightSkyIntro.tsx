import { ArrowRight, Telescope } from 'lucide-react'
import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { NightSkyFallback } from './NightSkyFallback'
import type { NightSkySceneProps } from './NightSkyScene'
import { VoyageMascot } from './VoyageMascot'

export type NightSceneLoader = () => Promise<{
  default: ComponentType<NightSkySceneProps>
}>

const defaultSceneLoader: NightSceneLoader = () => import('./NightSkyScene')

interface NightSkyIntroProps {
  onStart: () => void
  onExplore: () => void
  enhanced?: boolean
  sceneLoader?: NightSceneLoader
}

type EnhancedStatus = 'loading' | 'ready' | 'failed'

const enhancedStatusText: Record<EnhancedStatus, string> = {
  loading: '正在接入实时星图，页面已经可以操作',
  ready: '实时星图已就绪',
  failed: '增强星图暂不可用，静态星图已就绪',
}

function EnhancedNightSky({ sceneLoader }: { sceneLoader: NightSceneLoader }) {
  const [loaded, setLoaded] = useState<{
    loader: NightSceneLoader
    Scene: ComponentType<NightSkySceneProps> | null
    status: EnhancedStatus
  }>({ loader: sceneLoader, Scene: null, status: 'loading' })
  const current = loaded.loader === sceneLoader
    ? loaded
    : { loader: sceneLoader, Scene: null, status: 'loading' as const }

  useEffect(() => {
    let active = true
    sceneLoader()
      .then((module) => {
        if (active) {
          setLoaded({ loader: sceneLoader, Scene: module.default, status: 'loading' })
        }
      })
      .catch(() => {
        if (active) {
          setLoaded({ loader: sceneLoader, Scene: null, status: 'failed' })
        }
      })

    return () => {
      active = false
    }
  }, [sceneLoader])

  const handleSceneReady = useCallback(() => {
    setLoaded((state) => state.loader === sceneLoader
      ? { ...state, status: 'ready' }
      : state)
  }, [sceneLoader])
  const handleSceneError = useCallback(() => {
    setLoaded((state) => state.loader === sceneLoader
      ? { ...state, Scene: null, status: 'failed' }
      : state)
  }, [sceneLoader])

  return (
    <>
      {current.Scene ? (
        <current.Scene onError={handleSceneError} onReady={handleSceneReady} />
      ) : null}
      <p className="sr-only" role="status">
        {enhancedStatusText[current.status]}
      </p>
    </>
  )
}

export function NightSkyIntro({
  onStart,
  onExplore,
  enhanced = true,
  sceneLoader = defaultSceneLoader,
}: NightSkyIntroProps) {
  const { reducedMotion, coarsePointer, saveData } = useMotionPreference()
  const canEnhance = enhanced && !reducedMotion && !(coarsePointer && saveData)

  return (
    <main className="night-intro">
      <NightSkyFallback />
      {canEnhance ? (
        <EnhancedNightSky sceneLoader={sceneLoader} />
      ) : (
        <p className="sr-only" role="status">静态星图已就绪</p>
      )}

      <header className="night-intro__brand">
        <span aria-hidden="true" className="night-intro__brand-mark">CYIS</span>
        <p>成都理工大学青年科技创新服务中心</p>
      </header>

      <div className="night-intro__grid">
        <section className="night-intro__copy" aria-labelledby="night-voyage-title">
          <p className="night-intro__eyebrow">SIGNAL 00 / CAMPUS NIGHT</p>
          <h1 id="night-voyage-title">科创夜航</h1>
          <p className="night-intro__lead">
            大学里有很多可能，但我还不知道自己能做什么。
          </p>
          <div className="night-intro__actions">
            <button className="voyage-button voyage-button--primary" onClick={onStart} type="button">
              <span>开始夜航</span>
              <ArrowRight aria-hidden="true" size={19} strokeWidth={1.8} />
            </button>
            <button className="voyage-button voyage-button--quiet" onClick={onExplore} type="button">
              <Telescope aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>直接看看科创能做什么</span>
            </button>
          </div>
        </section>

        <aside className="night-intro__beacon">
          <div className="night-intro__beacon-line" />
          <VoyageMascot pose="launch" />
          <p aria-hidden="true">BEACON ONLINE</p>
        </aside>
      </div>

      <footer className="night-intro__footer" aria-hidden="true">
        <span>30.67 N</span>
        <span>104.06 E</span>
        <span>SCROLL / CAMPUS TRACE</span>
      </footer>

    </main>
  )
}
