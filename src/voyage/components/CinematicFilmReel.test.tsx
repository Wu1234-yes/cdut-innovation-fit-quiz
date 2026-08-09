import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { projects } from '../content/projects'
import { CinematicFilmReel } from './CinematicFilmReel'

describe('CinematicFilmReel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resumes automatically after a touch-style interaction gives the reel focus', () => {
    vi.useFakeTimers()
    render(
      <CinematicFilmReel
        activeIndex={0}
        onActiveChange={vi.fn()}
        projects={projects}
      />,
    )
    const reel = screen.getByTestId('film-reel')

    fireEvent.pointerDown(reel, { clientX: 120 })
    fireEvent.focus(reel)
    expect(reel).toHaveClass('is-paused')

    fireEvent.pointerUp(reel, { clientX: 120 })
    act(() => vi.advanceTimersByTime(1_000))

    expect(reel).not.toHaveClass('is-paused')
  })
})
