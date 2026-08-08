import { Image, Map, MicVocal, RadioTower, Video } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { ExpressionId } from '../content/types'
import { TriptychVideo } from '../components/TriptychVideo'
import { SceneScaffold } from './SceneScaffold'

interface ExpressionSceneProps {
  initialExpression?: ExpressionId | null
  initialTuning?: number | null
  onComplete: (value: { expression: ExpressionId; tuning: number }) => void
}

const media: Array<{
  id: ExpressionId
  label: string
  caption: string
  Icon: LucideIcon
}> = [
  { id: 'map', label: '路线图', caption: '把节点和关系画清楚', Icon: Map },
  { id: 'poster', label: '海报', caption: '让重点在几秒内被看见', Icon: Image },
  { id: 'video', label: '短片', caption: '用画面还原过程和变化', Icon: Video },
  { id: 'sharing', label: '现场分享', caption: '把发现讲给真实的人听', Icon: MicVocal },
]

export function ExpressionScene({
  initialExpression = null,
  initialTuning = 50,
  onComplete,
}: ExpressionSceneProps) {
  const [expression, setExpression] = useState<ExpressionId | null>(initialExpression)
  const [tuning, setTuning] = useState(initialTuning ?? 50)

  return (
    <SceneScaffold
      eyebrow="NIGHT SITE 05 / BROADCAST LAB"
      instruction="先选一种表达，再调整频率让信号稳定。"
      mascotDialogue={expression ? '画面已经接通，再调一点频率就能发送。' : '用你顺手的方式说清楚，比追求复杂更重要。'}
      mascotState={expression ? 'react' : 'guide'}
      currentStep={expression ? 3 : 1}
      onSkip={() => onComplete({ expression: 'map', tuning: 50 })}
      prompt="你想怎样让这次发现被别人看见？"
      sceneClass="voyage-scene--expression"
      status={expression ? '广播画面正在校准' : undefined}
      title="广播选择"
      totalSteps={3}
      visualId="expression"
    >
      <TriptychVideo
        alt="晨光越过群山，三块联动画面随广播频率逐步对齐"
        desktopVideoSrc="/media/night-voyage/expression-triptych-desktop.mp4"
        mobileVideoSrc="/media/night-voyage/expression-triptych-mobile.mp4"
        posterSrc="/media/night-voyage/expression-triptych.webp"
      />
      <div className="broadcast-lab">
        <div className="broadcast-lab__media">
          {media.map(({ id, label, caption, Icon }) => (
            <button
              aria-pressed={expression === id}
              className={expression === id ? 'is-active' : ''}
              key={id}
              onClick={() => setExpression(id)}
              type="button"
            >
              <Icon aria-hidden="true" size={25} />
              <strong>{label}</strong>
              <small>{caption}</small>
            </button>
          ))}
        </div>
        <div className={`broadcast-lab__tuner ${expression ? 'is-online' : ''}`}>
          <RadioTower aria-hidden="true" size={34} />
          <label htmlFor="broadcast-frequency">广播频率</label>
          <input
            aria-label="广播频率"
            disabled={!expression}
            id="broadcast-frequency"
            max="100"
            min="0"
            onChange={(event) => setTuning(Number(event.target.value))}
            type="range"
            value={tuning}
          />
          <output htmlFor="broadcast-frequency">{tuning} Hz</output>
          <span aria-hidden="true" style={{ width: `${tuning}%` }} />
        </div>
      </div>
      <button
        className="voyage-button voyage-button--primary scene-complete-button"
        disabled={!expression}
        onClick={() => expression && onComplete({ expression, tuning })}
        type="button"
      >
        发送这束广播
      </button>
    </SceneScaffold>
  )
}
