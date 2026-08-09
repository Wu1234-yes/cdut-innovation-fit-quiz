import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MythBreaker } from './MythBreaker'

describe('MythBreaker', () => {
  it('moves the chosen signal into focus and exposes its state', () => {
    render(<MythBreaker onComplete={vi.fn()} />)
    const cards = screen.getAllByRole('button', { name: /拆开看看/ })

    fireEvent.click(cards[1])
    expect(cards[1]).toHaveAttribute('aria-expanded', 'true')
    expect(cards[0]).toHaveAttribute('aria-expanded', 'false')
  })
})
