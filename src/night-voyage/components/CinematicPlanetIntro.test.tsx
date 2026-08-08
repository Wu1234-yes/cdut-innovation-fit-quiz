import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CinematicPlanetIntro } from './CinematicPlanetIntro'

const mockPreferences = (reducedMotion = false) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  Reflect.deleteProperty(window, 'matchMedia')
  Reflect.deleteProperty(navigator, 'connection')
})

describe('CinematicPlanetIntro', () => {
  it('renders cinematic media and both routes immediately', () => {
    mockPreferences()
    const onStart = vi.fn()
    const onExplore = vi.fn()

    const { container } = render(
      <CinematicPlanetIntro onExplore={onExplore} onStart={onStart} />,
    )

    expect(container.querySelector('source[media="(min-width: 681px)"]')).toHaveAttribute(
      'src',
      '/media/night-voyage/intro-earth-desktop.mp4',
    )
    expect(screen.getByTestId('cosmic-scene-stage')).toHaveAttribute('data-world', 'intro')
    expect(screen.getByRole('heading', { name: '科创夜航' })).toBeVisible()
    expect(container.querySelector('.cinematic-intro__orbit')).not.toBeInTheDocument()
    expect(container.querySelector('.cinematic-intro__explorer')).toBeVisible()
    expect(screen.getByTestId('explorer-avatar')).toHaveAttribute('data-explorer-pose', 'enter')
    expect(screen.getByRole('button', { name: '进入夜航' })).toHaveClass(
      'voyage-control--primary',
    )
    expect(
      screen.getByRole('button', { name: '直接看看科创能做什么' }),
    ).toHaveClass('voyage-control--quiet')
    fireEvent.click(screen.getByRole('button', { name: '进入夜航' }))
    fireEvent.click(screen.getByRole('button', { name: '直接看看科创能做什么' }))
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onExplore).toHaveBeenCalledTimes(1)
  })

  it('keeps the static core available when data saving is active', () => {
    mockPreferences()
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    })
    render(
      <CinematicPlanetIntro onExplore={vi.fn()} onStart={vi.fn()} />,
    )

    expect(screen.getByText('地球静态视图已就绪')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进入夜航' })).toBeEnabled()
  })

  it('uses the poster only when reduced motion is preferred', () => {
    mockPreferences(true)
    const { container } = render(
      <CinematicPlanetIntro onExplore={vi.fn()} onStart={vi.fn()} />,
    )

    expect(container.querySelector('video')).not.toBeInTheDocument()
    expect(screen.getByText('地球静态视图已就绪')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进入夜航' })).toBeEnabled()
  })
})
