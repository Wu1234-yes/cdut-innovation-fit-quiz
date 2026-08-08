import { Clapperboard, RadioTower, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { projects } from '../content/projects'
import type { ActionProfile } from '../content/types'

interface ResultObservatoryProps {
  profile: ActionProfile
  onOpenScreening: () => void
  fastPath?: boolean
}

export function ResultObservatory({
  profile,
  onOpenScreening,
  fastPath = false,
}: ResultObservatoryProps) {
  const nodes = useMemo(
    () => [
      ...profile.traits.map((item) => ({ ...item, detail: item.evidence })),
      ...profile.researchScenes.map((item) => ({ ...item, detail: item.description })),
    ].slice(0, 5),
    [profile],
  )
  const [activeId, setActiveId] = useState(nodes[0]?.id)
  const active = nodes.find(({ id }) => id === activeId) ?? nodes[0]
  const previews = [...projects]
    .sort((left, right) => left.screeningPriority - right.screeningPriority)
    .slice(0, 3)

  return (
    <header className="result-observatory" data-testid="result-observatory">
      <div className="result-observatory__copy">
        <p>ACTION OBSERVATORY / NIGHT VOYAGE</p>
        <h1>{fastPath ? '从一件小事开始，也算科创' : '你的夜航信号，正在连成一张星图'}</h1>
        <span>{fastPath ? '这里没有门槛测试，先看真实行动怎样发生。' : '点亮五个节点，回看你刚才怎样观察、连接、询问、推进与表达。这不是人格结论，只是一段行动回放。'}</span>
        <div className="result-observatory__readout" aria-live="polite">
          <Sparkles aria-hidden="true" size={18} />
          <div>
            <strong>{active?.title}</strong>
            <p>{active?.detail}</p>
          </div>
        </div>
      </div>

      <section aria-label="五段行动轨迹" className="result-observatory__trace">
        <p>YOUR ROUTE / FIVE MOMENTS</p>
        <div>
        {nodes.map((node, index) => (
          <button
            aria-label={`回看：${node.title}`}
            aria-pressed={node.id === activeId}
            className={node.id === activeId ? 'is-active' : ''}
            data-testid="observatory-node"
            key={node.id}
            onClick={() => setActiveId(node.id)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{node.title}</strong>
          </button>
        ))}
        </div>
      </section>

      <aside className="result-observatory__screening">
        <div className="result-observatory__screens" aria-hidden="true">
          {previews.map((project) => (
            <span key={project.id}>
              <img alt="" src={project.media.src} style={{ objectPosition: project.media.objectPosition }} />
            </span>
          ))}
          <i><RadioTower size={20} /></i>
        </div>
        <p>REAL PROJECT SIGNALS</p>
        <h2>别只看结论，去看看科创现场正在发生什么</h2>
        <button className="voyage-control voyage-control--primary" onClick={onOpenScreening} type="button">
          <Clapperboard aria-hidden="true" size={20} />
          <span>进入科创放映舱</span>
        </button>
      </aside>
    </header>
  )
}
