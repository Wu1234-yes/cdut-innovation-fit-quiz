import { ScanSearch, Sparkles } from 'lucide-react'
import { useState, type CSSProperties, type PointerEvent } from 'react'
import type { ObservationId } from '../content/types'
import { SceneScaffold } from './SceneScaffold'

interface ObservationSceneProps {
  initial?: ObservationId[]
  onComplete: (values: ObservationId[]) => void
}

const targets: Array<{
  id: ObservationId
  label: string
  caption: string
  insight: string
  trace: string
}> = [
  { id: 'detail', label: '异常变化', caption: '同一束信号连续改变了三次方向。', insight: '连续改变方向不是一个静止标签，而是一段值得继续追踪的变化。', trace: '03 次偏转 / 方向仍在变化' },
  { id: 'people', label: '协作回声', caption: '几段声音正在尝试对齐同一个问题。', insight: '声音没有互相覆盖，它们正在补齐同一个问题的不同部分。', trace: '04 段回声 / 关键词开始重合' },
  { id: 'place', label: '未亮区域', caption: '一处装置还差最后一段能量。', insight: '暗处不是空白，它提示我们还有一个环节没有接入行动。', trace: '01 个缺口 / 等待首次接入' },
]

export function ObservationScene({
  initial = [],
  onComplete,
}: ObservationSceneProps) {
  const [selected, setSelected] = useState<ObservationId | null>(initial[0] ?? null)
  const [inspected, setInspected] = useState(initial.length > 0)
  const [lens, setLens] = useState({ x: 56, y: 48 })
  const selectedTarget = targets.find(({ id }) => id === selected)

  const moveLens = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    setLens({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    })
  }

  return (
    <SceneScaffold
      eyebrow="NIGHT SITE 01 / EXPLORATION LENS"
      instruction="拖动光圈，或直接聚焦一个信号。"
      mascotDialogue={selected ? '看见了。先记住它，不急着解释。' : '暗处不一定有答案，但可能有值得多看一眼的变化。'}
      mascotState={selected ? 'react' : 'focus'}
      currentStep={inspected ? 3 : selected ? 2 : 1}
      onSkip={() => onComplete(['detail'])}
      prompt="哪一处让你想停下来多看一眼？"
      sceneClass="voyage-scene--observation"
      status={selected ? '信号已显影' : undefined}
      title="探索镜"
      totalSteps={3}
      visualId="observation"
    >
      <div
        className={`exploration-lens ${inspected ? 'is-inspected' : ''}`}
        onPointerMove={moveLens}
        style={
          {
            '--lens-x': `${lens.x}%`,
            '--lens-y': `${lens.y}%`,
          } as CSSProperties
        }
      >
        <div className="exploration-lens__surface" aria-hidden="true">
          <i />
          <i />
          <i />
          <ScanSearch size={34} />
        </div>
        <div className="exploration-lens__targets">
          {targets.map((target, index) => (
            <button
              aria-pressed={selected === target.id}
              className={selected === target.id ? 'is-selected' : ''}
              key={target.id}
              onClick={() => {
                setSelected(target.id)
                setInspected(false)
                setLens({ x: 28 + index * 23, y: index === 1 ? 36 : 62 })
              }}
              type="button"
            >
              <span><Sparkles aria-hidden="true" size={18} /></span>
              <strong>{target.label}</strong>
              <small>{target.caption}</small>
            </button>
          ))}
        </div>
        {inspected && selectedTarget && (
          <section
            aria-label={`放大观察：${selectedTarget.label}`}
            className="exploration-lens__inspection"
          >
            <div className="exploration-lens__scan" aria-hidden="true">
              <span />
              <i />
              <ScanSearch size={30} />
            </div>
            <div>
              <small>FOCUS LOCKED / {selectedTarget.trace}</small>
              <h2>{selectedTarget.label}</h2>
              <p>{selectedTarget.insight}</p>
            </div>
          </section>
        )}
      </div>
      <button
        className="voyage-button voyage-button--primary scene-complete-button"
        disabled={!selected}
        onClick={() => {
          if (!selected) return
          if (!inspected) {
            setInspected(true)
            return
          }
          onComplete([selected])
        }}
        type="button"
      >
        {inspected ? '带回这束信号' : '放大查看这处细节'}
      </button>
    </SceneScaffold>
  )
}
