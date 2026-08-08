import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { projects } from '../content/projects'
import { CinematicFilmReel } from './CinematicFilmReel'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('CinematicFilmReel', () => {
  it('automatically advances the focused project', () => {
    vi.useFakeTimers()
    const onActiveChange = vi.fn()
    render(
      <CinematicFilmReel
        activeIndex={0}
        onActiveChange={onActiveChange}
        projects={projects}
      />,
    )

    act(() => vi.advanceTimersByTime(3_200))
    expect(onActiveChange).toHaveBeenCalledWith(1)
  })

  it('pauses autoplay while the reel has focus', () => {
    vi.useFakeTimers()
    const onActiveChange = vi.fn()
    render(
      <CinematicFilmReel
        activeIndex={0}
        onActiveChange={onActiveChange}
        projects={projects}
      />,
    )

    fireEvent.focus(screen.getByTestId('film-reel'))
    act(() => vi.advanceTimersByTime(6_400))
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('does not autoplay under reduced motion', () => {
    vi.useFakeTimers()
    const onActiveChange = vi.fn()
    render(
      <CinematicFilmReel
        activeIndex={0}
        onActiveChange={onActiveChange}
        projects={projects}
        reducedMotion
      />,
    )

    act(() => vi.advanceTimersByTime(9_600))
    expect(onActiveChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('film-reel')).toHaveClass('is-reduced')
  })

  it('changes direction after a drag gesture', () => {
    const onActiveChange = vi.fn()
    render(
      <CinematicFilmReel
        activeIndex={1}
        onActiveChange={onActiveChange}
        projects={projects}
      />,
    )

    const reel = screen.getByTestId('film-reel')
    fireEvent.pointerDown(reel, { clientX: 240 })
    fireEvent.pointerUp(reel, { clientX: 120 })
    expect(onActiveChange).toHaveBeenCalledWith(2)
  })

  it('resumes the film movement after pointer interaction becomes idle', () => {
    vi.useFakeTimers()
    render(
      <CinematicFilmReel
        activeIndex={0}
        onActiveChange={vi.fn()}
        projects={projects}
      />,
    )

    const reel = screen.getByTestId('film-reel')
    fireEvent.pointerDown(reel, { clientX: 180 })
    fireEvent.pointerUp(reel, { clientX: 176 })
    expect(reel).toHaveClass('is-paused')

    act(() => vi.advanceTimersByTime(900))
    expect(reel).not.toHaveClass('is-paused')
  })
})
