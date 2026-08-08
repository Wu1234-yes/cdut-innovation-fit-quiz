import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { NightSceneLoader } from './NightSkyIntro'
import { NightSkyIntro } from './NightSkyIntro'

const mockMediaPreferences = ({
  coarsePointer = false,
  reducedMotion = false,
}: {
  coarsePointer?: boolean
  reducedMotion?: boolean
}) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches:
        (query === '(prefers-reduced-motion: reduce)' && reducedMotion) ||
        (query === '(pointer: coarse)' && coarsePointer),
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

describe('NightSkyIntro', () => {
  it('renders a complete immediately interactive fallback', () => {
    render(<NightSkyIntro enhanced={false} onExplore={vi.fn()} onStart={vi.fn()} />)

    expect(
      screen.getByText('成都理工大学青年科技创新服务中心'),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: '科创夜航' })).toBeInTheDocument()
    expect(
      screen.getByText('大学里有很多可能，但我还不知道自己能做什么。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始夜航' })).toBeEnabled()
    expect(
      screen.getByRole('button', { name: '直接看看科创能做什么' }),
    ).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent('静态星图已就绪')
    expect(
      screen.getByRole('img', { name: '科创小助手正在指引夜航方向' }),
    ).toBeInTheDocument()
  })

  it('keeps both routes explicit and keyboard operable', () => {
    const onStart = vi.fn()
    const onExplore = vi.fn()
    render(<NightSkyIntro enhanced={false} onExplore={onExplore} onStart={onStart} />)

    const startButton = screen.getByRole('button', { name: '开始夜航' })
    const exploreButton = screen.getByRole('button', {
      name: '直接看看科创能做什么',
    })

    startButton.focus()
    fireEvent.keyDown(startButton, { key: 'Enter' })
    fireEvent.click(startButton)
    exploreButton.focus()
    fireEvent.click(exploreButton)

    expect(exploreButton).toHaveFocus()
    expect(onStart).toHaveBeenCalledTimes(1)
    expect(onExplore).toHaveBeenCalledTimes(1)
  })

  it('keeps the fallback and actions available when enhanced loading fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const sceneLoader: NightSceneLoader = vi
      .fn()
      .mockRejectedValue(new Error('WebGL chunk unavailable'))
    const onStart = vi.fn()

    render(
      <NightSkyIntro
        enhanced
        onExplore={vi.fn()}
        onStart={onStart}
        sceneLoader={sceneLoader}
      />,
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      '增强星图暂不可用，静态星图已就绪',
    )
    expect(screen.getByText('大学里有很多可能，但我还不知道自己能做什么。')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: '开始夜航' }))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('keeps the static opening when reduced motion is preferred', () => {
    mockMediaPreferences({ reducedMotion: true })
    const sceneLoader: NightSceneLoader = vi.fn()

    render(
      <NightSkyIntro
        enhanced
        onExplore={vi.fn()}
        onStart={vi.fn()}
        sceneLoader={sceneLoader}
      />,
    )

    expect(sceneLoader).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('静态星图已就绪')
    expect(screen.getByRole('button', { name: '开始夜航' })).toBeEnabled()
  })

  it('does not load the 3D scene on a coarse save-data device', () => {
    mockMediaPreferences({ coarsePointer: true })
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: {
        saveData: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
    const sceneLoader: NightSceneLoader = vi.fn()

    render(
      <NightSkyIntro
        enhanced
        onExplore={vi.fn()}
        onStart={vi.fn()}
        sceneLoader={sceneLoader}
      />,
    )

    expect(sceneLoader).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '直接看看科创能做什么' })).toBeEnabled()
  })
})
