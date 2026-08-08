import { describe, expect, it } from 'vitest'
import type { JourneySignals } from '../content/types'
import { buildActionProfile } from './buildActionProfile'

describe('buildActionProfile', () => {
  it('returns three traits, two research scenes, and three starter tasks', () => {
    const result = buildActionProfile({
      observation: ['detail', 'people'],
      clues: ['beginner-note', 'project-record'],
      dialogue: 'newcomer',
      route: { time: 'short', partner: 'peer', approach: 'try-first' },
      expression: 'poster',
      expressionTuning: 64,
    })

    expect(result.traits).toHaveLength(3)
    expect(result.researchScenes).toHaveLength(2)
    expect(result.starterTasks).toHaveLength(3)
  })

  it('grounds the profile in the actions taken during the journey', () => {
    const result = buildActionProfile({
      observation: ['detail', 'place'],
      clues: ['event-image', 'project-record'],
      dialogue: 'participant',
      route: { time: 'weekend', partner: 'team', approach: 'research-first' },
      expression: 'map',
      expressionTuning: 48,
    })

    expect(result.traits.map((trait) => trait.id)).toContain('notices-details')
    expect(result.traits.map((trait) => trait.evidence).join('')).toContain('细节')
    expect(result.researchScenes.map((scene) => scene.id)).toContain('field-research')
    expect(result.starterTasks.map((task) => task.id)).toContain('organize-clues')
  })

  it('is deterministic and does not expose ranking or recommendation fields', () => {
    const signals = {
      observation: ['people'],
      clues: ['beginner-note', 'event-image'],
      dialogue: 'mentor',
      route: { time: 'flexible', partner: 'solo', approach: 'ask-first' },
      expression: 'video',
      expressionTuning: 72,
    } satisfies JourneySignals

    const first = buildActionProfile(signals)
    const second = buildActionProfile(signals)

    expect(second).toEqual(first)
    expect(first).not.toHaveProperty('score')
    expect(first).not.toHaveProperty('percentage')
    expect(first).not.toHaveProperty('department')
    expect(JSON.stringify(first)).not.toMatch(/最适合|匹配度|人格类型|部门排名|天生|一定|%/)
  })

  it('fills a complete profile when the fast path has no journey signals', () => {
    const result = buildActionProfile({
      observation: [],
      clues: [],
      dialogue: null,
      route: { time: null, partner: null, approach: null },
      expression: null,
      expressionTuning: null,
    })

    expect(result.traits).toHaveLength(3)
    expect(result.researchScenes).toHaveLength(2)
    expect(result.starterTasks).toHaveLength(3)
    expect(result.traits.every((trait) => trait.evidence.length > 0)).toBe(true)
  })
})
