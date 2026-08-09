import { ArrowLeft, ArrowRight, Pause, Play, ScanLine } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { screeningFrames } from '../content/screening'
import type { ProjectRecord } from '../content/types'
import { CinematicBackdrop } from './CinematicBackdrop'
import { CinematicFilmReel } from './CinematicFilmReel'

interface VoyageScreeningRoomProps { projects: ProjectRecord[]; onBack: () => void; onContinue: () => void }

export function VoyageScreeningRoom({ projects, onBack, onContinue }: VoyageScreeningRoomProps) {
  const frames = useMemo(() => screeningFrames(projects), [projects])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const { reducedMotion } = useMotionPreference()
  const frame = frames[index]
  const frameProjects = frames.map((item) => item.project)
  const move = (next: number) => setIndex((next + frames.length) % frames.length)

  return (
    <main className="voyage-screening">
      <CinematicBackdrop alt="星空花野中的放映舱环境" desktopVideoSrc="/media/night-voyage/reference-background1-desktop.mp4" mobileVideoSrc="/media/night-voyage/reference-background1-mobile.mp4" posterSrc="/media/night-voyage/reference-background1.jpg" />
      <header className="voyage-topbar voyage-screening__topbar"><button className="icon-button" aria-label="返回" onClick={onBack} type="button"><ArrowLeft size={18} /></button><span className="voyage-mark"><ScanLine size={17} /> PROJECTOR ARCHIVE / 02</span><span className="voyage-topbar__status"><i /> AUTO REEL {paused ? 'PAUSED' : 'LIVE'}</span></header>
      <section className="voyage-screening__heading"><p className="voyage-eyebrow">科创放映仓 / THREE ACTS</p><h1>原来具体是在<br /><em>做这些。</em></h1><p>先看三幕真实行动，再轮到你试一次。</p></section>
      <section className="voyage-screening__stage">
        <div className="voyage-screening__beam" aria-hidden="true" />
        <CinematicFilmReel activeIndex={index} onActiveChange={move} projects={frameProjects} reducedMotion={reducedMotion || paused} />
        <article className="voyage-screening__caption" key={frame.id}>
          <span>{frame.act} / {frame.departmentName}</span><h2>{frame.departmentName} / {frame.sceneLabel}</h2><p>{frame.action}</p>
          <div className="voyage-screening__start"><small>NEW STUDENT START HERE</small><strong>{frame.startHere}</strong></div>
        </article>
      </section>
      <nav className="voyage-screening__controls" aria-label="放映仓控制">
        <button className="icon-button" aria-label="上一幕" onClick={() => move(index - 1)} type="button"><ArrowLeft size={18} /></button>
        <div className="voyage-screening__dots">{frames.map((item, i) => <button aria-label={`查看${item.departmentName}镜头`} aria-pressed={i === index} className={i === index ? 'is-active' : ''} data-act={item.act} key={item.id} onClick={() => move(i)} type="button"><span>{String(i + 1).padStart(2, '0')}</span><small>{item.departmentName}</small></button>)}</div>
        <button className="icon-button" aria-label={paused ? '继续自动放映' : '暂停自动放映'} onClick={() => setPaused((value) => !value)} type="button">{paused ? <Play size={18} /> : <Pause size={18} />}</button>
        <button className="voyage-cta voyage-cta--primary" onClick={onContinue} type="button"><span>轮到你了</span><ArrowRight size={17} /></button>
      </nav>
    </main>
  )
}
