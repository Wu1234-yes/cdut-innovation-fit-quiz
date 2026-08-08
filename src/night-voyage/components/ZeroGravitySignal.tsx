import { ArrowRight, Check, Radio, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { CinematicBackdrop } from './CinematicBackdrop'

interface ZeroGravitySignalProps {
  onClose: () => void
}

type SignalId = 'step' | 'companion' | 'question'

const signalChoices: Array<{ id: SignalId; index: string; title: string; detail: string }> = [
  { id: 'step', index: '01', title: '先做一小步', detail: '让想法先离开脑海' },
  { id: 'companion', index: '02', title: '找一个同行者', detail: '把一个人的好奇变成协作' },
  { id: 'question', index: '03', title: '把问题说清楚', detail: '让模糊的感觉开始有方向' },
]

const replies: Record<SignalId, string> = {
  step: '你不需要先准备好全部答案。把第一步做小一点，路就会自己显出来。',
  companion: '真正的航行很少独自发生。一个愿意一起试试的人，就足以让想法换一条轨道。',
  question: '问题被说清楚的那一刻，研究才有了可以被看见、被验证、被继续的入口。',
}

export function ZeroGravitySignal({ onClose }: ZeroGravitySignalProps) {
  const [selectedSignal, setSelectedSignal] = useState<SignalId | null>(null)
  const [received, setReceived] = useState(false)
  const [trail, setTrail] = useState(false)
  const { reducedMotion, saveData } = useMotionPreference()

  const selectSignal = (signal: SignalId) => {
    setSelectedSignal(signal)
    setReceived(false)
    setTrail(false)
  }

  return (
    <section
      aria-describedby="future-reply-intro"
      aria-label="失重信号舱"
      aria-modal="true"
      className={`zero-gravity-signal ${received ? 'is-received' : ''} ${trail ? 'is-trail' : ''}`.trim()}
      data-signal={selectedSignal ?? 'idle'}
      role="dialog"
    >
      <CinematicBackdrop
        alt="一束来自未来的光在宇宙中穿行"
        className="zero-gravity-signal__backdrop"
        desktopVideoSrc="/media/night-voyage/future-reply-desktop.mp4"
        focalPoint="50% 50%"
        mobilePosterSrc="/media/night-voyage/future-reply.webp"
        mobileVideoSrc="/media/night-voyage/future-reply-mobile.mp4"
        posterSrc="/media/night-voyage/future-reply.webp"
        reducedMotion={reducedMotion || saveData}
      />
      <button aria-label="返回夜航枢纽" className="zero-gravity-signal__close" onClick={onClose} type="button">
        <X aria-hidden="true" size={20} />
      </button>
      <div className="zero-gravity-signal__field" aria-hidden="true">
        <div className="zero-gravity-signal__scanline" />
        <i />
        <i />
        <i />
        <span><Radio size={32} /></span>
        <b />
      </div>
      <div className="zero-gravity-signal__copy">
        <p>OPTIONAL SIGNAL / FUTURE REPLY</p>
        <h2>来自未来的回信</h2>
        <span id="future-reply-intro">这不是测试，也不会替你下结论。选一束现在最想发出的信号，看看未来会怎样回望今天。</span>
        <div className="zero-gravity-signal__choices" aria-label="选择一束未来信号">
          {signalChoices.map((choice) => {
            const selected = selectedSignal === choice.id
            return (
              <button
                aria-label={choice.title}
                aria-pressed={selected}
                className={selected ? 'is-selected' : ''}
                key={choice.id}
                onClick={() => selectSignal(choice.id)}
                type="button"
              >
                <span className="zero-gravity-signal__choice-index">{choice.index}</span>
                <span>
                  <strong>{choice.title}</strong>
                  <small>{choice.detail}</small>
                </span>
                {selected ? <Check aria-hidden="true" size={18} /> : <ArrowRight aria-hidden="true" size={18} />}
              </button>
            )
          })}
        </div>
        <div className="zero-gravity-signal__actions">
          <button
            className="zero-gravity-signal__receive"
            disabled={!selectedSignal}
            onClick={() => setReceived(true)}
            type="button"
          >
            <Sparkles aria-hidden="true" size={17} />
            <span>接收这封回信</span>
          </button>
          <strong aria-live="polite">
            {!selectedSignal ? '请选择一束信号' : received ? '回信已抵达' : '信号已锁定，等待接收'}
          </strong>
        </div>
        {received && selectedSignal ? (
          <article className="zero-gravity-signal__reply" aria-live="polite">
            <header>
              <span>INCOMING / 2041.09</span>
              <span>REPLY RECEIVED</span>
            </header>
            <p>{replies[selectedSignal]}</p>
            <button className="zero-gravity-signal__trail" onClick={() => setTrail(true)} type="button">
              <span>{trail ? '星轨已经形成' : '让回信形成星轨'}</span>
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          </article>
        ) : null}
      </div>
    </section>
  )
}
