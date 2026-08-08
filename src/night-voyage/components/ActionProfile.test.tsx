import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JourneySignals } from '../content/types'
import { buildActionProfile } from '../result/buildActionProfile'
import { ActionProfile } from './ActionProfile'

const signals: JourneySignals = {
  observation: ['detail', 'people'],
  clues: ['event-image', 'project-record'],
  dialogue: 'participant',
  route: { time: 'weekend', partner: 'team', approach: 'research-first' },
  expression: 'poster',
  expressionTuning: 64,
}

afterEach(cleanup)

describe('ActionProfile', () => {
  it('renders three traits, two scenes, and three starter tasks with evidence', () => {
    const profile = buildActionProfile(signals)
    render(
      <ActionProfile
        fastPath={false}
        onOpenAtlas={vi.fn()}
        onOpenScreening={vi.fn()}
        onRestart={vi.fn()}
        profile={profile}
      />,
    )

    expect(screen.getAllByTestId('profile-trait')).toHaveLength(3)
    expect(screen.getAllByTestId('research-scene')).toHaveLength(2)
    expect(screen.getAllByTestId('starter-task')).toHaveLength(3)
    expect(screen.getAllByText(/你在夜航开始时先注意到了现场的细节/)[0]).toBeVisible()
    expect(screen.getByText(/人格结论/)).toBeVisible()
    expect(screen.getByRole('button', { name: '进入科创放映舱' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '查看全部部门' })).toBeEnabled()
  })

  it('keeps the fast path general and free of fit language', () => {
    const profile = buildActionProfile({
      observation: [],
      clues: [],
      dialogue: null,
      route: { time: null, partner: null, approach: null },
      expression: null,
      expressionTuning: null,
    })
    const { container } = render(
      <ActionProfile
        fastPath
        onOpenAtlas={vi.fn()}
        onOpenScreening={vi.fn()}
        onRestart={vi.fn()}
        profile={profile}
      />,
    )

    expect(screen.getByRole('heading', { name: '从一件小事开始，也算科创' })).toBeVisible()
    expect(container.textContent).not.toMatch(/最适合|匹配度|部门排名|人格类型|%/)
  })
})
