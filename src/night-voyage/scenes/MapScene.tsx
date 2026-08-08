import { Clock3, Route as RouteIcon, UsersRound, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type {
  RouteApproachId,
  RoutePartnerId,
  RouteTimeId,
} from '../content/types'
import { SceneScaffold } from './SceneScaffold'

interface RouteValue {
  time: RouteTimeId | null
  partner: RoutePartnerId | null
  approach: RouteApproachId | null
}

interface MapSceneProps {
  initial?: RouteValue
  onComplete: (value: {
    time: RouteTimeId
    partner: RoutePartnerId
    approach: RouteApproachId
  }) => void
}

const groups: Array<{
  key: keyof RouteValue
  label: string
  Icon: LucideIcon
  options: Array<{ id: string; label: string }>
}> = [
  { key: 'time', label: '接入时间', Icon: Clock3, options: [{ id: 'short', label: '课后半小时' }, { id: 'weekend', label: '周末下午' }, { id: 'flexible', label: '找到空档就做' }] },
  { key: 'partner', label: '接入伙伴', Icon: UsersRound, options: [{ id: 'peer', label: '找一位同伴' }, { id: 'team', label: '加入一个小组' }, { id: 'solo', label: '先独立整理' }] },
  { key: 'approach', label: '接入方式', Icon: Zap, options: [{ id: 'try-first', label: '先做一次' }, { id: 'research-first', label: '先查清资料' }, { id: 'ask-first', label: '先请教别人' }] },
]

const emptyRoute: RouteValue = { time: null, partner: null, approach: null }

export function MapScene({ initial = emptyRoute, onComplete }: MapSceneProps) {
  const [route, setRoute] = useState<RouteValue>({ ...initial })
  const [launched, setLaunched] = useState(false)
  const complete = Boolean(route.time && route.partner && route.approach)

  return (
    <SceneScaffold
      eyebrow="NIGHT SITE 04 / ENERGY ROUTE"
      instruction="每组接入一个节点，装置会逐段恢复能量。"
      mascotDialogue={launched ? '航路已经穿越黑洞边缘。现在把这条能做到的路线带回去。' : complete ? '三个节点已接通，启动后看看它会去哪里。' : '时间、伙伴和第一步接上，想法才会开始移动。'}
      mascotState={launched ? 'celebrate' : 'focus'}
      currentStep={launched ? 5 : Math.min(4, Object.values(route).filter(Boolean).length + 1)}
      onSkip={() => onComplete({ time: 'short', partner: 'peer', approach: 'try-first' })}
      prompt="怎样让一个小任务真的开始？"
      sceneClass="voyage-scene--map"
      status={launched ? '航路已穿越' : complete ? '三个节点已接通' : undefined}
      title="能量路线"
      totalSteps={5}
      visualId="map"
    >
      <div className="energy-route">
        <div className={`energy-route__core ${complete ? 'is-online' : ''} ${launched ? 'is-launched' : ''}`} aria-hidden="true">
          <RouteIcon size={42} />
          <span>{Object.values(route).filter(Boolean).length} / 3</span>
        </div>
        <div className="energy-route__groups">
          {groups.map(({ key, label, Icon, options }) => (
            <fieldset key={key}>
              <legend><Icon aria-hidden="true" size={18} />{label}</legend>
              {options.map((option) => (
                <button
                  aria-pressed={route[key] === option.id}
                  className={route[key] === option.id ? 'is-active' : ''}
                  key={option.id}
                  onClick={() => {
                    setLaunched(false)
                    setRoute((current) => ({ ...current, [key]: option.id }))
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </fieldset>
          ))}
        </div>
      </div>
      <button
        className="voyage-button voyage-button--primary scene-complete-button"
        disabled={!complete}
        onClick={() => {
          if (!route.time || !route.partner || !route.approach) return
          if (!launched) {
            setLaunched(true)
            return
          }
          onComplete({ time: route.time, partner: route.partner, approach: route.approach })
        }}
        type="button"
      >
        {launched ? '带回这条路线' : '启动能量路线'}
      </button>
    </SceneScaffold>
  )
}
