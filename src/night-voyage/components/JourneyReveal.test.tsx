import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { JourneySignals } from '../content/types'
import { JourneyReveal } from './JourneyReveal'

const signals: JourneySignals = {
  observation: ['detail', 'people'],
  clues: ['event-image', 'project-record'],
  dialogue: 'participant',
  route: { time: 'weekend', partner: 'team', approach: 'research-first' },
  expression: 'poster',
  expressionTuning: 64,
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('JourneyReveal', () => {
  it('completes within 1.2 seconds and calls onComplete once', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<JourneyReveal onComplete={onComplete} reducedMotion={false} signals={signals} />)

    expect(screen.getAllByTestId('constellation-node')).toHaveLength(5)
    expect(screen.getByRole('heading', { name: '五束信号正在连成行动星图' })).toBeVisible()

    act(() => vi.advanceTimersByTime(1_099))
    expect(onComplete).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onComplete).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(1_000))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('can be skipped immediately', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<JourneyReveal onComplete={onComplete} reducedMotion={false} signals={signals} />)

    fireEvent.click(screen.getByRole('button', { name: '跳过汇聚' }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows the final readable state without long motion when reduced', () => {
    render(<JourneyReveal onComplete={vi.fn()} reducedMotion signals={signals} />)

    expect(screen.getByText('这不是人格结论，只是你刚才留下的行动证据。')).toBeVisible()
  })
})
