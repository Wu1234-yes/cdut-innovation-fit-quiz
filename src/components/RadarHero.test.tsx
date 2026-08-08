import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../app/App'
import RadarHero from './RadarHero'
import { StaticRadar } from './StaticRadar'

const oglMock = vi.hoisted(() => ({
  canvas: null as HTMLCanvasElement | null,
  dprAtResize: [] as number[],
  geometryRemove: vi.fn(),
  loseContext: vi.fn(),
  programRemove: vi.fn(),
  render: vi.fn(),
  throwOnProgram: false,
  throwOnRender: false,
  throwOnSetSize: false,
}))

vi.mock('ogl', () => {
  class Renderer {
    dpr = 1
    gl: {
      canvas: HTMLCanvasElement
      clearColor: ReturnType<typeof vi.fn>
      getExtension: ReturnType<typeof vi.fn>
    }

    constructor() {
      const canvas = document.createElement('canvas')
      oglMock.canvas = canvas
      this.gl = {
        canvas,
        clearColor: vi.fn(),
        getExtension: vi.fn(() => ({ loseContext: oglMock.loseContext })),
      }
    }

    setSize(width: number, height: number) {
      if (oglMock.throwOnSetSize) {
        throw new Error('OGL resize failed')
      }
      oglMock.dprAtResize.push(this.dpr)
      this.gl.canvas.width = width
      this.gl.canvas.height = height
    }

    render(options: unknown) {
      if (oglMock.throwOnRender) {
        throw new Error('OGL render failed')
      }
      oglMock.render(options)
    }
  }

  class Program {
    uniforms: Record<string, { value: unknown }>

    constructor(
      _gl: unknown,
      options: { uniforms: Record<string, { value: unknown }> },
    ) {
      if (oglMock.throwOnProgram) {
        throw new Error('OGL program failed')
      }
      this.uniforms = options.uniforms
    }

    remove() {
      oglMock.programRemove()
    }
  }

  class Mesh {
    constructor(...args: unknown[]) {
      void args
    }
  }

  class Triangle {
    constructor(...args: unknown[]) {
      void args
    }

    remove() {
      oglMock.geometryRemove()
    }
  }

  return { Mesh, Program, Renderer, Triangle }
})

type MediaController = {
  change: (query: string, matches: boolean) => void
}

const setMedia = ({
  coarsePointer = false,
  reducedMotion = false,
}: {
  coarsePointer?: boolean
  reducedMotion?: boolean
} = {}) => {
  const records = new Map<
    string,
    {
      listeners: Set<(event: MediaQueryListEvent) => void>
      matches: boolean
    }
  >()
  const getRecord = (query: string) => {
    let record = records.get(query)
    if (!record) {
      record = {
        listeners: new Set(),
        matches:
          (query.includes('prefers-reduced-motion') && reducedMotion) ||
          (query.includes('pointer: coarse') && coarsePointer),
      }
      records.set(query, record)
    }
    return record
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => {
      const record = getRecord(query)
      return {
      addEventListener: vi.fn(
        (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          record.listeners.add(listener)
        },
      ),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      get matches() {
        return record.matches
      },
      media: query,
      onchange: null,
      removeEventListener: vi.fn(
        (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          record.listeners.delete(listener)
        },
      ),
      removeListener: vi.fn(),
    } as unknown as MediaQueryList
    }),
    writable: true,
  })

  return {
    change(query: string, matches: boolean) {
      const record = getRecord(query)
      record.matches = matches
      const event = { matches, media: query } as MediaQueryListEvent
      record.listeners.forEach((listener) => listener(event))
    },
  } satisfies MediaController
}

const pointLevels = (container: HTMLElement) =>
  new Set(
    Array.from(container.querySelectorAll('[data-radar-point]')).map((point) =>
      point.getAttribute('data-level'),
    ),
  )

