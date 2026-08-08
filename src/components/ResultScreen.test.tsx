import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../app/App'
import type { AppState } from '../app/appReducer'
import { SESSION_STORAGE_KEY, serializeSession } from '../app/session'
import { DepartmentDetails } from './DepartmentDetails'
import { JoinPanel } from './JoinPanel'
import { ResultScreen } from './ResultScreen'
import { departments } from '../content/departments'
import { questions } from '../content/questions'
import type { Answers } from '../content/types'
import { scoreQuiz } from '../scoring/scoreQuiz'

interface CapturedMotionProps {
  animate?: unknown
  className?: string
  initial?: unknown
  tag: string
  transition?: unknown
  variants?: unknown
}

const motionCapture = vi.hoisted(() => ({
  records: [] as CapturedMotionProps[],
}))

vi.mock('motion/react', async () => {
  const { createElement, forwardRef } = await import('react')
  interface MotionMockProps {
    [key: string]: unknown
    animate?: unknown
    children?: ReactNode
    className?: string
    initial?: unknown
    transition?: unknown
    variants?: unknown
  }
  const components = new Map<string, unknown>()

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => {
          const existing = components.get(tag)
          if (existing) {
            return existing
          }

          const component = forwardRef<HTMLElement, MotionMockProps>(
            (
              {
                animate,
                children,
                className,
                initial,
                transition,
                variants,
                ...domProps
              },
              ref,
            ) => {
              motionCapture.records.push({
                animate,
                className:
                  typeof className === 'string' ? className : undefined,
                initial,
                tag,
                transition,
                variants,
              })
              return createElement(
                tag,
                { ...domProps, className, ref },
                children as ReactNode,
              )
            },
          )
          components.set(tag, component)
          return component
        },
      },
    ),
  }
})

const completeAnswers: Answers = Object.fromEntries(
  questions.map((question) => [question.id, question.options[0].id]),
)
const expectedResult = scoreQuiz(completeAnswers)

const resultState: AppState = {
  view: 'result',
  questionIndex: questions.length - 1,
  answers: completeAnswers,
}

const seedResult = () => {
  sessionStorage.setItem(SESSION_STORAGE_KEY, serializeSession(resultState))
}

const setReducedMotion = (
  initialMatches: boolean,
  listenerMode: 'modern' | 'legacy' = 'modern',
) => {
  let matches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const addEventListener = vi.fn(
    (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
  )
  const removeEventListener = vi.fn(
    (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
  )
  const addListener = vi.fn((listener: (event: MediaQueryListEvent) => void) => {
    listeners.add(listener)
  })
  const removeListener = vi.fn(
    (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
  )
  const media = {
    get matches() {
      return matches
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: listenerMode === 'modern' ? addEventListener : undefined,
    removeEventListener:
      listenerMode === 'modern' ? removeEventListener : undefined,
    addListener,
    removeListener,
  }
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue(media),
  })

  return {
    addListener,
    change(nextMatches: boolean) {
      matches = nextMatches
      const event = { matches, media: media.media } as MediaQueryListEvent
      for (const listener of listeners) {
        listener(event)
      }
    },
    removeEventListener,
    removeListener,
  }
}

const setClipboard = (clipboard?: { writeText: (value: string) => Promise<void> }) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: clipboard,
  })
}

