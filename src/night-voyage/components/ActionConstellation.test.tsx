import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ActionProfile as ActionProfileData } from '../content/types'
import { ActionConstellation } from './ActionConstellation'

const profile: ActionProfileData = {
  traits: [
    { id: 'observe', title: '先看清楚', evidence: '你先留意到了细节。' },
    { id: 'connect', title: '连接线索', evidence: '你把信息放到了一起。' },
    { id: 'share', title: '让发现可见', evidence: '你选择把过程讲清楚。' },
  ],
  researchScenes: [
    { id: 'field', title: '现场观察', description: '从真实问题开始。' },
    { id: 'team', title: '协作推进', description: '和伙伴完成小任务。' },
  ],
  starterTasks: [
    { id: 'one', title: '记录一次', description: '留下可讨论的材料。' },
    { id: 'two', title: '问清一件事', description: '找到信息缺口。' },
    { id: 'three', title: '做一版初稿', description: '让想法进入协作。' },
  ],
}

afterEach(cleanup)

describe('ActionConstellation', () => {
  it('renders a deterministic constellation without scores or rankings', () => {
    const { container } = render(<ActionConstellation profile={profile} />)

    expect(
      screen.getByRole('img', { name: '本次夜航形成的个人行动星象' }),
    ).toBeVisible()
    expect(container.textContent).not.toMatch(/%|匹配度|最适合|排名/)
    expect(container.querySelectorAll('[data-constellation-node]')).toHaveLength(5)
  })
})
