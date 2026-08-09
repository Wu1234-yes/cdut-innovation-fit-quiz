import { describe, expect, it } from 'vitest'
import { signalPoints, signalRadius } from './reportVisuals'

describe('report visual geometry', () => {
  it('keeps a complete score close to the outer ring', () => {
    expect(signalRadius(100)).toBe(132)
    expect(signalRadius(0)).toBe(58)
  })

  it('builds one point for each report dimension', () => {
    const dimensions = [
      { id: 'observation', label: '观察', score: 100, evidence: '' },
      { id: 'handsOn', label: '动手', score: 50, evidence: '' },
      { id: 'collaboration', label: '协作', score: 25, evidence: '' },
    ] as const
    expect(signalPoints([...dimensions])).toMatch(/180,48/)
    expect(signalPoints([...dimensions]).split(' ')).toHaveLength(3)
  })

  it('maps the strongest recorded dimension to the outer ring', () => {
    const dimensions = [
      { id: 'observation', label: '观察', score: 40, evidence: '' },
      { id: 'handsOn', label: '动手', score: 20, evidence: '' },
    ] as const

    expect(signalPoints([...dimensions]).split(' ')[0]).toBe('180,48')
  })
})
