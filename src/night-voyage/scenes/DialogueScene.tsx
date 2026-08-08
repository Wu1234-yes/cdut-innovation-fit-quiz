import { MessageCircleMore, Radio, UserRound } from 'lucide-react'
import { useState } from 'react'
import type { DialogueId } from '../content/types'
import { SceneScaffold } from './SceneScaffold'

interface DialogueSceneProps {
  initial?: DialogueId | null
  onComplete: (value: DialogueId) => void
}

const contacts: Array<{
  id: DialogueId
  label: string
  opener: string
  response: string
  followUp: string
}> = [
  { id: 'newcomer', label: '刚入门的同学', opener: '我最担心的是不知道第一步该做什么。', response: '如果有人把任务拆小一点，我愿意先试一次。', followUp: '可以先和做过一次的同学结对，把第一项资料整理完成。' },
  { id: 'participant', label: '项目参与者', opener: '我们资料已经不少了，但下一步还没有对齐。', response: '现在最卡的是把三个人的记录放到同一条时间线上。', followUp: '先由记录最完整的人搭骨架，另外两个人补上缺口和证据。' },
  { id: 'mentor', label: '指导老师', opener: '先别急着做大方案，问题范围还可以更清楚。', response: '先说清对象、变化和能验证的一小步，就能开始。', followUp: '让一位同伴复述你的问题，听听他是否能指出下一步。' },
]

export function DialogueScene({ initial = null, onComplete }: DialogueSceneProps) {
  const [selected, setSelected] = useState<DialogueId | null>(initial)
  const [phase, setPhase] = useState<0 | 1 | 2>(initial ? 1 : 0)
  const contact = contacts.find(({ id }) => id === selected)
  const replied = phase > 0
  const followedUp = phase === 2

  return (
    <SceneScaffold
      eyebrow="NIGHT SITE 03 / SIGNAL RELAY"
      instruction="选择一个频道，再发出一句具体的问题。"
      mascotDialogue={replied ? '问清楚以后，问题就不再只停在你这里。' : '不用一个人知道全部，找到能补上信息的人就行。'}
      mascotState={replied ? 'react' : 'guide'}
      currentStep={followedUp ? 4 : replied ? 3 : selected ? 2 : 1}
      onSkip={() => onComplete('newcomer')}
      prompt="谁能帮你最快补上缺失的信息？"
      sceneClass="voyage-scene--dialogue"
      status={followedUp ? '接力信号已经返回' : replied ? '收到第一段回应' : undefined}
      title="信号接力"
      totalSteps={4}
      visualId="dialogue"
    >
      <div className="signal-relay">
        <div className="signal-relay__contacts">
          {contacts.map((item, index) => (
            <button
              aria-pressed={selected === item.id}
              className={selected === item.id ? 'is-active' : ''}
              key={item.id}
              onClick={() => {
                setSelected(item.id)
                setPhase(0)
              }}
              type="button"
            >
              <span><UserRound aria-hidden="true" size={25} /></span>
              <small>CHANNEL 0{index + 1}</small>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>
        <div className={`signal-relay__conversation ${contact ? 'is-connected' : ''}`}>
          <Radio aria-hidden="true" size={24} />
          {!contact ? (
            <p>选择一个频道，短对话会在这里接通。</p>
          ) : (
            <>
              <p>{contact.opener}</p>
              {!replied ? (
                <button onClick={() => setPhase(1)} type="button">
                  <MessageCircleMore aria-hidden="true" size={18} />
                  先问现在最卡住哪一步
                </button>
              ) : (
                <>
                  <blockquote>{contact.response}</blockquote>
                  {!followedUp ? (
                    <button onClick={() => setPhase(2)} type="button">
                      <MessageCircleMore aria-hidden="true" size={18} />
                      追问：谁能补上这一步？
                    </button>
                  ) : (
                    <p className="signal-relay__follow-up">{contact.followUp}</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <button
        className="voyage-button voyage-button--primary scene-complete-button"
        disabled={!selected || !followedUp}
        onClick={() => selected && onComplete(selected)}
        type="button"
      >
        收下这次回应
      </button>
    </SceneScaffold>
  )
}
