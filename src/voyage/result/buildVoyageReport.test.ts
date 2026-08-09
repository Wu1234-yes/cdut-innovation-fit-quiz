import { describe, expect, it } from 'vitest'
import { buildVoyageReport } from './buildVoyageReport'
import type { StationAnswer } from '../app/voyageReducer'

const answer = (stationId: StationAnswer['stationId'], choiceId: string, weights: StationAnswer['weights']): StationAnswer => ({ stationId, choiceId, weights })

describe('buildVoyageReport', () => {
  it('derives stable action dimensions from completed station signals', () => {
    const report = buildVoyageReport({
      observation: answer('observation', 'pattern', { observation: 3 }),
      experiment: answer('experiment', 'prototype', { handsOn: 3 }),
      collaboration: answer('collaboration', 'clarify', { collaboration: 3 }),
      progress: answer('progress', 'milestone', { progress: 3 }),
      expression: answer('expression', 'story', { expression: 3 }),
    })

    expect(report.dimensions).toHaveLength(5)
    expect(report.dimensions[0].score).toBeGreaterThan(0)
    expect(report.title).toMatch(/信号|行动|航线/)
    expect(report.directions).toHaveLength(2)
  })

  it('supports an early report without pretending missing signals are zero talent', () => {
    const report = buildVoyageReport({
      observation: answer('observation', 'pattern', { observation: 3 }),
    })

    expect(report.dimensions.some((item) => item.score === null)).toBe(true)
    expect(report.coreStrength).toContain('观察')
    expect(report.directions.every((item) => !/只能|唯一|最适合|适配/.test(item.reason))).toBe(true)
  })
})
