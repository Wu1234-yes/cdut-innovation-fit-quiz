import { Download, LayoutGrid, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import type { ActionProfile as ActionProfileData } from '../content/types'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { CosmicSceneStage } from './CosmicSceneStage'
import { ResultObservatory } from './ResultObservatory'

interface ActionProfileProps {
  profile: ActionProfileData
  fastPath: boolean
  onOpenAtlas: () => void
  onOpenScreening: () => void
  onRestart: () => void
}

export function ActionProfile({
  profile,
  fastPath,
  onOpenAtlas,
  onOpenScreening,
  onRestart,
}: ActionProfileProps) {
  const [saveStatus, setSaveStatus] = useState('')
  const { reducedMotion } = useMotionPreference()

  const saveProfile = () => {
    const lines = [
      '科创夜航 · 本次探索记录',
      '',
      '行动线索',
      ...profile.traits.map((trait) => `- ${trait.title}：${trait.evidence}`),
      '',
      '可以尝试的科研场景',
      ...profile.researchScenes.map((scene) => `- ${scene.title}：${scene.description}`),
      '',
      '入门行动票',
      ...profile.starterTasks.map((task) => `- ${task.title}：${task.description}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = '科创夜航-本次探索记录.txt'
    anchor.click()
    URL.revokeObjectURL(url)
    setSaveStatus('探索记录已保存')
  }

  return (
    <CosmicSceneStage as="main" className="action-profile" reducedMotion={reducedMotion} visualId="result">
      <ResultObservatory fastPath={fastPath} onOpenScreening={onOpenScreening} profile={profile} />

      <section className="profile-traits" aria-labelledby="traits-title">
        <div className="profile-section-heading">
          <p>CAPTION STRIPS / 03</p>
          <h2 id="traits-title">你刚才留下的三条行动线索</h2>
        </div>
        <div className="profile-traits__list">
          {profile.traits.map((trait, index) => (
            <article data-testid="profile-trait" key={trait.id}>
              <span>0{index + 1}</span>
              <h3>{trait.title}</h3>
              <p>{trait.evidence}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="profile-scenes" aria-labelledby="scenes-title">
        <div className="profile-section-heading">
          <p>RESEARCH ROUTES / 02</p>
          <h2 id="scenes-title">这些科研场景，可以从小处试试</h2>
        </div>
        <div className="profile-scenes__bands">
          {profile.researchScenes.map((scene, index) => (
            <article data-testid="research-scene" key={scene.id}>
              <div className="profile-scenes__index">SCENE 0{index + 1}</div>
              <div>
                <h3>{scene.title}</h3>
                <p>{scene.description}</p>
              </div>
              <span aria-hidden="true" className="profile-scenes__beam" />
            </article>
          ))}
        </div>
      </section>

      <section className="starter-tasks" aria-labelledby="tasks-title">
        <div className="profile-section-heading">
          <p>STARTER TICKETS / 03</p>
          <h2 id="tasks-title">今天就能看懂的三张行动票</h2>
        </div>
        <div className="starter-tasks__tickets">
          {profile.starterTasks.map((task, index) => (
            <article data-testid="starter-task" key={task.id}>
              <span className="starter-tasks__code">TICKET 0{index + 1}</span>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <i aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <footer className="action-profile__actions">
        <div>
          <p>下一站不是选择部门，而是看看真实的人正在做什么。</p>
        </div>
        <div>
          <button className="voyage-button voyage-button--quiet voyage-control voyage-control--quiet" onClick={onOpenAtlas} type="button">
            <LayoutGrid aria-hidden="true" size={18} />
            <span>查看全部部门</span>
          </button>
          <button className="voyage-button voyage-button--quiet voyage-control voyage-control--quiet" onClick={saveProfile} type="button">
            <Download aria-hidden="true" size={18} />
            <span>保存本次探索</span>
          </button>
          <button className="voyage-button voyage-button--quiet voyage-control voyage-control--quiet" onClick={onRestart} type="button">
            <RotateCcw aria-hidden="true" size={18} />
            <span>重新夜航</span>
          </button>
        </div>
        <p aria-live="polite" className="sr-only">{saveStatus}</p>
      </footer>
    </CosmicSceneStage>
  )
}
