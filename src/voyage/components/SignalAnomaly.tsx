import { ArrowLeft, Radio, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { cinematicAssets } from '../content/cinematicAssets'
import { CinematicBackdrop } from './CinematicBackdrop'

export function SignalAnomaly({ onBack }: { onBack: () => void }) {
  const [revealed, setRevealed] = useState<number[]>([])
  const reveal = (index: number) => setRevealed((current) => current.includes(index) ? current : [...current, index])
  return <main className="signal-anomaly"><CinematicBackdrop alt="异常广播中的流动液态星云" desktopVideoSrc={cinematicAssets.eggLiquid.desktopVideo} mobileVideoSrc={cinematicAssets.eggLiquid.mobileVideo} posterSrc={cinematicAssets.eggLiquid.poster} /><div className="signal-anomaly__scan" aria-hidden="true" /><section><span className="signal-anomaly__code"><Radio size={16} /> BROADCAST / 404</span><h1>没有一种航线，<br /><em>只能走一次。</em></h1><p>你刚刚留下的信号会变化、会偏航，也会被新的问题重新点亮。科创不是一张测评表能概括的答案，而是你愿意继续追问的那一刻。</p><div className="signal-anomaly__signals" aria-label="隐藏信号点">{['问题会回来', '路径会分岔', '答案会长大'].map((label, index) => <button aria-label={`解码隐藏信号${index + 1}`} className={revealed.includes(index) ? 'is-revealed' : ''} key={label} onClick={() => reveal(index)} type="button"><i /><span>{revealed.includes(index) ? label : `0${index + 1}`}</span></button>)}</div><button className="voyage-cta voyage-cta--primary" onClick={onBack} type="button"><ArrowLeft size={17} /><span>回到试航报告</span></button></section><span className="signal-anomaly__spin"><RotateCw size={15} /> SIGNAL LOOP / OPEN</span></main>
}
