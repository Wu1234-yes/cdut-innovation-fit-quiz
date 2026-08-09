import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { stations, toStationAnswer, type StationDefinition } from '../content/journey'
import type { StationAnswer, StationId } from '../app/voyageReducer'
import { CinematicBackdrop } from './CinematicBackdrop'

interface StationShellProps { stationId: StationId; answers: Partial<Record<StationId, StationAnswer>>; onComplete: (answer: StationAnswer) => void; onBack: () => void; onReport: () => void }

export function StationShell({ stationId, answers, onComplete, onBack, onReport }: StationShellProps) {
  const station = stations.find((item) => item.id === stationId) as StationDefinition
  const [choiceId, setChoiceId] = useState(answers[stationId]?.choiceId ?? '')
  const [confirmed, setConfirmed] = useState(false)
  const choice = station.choices.find((item) => item.id === choiceId)
  const confirm = () => { if (!choice) return; setConfirmed(true); window.setTimeout(() => onComplete(toStationAnswer(station, choice)), 430) }

  useEffect(() => {
    const stationIndex = stations.findIndex((item) => item.id === stationId)
    const nextStation = stations[stationIndex + 1]
    if (!nextStation) return

    const isMobile = window.matchMedia?.('(max-width: 680px)').matches ?? false
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'video'
    link.type = 'video/mp4'
    link.href = isMobile ? nextStation.mobileVideo : nextStation.video
    link.dataset.voyagePrefetch = 'next-station'
    document.head.append(link)

    return () => link.remove()
  }, [stationId])

  return (
    <main className={`station-shell station-shell--${station.id}`} style={{ '--station-accent': station.accent } as CSSProperties}>
      <CinematicBackdrop alt={station.title} desktopVideoSrc={station.video} mobileVideoSrc={station.mobileVideo} posterSrc={station.poster} />
      <header className="voyage-topbar station-shell__topbar"><button className="icon-button" aria-label="返回行动导航" onClick={onBack} type="button"><ArrowLeft size={18} /></button><span className="voyage-mark"><Sparkles size={17} /> STATION {station.number}</span><button className="voyage-quiet-link" onClick={onReport} type="button">先看报告</button></header>
      <section className="station-shell__content"><div className="station-shell__heading"><p className="voyage-eyebrow">{station.eyebrow}</p><h1>{station.title}</h1><p>{station.prompt}</p><span className="station-shell__instruction">{station.instruction}</span></div>
        <div className={`station-shell__interaction ${confirmed ? 'is-confirmed' : ''}`}>
          <div className="station-shell__signal-line" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="station-shell__choices" role="radiogroup" aria-label={station.prompt}>{station.choices.map((item) => <button aria-checked={choiceId === item.id} aria-pressed={choiceId === item.id} className={choiceId === item.id ? 'is-selected' : ''} data-signal-state={choiceId === item.id ? (confirmed ? 'locked' : 'selected') : 'idle'} key={item.id} onClick={() => setChoiceId(item.id)} role="radio" type="button"><span>{item.id === choice?.id && confirmed ? 'SIGNAL LOCKED' : item.detail}</span><strong>{item.label}</strong><i /></button>)}</div>
          <div className="station-shell__feedback" aria-live="polite">{confirmed && choice ? <><strong>{choice.feedback}</strong><span>这就是一种真实的科创行动。</span></> : <span>选择没有对错，只会打开不同的下一步。</span>}</div>
        </div>
      </section>
      <footer className="station-shell__footer"><span>{Object.keys(answers).length}/5 STATIONS LOGGED</span><button className="voyage-cta voyage-cta--primary" disabled={!choice || confirmed} onClick={confirm} type="button">{confirmed ? <><RotateCcw size={17} /><span>信号已记录</span></> : <><span>接入这条信号</span><ArrowRight size={17} /></>}</button></footer>
    </main>
  )
}