describe('RadarHero fallbacks', () => {
  beforeEach(() => {
    setMedia()
    oglMock.canvas = null
    oglMock.dprAtResize = []
    oglMock.geometryRemove.mockReset()
    oglMock.loseContext.mockReset()
    oglMock.programRemove.mockReset()
    oglMock.render.mockReset()
    oglMock.throwOnProgram = false
    oglMock.throwOnRender = false
    oglMock.throwOnSetSize = false
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the static radar without a canvas when forced', () => {
    const { container } = render(
      <RadarHero forceStatic onStart={vi.fn()} />,
    )

    expect(screen.getByRole('img', { name: /静态科创雷达/ })).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-radar-point]')).toHaveLength(14)
    expect(pointLevels(container)).toEqual(new Set(['1', '2', '3']))
  })

  it('uses the static radar when reduced motion is requested', () => {
    setMedia({ reducedMotion: true })
    const { container } = render(<RadarHero onStart={vi.fn()} />)

    expect(screen.getByRole('img', { name: /静态科创雷达/ })).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  it('uses the static radar when WebGL is unavailable', () => {
    const { container } = render(<RadarHero onStart={vi.fn()} />)

    expect(screen.getByRole('img', { name: /静态科创雷达/ })).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  it('falls back cleanly when OGL initialization throws', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue({} as never)
    oglMock.throwOnProgram = true
    const animationFrame = vi.spyOn(window, 'requestAnimationFrame')
    const { container } = render(<RadarHero onStart={vi.fn()} />)

    expect(
      await screen.findByRole('img', { name: /静态科创雷达/ }),
    ).toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(animationFrame).not.toHaveBeenCalled()
    expect(oglMock.loseContext).toHaveBeenCalledOnce()
  })
})

describe('RadarHero enhanced radar', () => {
  beforeEach(() => {
    setMedia()
    oglMock.canvas = null
    oglMock.dprAtResize = []
    oglMock.geometryRemove.mockReset()
    oglMock.loseContext.mockReset()
    oglMock.programRemove.mockReset()
    oglMock.render.mockReset()
    oglMock.throwOnProgram = false
    oglMock.throwOnRender = false
    oglMock.throwOnSetSize = false
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders 14 semantic overlay points with all three levels on both variants', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(41)
    const dynamic = render(<RadarHero onStart={vi.fn()} />)

    expect(dynamic.container.querySelector('canvas')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(dynamic.container.querySelectorAll('[data-radar-point]')).toHaveLength(14)
    expect(pointLevels(dynamic.container)).toEqual(new Set(['1', '2', '3']))
    dynamic.unmount()

    const staticRadar = render(<StaticRadar />)
    expect(staticRadar.container.querySelectorAll('[data-radar-point]')).toHaveLength(14)
    expect(pointLevels(staticRadar.container)).toEqual(new Set(['1', '2', '3']))
  })

  it('shows the title, organization, CTA, center label, and operational HUD', () => {
    const onStart = vi.fn()
    render(<RadarHero forceStatic onStart={onStart} />)

    expect(screen.getByRole('heading', { name: '找到与你同频的部门' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: '科创部门适配测评' }),
    ).toBeInTheDocument()
    expect(screen.getByText('成都理工大学青年科技创新服务中心')).toBeInTheDocument()
    expect(screen.getByText('青年科创')).toBeInTheDocument()
    expect(screen.getByText('锁定坐标')).toBeInTheDocument()
    expect(screen.getByText('SCANNING')).toBeInTheDocument()
    expect(screen.getByText('AXES 04')).toBeInTheDocument()
    expect(screen.getByText('QUESTIONS 25')).toBeInTheDocument()
    expect(screen.getByText('LOCAL / NO UPLOAD')).toBeInTheDocument()
    expect(screen.getByText('CHENGDU / 成都')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '开始扫描' }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('removes listeners, animation frame, canvas, and WebGL context on unmount', () => {
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(73)
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame')
    const addWindowListener = vi.spyOn(window, 'addEventListener')
    const removeWindowListener = vi.spyOn(window, 'removeEventListener')
    const { container, unmount } = render(<RadarHero onStart={vi.fn()} />)
    const canvas = container.querySelector('canvas')
    const removeCanvasListener = vi.spyOn(canvas!, 'removeEventListener')

    expect(requestFrame).toHaveBeenCalledOnce()
    expect(addWindowListener).toHaveBeenCalledWith('resize', expect.any(Function))

    unmount()

    expect(cancelFrame).toHaveBeenCalledWith(73)
    expect(removeWindowListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(removeCanvasListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    )
    expect(removeCanvasListener).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function),
    )
    expect(canvas).not.toBeInTheDocument()
    expect(oglMock.loseContext).toHaveBeenCalledOnce()
  })

  it('enables real canvas mouse interaction for fine pointers', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(31)
    const addCanvasListener = vi.spyOn(
      HTMLCanvasElement.prototype,
      'addEventListener',
    )
    const { container } = render(<RadarHero onStart={vi.fn()} />)

    expect(addCanvasListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    )
    expect(addCanvasListener).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function),
    )
    expect(
      container.querySelector('.radar-visual--interactive canvas'),
    ).toBeInTheDocument()
  })

  it('falls back and cleans every resource when rendering throws in RAF', async () => {
    let nextFrameId = 80
    const frameCallbacks = new Map<number, FrameRequestCallback>()
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        nextFrameId += 1
        frameCallbacks.set(nextFrameId, callback)
        return nextFrameId
      })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame')
    const removeWindowListener = vi.spyOn(window, 'removeEventListener')
    const { container } = render(<RadarHero onStart={vi.fn()} />)
    const canvas = container.querySelector('canvas')!
    const removeCanvasListener = vi.spyOn(canvas, 'removeEventListener')
    oglMock.throwOnRender = true

    act(() => frameCallbacks.get(81)?.(16))

    expect(
      await screen.findByRole('img', { name: /静态科创雷达/ }),
    ).toBeInTheDocument()
    expect(requestFrame).toHaveBeenCalledOnce()
    expect(cancelFrame).toHaveBeenCalledOnce()
    expect(cancelFrame).toHaveBeenCalledWith(81)
    expect(removeWindowListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(removeCanvasListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    )
    expect(removeCanvasListener).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function),
    )
    expect(canvas).not.toBeInTheDocument()
    expect(oglMock.loseContext).toHaveBeenCalledOnce()
    expect(oglMock.programRemove).toHaveBeenCalledOnce()
    expect(oglMock.geometryRemove).toHaveBeenCalledOnce()
  })

  it('prevents WebGL context loss and falls back through unified cleanup', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(96)
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame')
    const { container } = render(<RadarHero onStart={vi.fn()} />)
    const canvas = container.querySelector('canvas')!
    const removeCanvasListener = vi.spyOn(canvas, 'removeEventListener')
    const contextLost = new Event('webglcontextlost', { cancelable: true })

    act(() => canvas.dispatchEvent(contextLost))

    expect(contextLost.defaultPrevented).toBe(true)
    expect(
      await screen.findByRole('img', { name: /静态科创雷达/ }),
    ).toBeInTheDocument()
    expect(cancelFrame).toHaveBeenCalledWith(96)
    expect(removeCanvasListener).toHaveBeenCalledWith(
      'webglcontextlost',
      expect.any(Function),
    )
    expect(canvas).not.toBeInTheDocument()
    expect(oglMock.programRemove).toHaveBeenCalledOnce()
    expect(oglMock.geometryRemove).toHaveBeenCalledOnce()
    expect(oglMock.loseContext).toHaveBeenCalledOnce()
  })

  it('rechecks WebGL and restores the canvas when reduced motion turns off', async () => {
    const media = setMedia({ reducedMotion: true })
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(44)
    const { container } = render(<RadarHero onStart={vi.fn()} />)

    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    act(() => media.change('(prefers-reduced-motion: reduce)', false))

    await waitFor(() => {
      expect(container.querySelector('canvas')).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('img', { name: /静态科创雷达/ }),
    ).not.toBeInTheDocument()
  })

  it('remounts the canvas without mouse handling when pointer capability changes', async () => {
    const media = setMedia()
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(52)
    const { container } = render(<RadarHero onStart={vi.fn()} />)
    const interactiveCanvas = container.querySelector('canvas')!

    act(() => media.change('(pointer: coarse)', true))

    await waitFor(() => {
      expect(
        container.querySelector('.radar-visual--touch canvas'),
      ).toBeInTheDocument()
    })
    expect(interactiveCanvas).not.toBeInTheDocument()
    expect(oglMock.loseContext).toHaveBeenCalledOnce()
  })

  it('uses ResizeObserver and refreshes capped DPR before resizing', () => {
    let resizeCallback: ResizeObserverCallback | null = null
    const observe = vi.fn()
    const disconnect = vi.fn()
    class TestResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }
      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
    }
    vi.stubGlobal('ResizeObserver', TestResizeObserver)
    let devicePixelRatio = 1
    vi.spyOn(window, 'devicePixelRatio', 'get').mockImplementation(
      () => devicePixelRatio,
    )
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(61)
    const addWindowListener = vi.spyOn(window, 'addEventListener')
    const removeWindowListener = vi.spyOn(window, 'removeEventListener')
    const { container, unmount } = render(<RadarHero onStart={vi.fn()} />)
    const radarContainer = container.querySelector('.radar-visual--canvas')!

    expect(observe).toHaveBeenCalledWith(radarContainer)
    expect(addWindowListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(oglMock.dprAtResize.at(-1)).toBe(1)
    devicePixelRatio = 3
    fireEvent(window, new Event('resize'))
    expect(oglMock.dprAtResize.at(-1)).toBe(2)
    act(() => {
      resizeCallback?.([], {} as ResizeObserver)
    })
    expect(oglMock.dprAtResize.at(-1)).toBe(2)

    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(removeWindowListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
  })

  it('cleans appended resources when synchronous resize setup throws', async () => {
    oglMock.throwOnSetSize = true
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    const removeWindowListener = vi.spyOn(window, 'removeEventListener')
    const removeCanvasListener = vi.spyOn(
      HTMLCanvasElement.prototype,
      'removeEventListener',
    )
    const { container } = render(<RadarHero onStart={vi.fn()} />)
    const canvas = oglMock.canvas

    expect(
      await screen.findByRole('img', { name: /静态科创雷达/ }),
    ).toBeInTheDocument()
    expect(requestFrame).not.toHaveBeenCalled()
    expect(removeWindowListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(removeCanvasListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    )
    expect(removeCanvasListener).toHaveBeenCalledWith(
      'mouseleave',
      expect.any(Function),
    )
    expect(canvas).not.toBeInTheDocument()
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(oglMock.loseContext).toHaveBeenCalledOnce()
  })

  it('does not attach mouse interaction for coarse pointers', () => {
    setMedia({ coarsePointer: true })
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(19)
    const addCanvasListener = vi.spyOn(
      HTMLCanvasElement.prototype,
      'addEventListener',
    )
    const { container } = render(<RadarHero onStart={vi.fn()} />)

    expect(addCanvasListener).not.toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    )
    expect(
      container.querySelector('.radar-visual--touch canvas'),
    ).toBeInTheDocument()
  })
})

describe('App welcome integration', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setMedia({ reducedMotion: true })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('keeps the lazy welcome CTA able to start the quiz', async () => {
    render(<App />)

    const start = await screen.findByRole('button', { name: '开始扫描' })
    fireEvent.click(start)

    await waitFor(() => {
      expect(screen.getByText('1 / 25')).toBeInTheDocument()
    })
    expect(document.querySelector('canvas')).not.toBeInTheDocument()
  })
})