describe('ResultScreen', () => {
  beforeEach(() => {
    motionCapture.records.length = 0
    sessionStorage.clear()
    seedResult()
    setReducedMotion(false)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    setClipboard(undefined)
  })

  it('shows the profile, four numeric dimensions, three distinct recommendations, and disclaimer', () => {
    render(<App />)

    const primaryDepartment = departments.find(
      (department) => department.id === expectedResult.ranking[0].id,
    )!

    expect(
      screen.getByRole('heading', { level: 1, name: expectedResult.profile }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: primaryDepartment.hero.alt }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('profile-radar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '生成结果海报' })).toBeInTheDocument()
    for (const responsibility of primaryDepartment.responsibilities.slice(0, 3)) {
      expect(screen.getByText(responsibility)).toBeInTheDocument()
    }

    const labels = {
      expression: '表达转化',
      analysis: '分析研究',
      execution: '执行推进',
      adaptation: '协作应变',
    } as const

    for (const [dimensionId, label] of Object.entries(labels)) {
      expect(
        screen.getByLabelText(
          `${label} ${Math.round(expectedResult.dimensions[dimensionId as keyof typeof labels])} 分`,
        ),
      ).toBeInTheDocument()
    }

    const primary = screen.getByRole('region', { name: '首选部门' })
    const alternates = screen.getAllByRole('article', { name: /备选部门/ })
    const recommendationNames = [
      within(primary).getByRole('heading', {
        name: expectedResult.ranking[0].name,
      }).textContent,
      ...alternates.map(
        (alternate) => within(alternate).getByRole('heading').textContent,
      ),
    ]

    expect(alternates).toHaveLength(2)
    alternates.forEach((alternate, index) => {
      const department = departments.find(
        ({ id }) => id === expectedResult.ranking[index + 1].id,
      )!
      expect(
        within(alternate).getByRole('img', { name: department.hero.alt }),
      ).toBeInTheDocument()
    })
    expect(new Set(recommendationNames).size).toBe(3)
    expect(recommendationNames).toEqual(
      expectedResult.ranking.slice(0, 3).map(({ name }) => name),
    )
    expect(
      screen.getByText(
        '适配指数仅表示本测评内的相对匹配，不代表能力或录取概率。',
      ),
    ).toBeInTheDocument()
  })

  it('provides seven accessible detail entries and returns to the persisted result', async () => {
    const user = userEvent.setup()
    render(<App />)

    const detailButtons = departments.map((department) =>
      screen.getByRole('button', { name: `查看${department.name}详情` }),
    )
    expect(detailButtons).toHaveLength(7)

    const selected = departments[4]
    await user.click(
      screen.getByRole('button', { name: `查看${selected.name}详情` }),
    )

    expect(
      screen.getByRole('heading', { level: 1, name: selected.name }),
    ).toBeInTheDocument()
    expect(screen.getByText(selected.summary)).toBeInTheDocument()
    for (const keyword of selected.keywords) {
      expect(screen.getByText(keyword)).toBeInTheDocument()
    }
    expect(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)!).state).toMatchObject({
      view: 'departmentDetails',
      selectedDepartmentId: selected.id,
    })

    await user.click(screen.getByRole('button', { name: '返回结果' }))
    expect(
      screen.getByRole('heading', { level: 1, name: expectedResult.profile }),
    ).toBeInTheDocument()
    expect(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)!).state).toMatchObject({
      view: 'result',
    })
  })

  it('shows the real QR entry and confirms a successful group-number copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    setClipboard({ writeText })
    render(<App />)

    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`
    expect(screen.getByRole('img', { name: '招新 QQ 群二维码' })).toHaveAttribute(
      'src',
      `${baseUrl}recruitment-qq-qr.png`,
    )
    expect(screen.getByText('723526608')).toBeVisible()

    await user.click(screen.getByRole('button', { name: '复制群号' }))
    expect(writeText).toHaveBeenCalledWith('723526608')
    expect(screen.getByRole('status')).toHaveTextContent('群号已复制')
  })

  it('finishes a successful copy after StrictMode replays the mount effect', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    setClipboard({ writeText })
    render(
      <StrictMode>
        <JoinPanel />
      </StrictMode>,
    )

    await user.click(screen.getByRole('button', { name: '复制群号' }))

    expect(screen.getByRole('status')).toHaveTextContent('群号已复制')
    expect(screen.getByRole('button', { name: '复制群号' })).toBeEnabled()
  })

  it('selects the visible group number when clipboard copying fails', async () => {
    const user = userEvent.setup()
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('blocked')) })
    render(<App />)

    await user.click(screen.getByRole('button', { name: '复制群号' }))

    expect(screen.getByRole('status')).toHaveTextContent('请手动复制群号')
    expect(window.getSelection()?.toString()).toBe('723526608')
    expect(screen.getByText('723526608')).toBeVisible()
  })

  it('restores manual copy after StrictMode replays the mount effect', async () => {
    const user = userEvent.setup()
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('blocked')) })
    render(
      <StrictMode>
        <JoinPanel />
      </StrictMode>,
    )

    await user.click(screen.getByRole('button', { name: '复制群号' }))

    expect(screen.getByRole('status')).toHaveTextContent('请手动复制群号')
    expect(screen.getByRole('button', { name: '复制群号' })).toBeEnabled()
  })

  it('uses the same manual-copy fallback when the Clipboard API is unavailable', async () => {
    const user = userEvent.setup()
    setClipboard(undefined)
    render(<App />)

    await user.click(screen.getByRole('button', { name: '复制群号' }))

    expect(screen.getByRole('status')).toHaveTextContent('请手动复制群号')
    expect(window.getSelection()?.toString()).toBe('723526608')
  })

  it('hides a failed QR image without removing the group-number fallback', () => {
    render(<App />)

    fireEvent.error(screen.getByRole('img', { name: '招新 QQ 群二维码' }))

    expect(
      screen.queryByRole('img', { name: '招新 QQ 群二维码' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('723526608')).toBeVisible()
    expect(screen.getByRole('button', { name: '复制群号' })).toBeEnabled()
  })

  it.each(['/club/', '/club'])('resolves the QR below BASE_URL %s', (baseUrl) => {
    vi.stubEnv('BASE_URL', baseUrl)
    render(<JoinPanel />)

    expect(screen.getByRole('img', { name: '招新 QQ 群二维码' })).toHaveAttribute(
      'src',
      '/club/recruitment-qq-qr.png',
    )
  })

  it('disables repeated copy attempts while the clipboard request is pending', async () => {
    let resolveCopy!: () => void
    const pendingCopy = new Promise<void>((resolve) => {
      resolveCopy = resolve
    })
    const writeText = vi.fn().mockReturnValue(pendingCopy)
    const user = userEvent.setup()
    setClipboard({ writeText })
    render(<JoinPanel />)

    await user.click(screen.getByRole('button', { name: '复制群号' }))
    const copyButton = screen.getByRole('button', { name: '正在复制群号' })
    expect(copyButton).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('正在复制群号')
    fireEvent.click(copyButton)
    expect(writeText).toHaveBeenCalledTimes(1)

    resolveCopy()
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('群号已复制'))
  })

  it('keeps manual-copy fallback safe when selection APIs throw', async () => {
    const user = userEvent.setup()
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('blocked')) })
    vi.spyOn(document, 'createRange').mockImplementation(() => {
      throw new Error('selection blocked')
    })
    render(<JoinPanel />)

    await user.click(screen.getByRole('button', { name: '复制群号' }))
    expect(screen.getByRole('status')).toHaveTextContent('请手动复制群号')
  })

  it.each(['resolve', 'reject'] as const)(
    'does not update after an in-flight clipboard request %ss following unmount',
    async (outcome) => {
      let settle!: () => void
      const pending = new Promise<void>((resolve, reject) => {
        settle = () => (outcome === 'resolve' ? resolve() : reject(new Error('blocked')))
      })
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      setClipboard({ writeText: vi.fn().mockReturnValue(pending) })
      const { unmount } = render(<JoinPanel />)

      fireEvent.click(screen.getByRole('button', { name: '复制群号' }))
      unmount()
      await act(async () => settle())

      expect(consoleError).not.toHaveBeenCalled()
    },
  )

  it('focuses department titles and provides a focusable empty-facts fallback', () => {
    const { rerender } = render(
      <DepartmentDetails selectedDepartmentId="science" onBack={vi.fn()} />,
    )
    expect(screen.getByRole('heading', { level: 1, name: '科素部' })).toHaveFocus()

    rerender(
      <DepartmentDetails
        departments={[]}
        selectedDepartmentId="unknown"
        onBack={vi.fn()}
      />,
    )
    const fallbackTitle = screen.getByRole('heading', {
      level: 1,
      name: '部门信息暂不可用',
    })
    expect(fallbackTitle).toHaveAttribute('tabindex', '-1')
    expect(fallbackTitle).toHaveFocus()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('falls back safely when ranking or department facts contain no valid primary', async () => {
    const onReset = vi.fn()
    const emptyRanking = { ...expectedResult, ranking: [] }
    const { rerender } = render(
      <ResultScreen
        result={emptyRanking}
        onOpenDepartment={vi.fn()}
        onReset={onReset}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('暂时没有可用的部门推荐')
    expect(screen.queryByText('同样值得了解')).not.toBeInTheDocument()
    expect(screen.queryByText('加入新生专题科普活动群')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '重新测评' }))
    expect(onReset).toHaveBeenCalledTimes(1)

    rerender(
      <ResultScreen
        departments={[]}
        result={expectedResult}
        onOpenDepartment={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('暂时没有可用的部门推荐')
    expect(screen.queryByText('加入新生专题科普活动群')).not.toBeInTheDocument()
  })

  it('deduplicates facts and ranking while clamping every displayed and animated score', () => {
    const malformedResult = {
      ...expectedResult,
      dimensions: {
        expression: Number.NaN,
        analysis: -20,
        execution: 180,
        adaptation: Number.POSITIVE_INFINITY,
      },
      ranking: [
        { ...expectedResult.ranking[0], id: 'office' as const, name: '办公室', score: Number.NaN },
        { ...expectedResult.ranking[0], id: 'office' as const, name: '办公室', score: 75 },
        { ...expectedResult.ranking[1], id: 'project' as const, name: '项目部', score: 160 },
        { ...expectedResult.ranking[2], id: 'science' as const, name: '科素部', score: -30 },
      ],
    }
    motionCapture.records.length = 0
    render(
      <ResultScreen
        departments={[departments[0], departments[0], departments[1], departments[4]]}
        result={malformedResult}
        onOpenDepartment={vi.fn()}
        onReset={vi.fn()}
      />,
    )

    for (const label of [
      '表达转化 0 分',
      '分析研究 0 分',
      '执行推进 100 分',
      '协作应变 0 分',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    expect(screen.getByRole('heading', { name: '继续查看三个部门' })).toBeInTheDocument()
    expect(screen.getAllByRole('article', { name: /备选部门/ })).toHaveLength(2)
    expect(screen.getByText('0 适配指数')).toBeInTheDocument()
    expect(
      within(screen.getByRole('article', { name: '备选部门 项目部' })).getByText(
        '100',
      ),
    ).toBeInTheDocument()
    const barScales = motionCapture.records
      .filter(({ animate, tag }) => tag === 'span' && typeof animate === 'object' && animate !== null && 'scaleX' in animate)
      .map(({ animate }) => (animate as { scaleX: number }).scaleX)
    expect(barScales).toEqual([0, 0, 1, 0])
  })

  it('uses distinct fact-based alternate reasons without repeating the strongest-dimension line', () => {
    render(<App />)

    const primary = screen.getByRole('region', { name: '首选部门' })
    const alternates = screen.getAllByRole('article', { name: /备选部门/ })
    expect(primary).toHaveTextContent(/你的.+倾向最突出/)
    const alternateReasons = alternates.map((alternate) => alternate.textContent)
    expect(alternateReasons.every((reason) => !reason?.includes('你的'))).toBe(true)
    expect(new Set(alternateReasons).size).toBe(2)
  })

  it('resets the assessment from the result', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '重新测评' }))

    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(
      screen.getByRole('heading', { name: '找到与你同频的部门' }),
    ).toBeInTheDocument()
  })

  it('disables every reveal, stagger, and bar entrance in reduced-motion mode', () => {
    setReducedMotion(true)
    render(<App />)

    const resultMotion = motionCapture.records
    const reveal = resultMotion.find(
      ({ className }) => className === 'result-lock-line',
    )
    const staggerContainer = resultMotion.find(
      ({ className }) => className === 'result-content',
    )
    const bars = resultMotion.filter(
      ({ animate, tag }) =>
        tag === 'span' &&
        typeof animate === 'object' &&
        animate !== null &&
        'scaleX' in animate,
    )

    expect(reveal).toBeDefined()
    expect(staggerContainer).toBeDefined()
    expect(bars).toHaveLength(4)
    expect(resultMotion.length).toBeGreaterThan(bars.length)

    for (const captured of resultMotion) {
      expect(captured.initial).toBe(false)
      expect(captured.variants).toBeUndefined()
      expect(captured.transition).toSatisfy(
        (transition: unknown) =>
          transition === undefined ||
          (typeof transition === 'object' &&
            transition !== null &&
            'duration' in transition &&
            transition.duration === 0),
      )
    }
  })

  it('supports legacy reduced-motion listeners and removes them on cleanup', () => {
    const media = setReducedMotion(false, 'legacy')
    const { unmount } = render(<App />)

    act(() => media.change(true))
    expect(screen.getByRole('main')).toHaveClass('result-view--reduced-motion')
    expect(media.addListener).toHaveBeenCalledTimes(1)

    unmount()
    expect(media.removeListener).toHaveBeenCalledTimes(1)
  })
})
