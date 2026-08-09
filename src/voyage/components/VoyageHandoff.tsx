import { ArrowRight, Sparkles } from 'lucide-react'
import { cinematicAssets } from '../content/cinematicAssets'
import { CinematicBackdrop } from './CinematicBackdrop'

export function VoyageHandoff({ onBegin }: { onBegin: () => void }) {
  return (
    <main className="voyage-handoff">
      <CinematicBackdrop alt="穿越黑洞后的信号漂移" desktopVideoSrc={cinematicAssets.handoffDrift.desktopVideo} mobileVideoSrc={cinematicAssets.handoffDrift.mobileVideo} posterSrc={cinematicAssets.handoffDrift.poster} />
      <div className="voyage-handoff__orbit" aria-hidden="true"><i /><i /><i /><b>YOU</b></div>
      <p className="voyage-eyebrow">SIGNAL TRANSFER / 03</p>
      <h1>刚才看到的是<br /><em>别人的故事。</em></h1>
      <p>现在，轮到你试一次。</p>
      <button className="voyage-cta voyage-cta--primary" onClick={onBegin} type="button"><span>试试就试试</span><ArrowRight size={17} /></button>
      <span className="voyage-handoff__note"><Sparkles size={14} /> 五站行动，不是考试</span>
    </main>
  )
}
