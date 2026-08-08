import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ActionProfile } from '../content/types'
import { ResultObservatory } from './ResultObservatory'

const profile: ActionProfile = {
  traits: [
    { id: 'a', title: '会先看见细节', evidence: '观察信号' },
    { id: 'b', title: '愿意连接信息', evidence: '组合线索' },
    { id: 'c', title: '会主动问清楚', evidence: '建立沟通' },
  ],
  researchScenes: [
    { id: 'd', title: '一次小型调研', description: '先问一个具体问题' },
    { id: 'e', title: '一次项目协作', description: '把信息接成路线' },
  ],
  starterTasks: [],
}

afterEach(cleanup)

describe('ResultObservatory', () => {
  it('replays five action nodes without scores or ranking language', () => {
    const { container } = render(
      <ResultObservatory onOpenScreening={vi.fn()} profile={profile} />,
    )
    expect(screen.getAllByTestId('observatory-node')).toHaveLength(5)
    expect(screen.getByRole('region', { name: '五段行动轨迹' })).toBeVisible()
    expect(container.querySelector('.result-observatory__orbit-icon')).not.toBeInTheDocument()
    expect(container.textContent).not.toMatch(/得分|匹配度|排名|%/)
    fireEvent.click(screen.getByRole('button', { name: /回看：会主动问清楚/ }))
    expect(screen.getByText('建立沟通')).toBeVisible()
  })

  it('keeps the screening-room action prominent in the first viewport', () => {
    const onOpenScreening = vi.fn()
    render(<ResultObservatory onOpenScreening={onOpenScreening} profile={profile} />)
    fireEvent.click(screen.getByRole('button', { name: '进入科创放映舱' }))
    expect(onOpenScreening).toHaveBeenCalledTimes(1)
  })
})
