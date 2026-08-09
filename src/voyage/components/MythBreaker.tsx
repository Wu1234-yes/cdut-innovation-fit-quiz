import { ArrowRight, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { cinematicAssets } from '../content/cinematicAssets'
import { CinematicBackdrop } from './CinematicBackdrop'

const myths = [
  { quote: '“我什么都不会，应该还轮不到我。”', reply: '很多真实任务，都是从查资料、记一次会议或拍一张现场照开始。', evidence: 'START / 从小动作接入' },
  { quote: '“科创是不是只能做很难的研究？”', reply: '发现问题、尝试方案、把成果讲清楚，都是科创里很重要的部分。', evidence: 'FIELD / 从行动理解' },
  { quote: '“我还不知道自己适合什么。”', reply: '不用急着被归类，先看看你愿意把哪件小事做下去。', evidence: 'OPEN / 先探索再决定' },
]

export function MythBreaker({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState<number[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const reveal = (index: number) => {
    setActiveIndex(index)
    setRevealed((current) => current.includes(index) ? current : [...current, index])
  }
  return (
    <main className="myth-breaker">
      <CinematicBackdrop alt="破冰信号中的绿色星球" desktopVideoSrc={cinematicAssets.mythPlanet.desktopVideo} mobileVideoSrc={cinematicAssets.mythPlanet.mobileVideo} posterSrc={cinematicAssets.mythPlanet.poster} />
      <div className="myth-breaker__halo" aria-hidden="true" />
      <header className="voyage-topbar"><span className="voyage-mark"><Sparkles aria-hidden="true" size={17} /> SIGNAL DECODE / 01</span><span className="voyage-topbar__status"><i /> 3 SIGNALS</span></header>
      <section className="myth-breaker__heading">
        <p className="voyage-eyebrow">先拆掉几个误会</p>
        <h1>科创没有一扇<br /><em>必须先懂的门。</em></h1>
        <p>点开三条信号，看看一件事是怎样从“我不会”变成“我先试试”。</p>
      </section>
      <section className="myth-breaker__grid" aria-label="三个科创误会">
        {myths.map((myth, index) => {
          const isOpen = revealed.includes(index)
          return (
            <button aria-expanded={isOpen} className={`myth-card ${isOpen ? 'is-open' : ''} ${activeIndex === index ? 'is-focused' : ''}`} key={myth.quote} onClick={() => reveal(index)} type="button">
              <span className="myth-card__index">0{index + 1} / SIGNAL</span>
              {isOpen ? <><span className="myth-card__reply">{myth.reply}</span><span className="myth-card__evidence">{myth.evidence}</span></> : <><strong>{myth.quote}</strong><span className="myth-card__open"><X aria-hidden="true" size={15} /> 拆开看看</span></>}
            </button>
          )
        })}
      </section>
      <footer className="myth-breaker__footer">
        <span>{revealed.length}/3 已解码</span>
        <button className="voyage-cta voyage-cta--primary" disabled={revealed.length < 3} onClick={onComplete} type="button"><span>进入科创放映仓</span><ArrowRight aria-hidden="true" size={17} /></button>
      </footer>
    </main>
  )
}
