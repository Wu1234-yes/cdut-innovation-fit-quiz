import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnimatedNumber } from './AnimatedNumber'

describe('AnimatedNumber', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the final value immediately when motion is reduced', () => {
    render(<AnimatedNumber reducedMotion suffix="项" value={33} />)

    expect(screen.getByText('33项')).toBeVisible()
  })

  it('animates to the final value once', () => {
    const callbacks: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callbacks.push(callback)
      return callbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)

    render(<AnimatedNumber duration={500} reducedMotion={false} value={50} />)
    expect(screen.getByText('0')).toBeVisible()

    act(() => callbacks.shift()?.(100))
    act(() => callbacks.shift()?.(600))

    expect(screen.getByText('50')).toBeVisible()
    expect(callbacks).toHaveLength(0)
  })
})
