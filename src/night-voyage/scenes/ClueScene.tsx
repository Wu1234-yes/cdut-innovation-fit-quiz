import { Magnet, Orbit } from 'lucide-react'
import { useState } from 'react'
import type { ClueId } from '../content/types'
import { SceneScaffold } from './SceneScaffold'

interface ClueSceneProps {
  initial?: ClueId[]
  onComplete: (values: ClueId[]) => void
}

const fragments: Array<{ id: ClueId; label: string; caption: string }> = [
  { id: 'beginner-note', label: '新手留言', caption: '“没有经验，也能参与吗？”' },
  { id: 'project-record', label: '项目记录', caption: '三个节点之间还缺一次确认。' },
  { id: 'event-image', label: '现场影像', caption: '画面里留下了事情发生的顺序。' },
  { id: 'schedule-gap', label: '时间空档', caption: '周末下午，刚好够一次小尝试。' },
]

const getCombination = (selected: ClueId[]) => {
  const has = (id: ClueId) => selected.includes(id)
  if (has('beginner-note') && has('project-record')) return '疑问接上项目记录后，参与才有落点：先认领一次资料核对就能开始。'
  if (has('beginner-note') && has('event-image')) return '留言与现场影像放在一起，新手能先看懂事情怎样发生，再决定从哪一步加入。'
  if (has('beginner-note') && has('schedule-gap')) return '把担心和空档接起来，不必先证明自己，只要在可用时间里完成一次小尝试。'
  if (has('project-record') && has('event-image')) return '记录给出节点，影像补回过程，两者一起能找到下一次确认应该发生在哪里。'
  if (has('project-record') && has('schedule-gap')) return '缺失节点遇到明确空档，项目就从“以后再说”变成一段可以安排的行动。'
  return '现场顺序与时间空档连起来，可以找到最适合复现或补拍的那一个片段。'
}

export function ClueScene({ initial = [], onComplete }: ClueSceneProps) {
  const [selected, setSelected] = useState<ClueId[]>(initial.slice(0, 2))

  const toggle = (id: ClueId) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length < 2) return [...current, id]
      return [current[1], id]
    })
  }

  return (
    <SceneScaffold
      eyebrow="NIGHT SITE 02 / MAGNETIC ORBIT"
      instruction="点击两块碎片，它们会自动吸附到核心轨道。"
      mascotDialogue={selected.length === 2 ? '两块信息已经接上了，关系比单独的答案更有用。' : '先选两块你愿意继续了解的信息。'}
      mascotState={selected.length === 2 ? 'react' : 'guide'}
      currentStep={selected.length === 2 ? 3 : selected.length + 1}
      onSkip={() => onComplete(['beginner-note', 'project-record'])}
      prompt="哪两块信息放在一起，会让事情更清楚？"
      sceneClass="voyage-scene--clues"
      status={selected.length === 2 ? '双信号轨道稳定' : undefined}
      title="磁吸星图"
      totalSteps={3}
      visualId="clues"
    >
      <div className="magnetic-map">
        <div className="magnetic-map__core" aria-hidden="true">
          <Orbit size={40} />
          <i />
          <i />
        </div>
        <div className="magnetic-map__fragments">
          {fragments.map((fragment) => {
            const active = selected.includes(fragment.id)
            return (
              <button
                aria-pressed={active}
                className={active ? 'is-docked' : ''}
                key={fragment.id}
                onClick={() => toggle(fragment.id)}
                type="button"
              >
                <Magnet aria-hidden="true" size={18} />
                <strong>{fragment.label}</strong>
                <span>{fragment.caption}</span>
                <small>{active ? '已进入轨道' : '等待吸附'}</small>
              </button>
            )
          })}
        </div>
        {selected.length === 2 && (
          <aside aria-label="组合解释" className="magnetic-map__combination">
            <small>ORBIT INTERPRETATION</small>
            <strong>{selected.map((id) => fragments.find((item) => item.id === id)?.label).join(' × ')}</strong>
            <p>{getCombination(selected)}</p>
          </aside>
        )}
      </div>
      <button
        className="voyage-button voyage-button--primary scene-complete-button"
        disabled={selected.length !== 2}
        onClick={() => onComplete(selected)}
        type="button"
      >
        锁定这条星图
      </button>
    </SceneScaffold>
  )
}
