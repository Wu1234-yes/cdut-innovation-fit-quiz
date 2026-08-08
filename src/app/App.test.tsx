import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { questions } from '../content/questions'
import { scoreQuiz } from '../scoring/scoreQuiz'
import type { AppState } from './appReducer'
import { SESSION_STORAGE_KEY, serializeSession } from './session'
import App from './App'

const startQuiz = async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: '开始扫描' }))
  return user
}

const answerEveryQuestion = () => {
  for (const [index, question] of questions.entries()) {
    fireEvent.click(
      screen.getByRole('radio', { name: question.options[0].label }),
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: index === questions.length - 1 ? '生成结果' : '下一题',
      }),
    )
  }
}

const readPersistedState = (): AppState =>
  JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)!).state

const completeAnswers = Object.fromEntries(
  questions.map((question) => [question.id, question.options[0].id]),
)

describe('App quiz flow', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts on a complete semantic welcome view', () => {
    render(<App />)

    expect(
      screen.getByText('成都理工大学青年科技创新服务中心'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: '科创部门适配测评',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '找到与你同频的部门' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/3 至 4 分钟/)).toBeInTheDocument()
    expect(screen.getByText(/匿名.*不会上传/)).toBeInTheDocument()
  })

  it('focuses each question while keeping navigation explicit and answers stable', async () => {
    const user = await startQuiz()
    const firstQuestion = questions[0]
    const secondQuestion = questions[1]
    const firstOption = firstQuestion.options[0]
    const firstLegend = screen.getByText(firstQuestion.prompt)

    expect(screen.getByText('1 / 20')).toHaveAttribute('aria-live', 'polite')
    expect(firstLegend).toHaveFocus()
    expect(firstLegend).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('button', { name: '上一题' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一题' })).toBeDisabled()
    expect(screen.getByText(/请选择一个最符合你的选项/)).not.toHaveAttribute(
      'aria-live',
    )

    await user.click(screen.getByRole('radio', { name: firstOption.label }))

    expect(screen.getByText('1 / 20')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: firstOption.label })).toBeChecked()
    expect(screen.getByRole('button', { name: '下一题' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: '下一题' }))
    expect(screen.getByText(secondQuestion.prompt)).toHaveFocus()
    expect(screen.getByText('2 / 20')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '上一题' }))
    expect(screen.getByText(firstQuestion.prompt)).toHaveFocus()
    expect(screen.getByRole('radio', { name: firstOption.label })).toBeChecked()
  })

  it('restores the current question and checked answer from sessionStorage', () => {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      serializeSession({
        view: 'quiz',
        questionIndex: 1,
        answers: {
          [questions[0].id]: questions[0].options[1].id,
          [questions[1].id]: questions[1].options[0].id,
        },
      }),
    )

    render(<App />)

    expect(screen.getByText('2 / 20')).toBeInTheDocument()
    expect(screen.getByText(questions[1].prompt)).toHaveFocus()
    expect(
      screen.getByRole('radio', { name: questions[1].options[0].label }),
    ).toBeChecked()
  })

  it('clears an unreachable restored state after mount and never scores it', () => {
    vi.useFakeTimers()
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      serializeSession({
        view: 'analyzing',
        questionIndex: questions.length - 1,
        answers: { [questions[0].id]: questions[0].options[0].id },
      }),
    )

    render(<App />)
    act(() => vi.advanceTimersByTime(1_000))

    expect(
      screen.getByRole('heading', { name: '找到与你同频的部门' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('科创转译者')).not.toBeInTheDocument()
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('reads session storage only in the reducer lazy initializer', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    render(<App />)
    const readsAfterMount = getItemSpy.mock.calls.length

    fireEvent.click(screen.getByRole('button', { name: '开始扫描' }))
    fireEvent.click(
      screen.getByRole('radio', { name: questions[0].options[0].label }),
    )
    fireEvent.click(screen.getByRole('button', { name: '下一题' }))

    expect(readsAfterMount).toBe(2)
    expect(getItemSpy).toHaveBeenCalledTimes(readsAfterMount)
  })

  it('persists answers and the current question after real interactions', async () => {
    const user = await startQuiz()
    const firstQuestion = questions[0]

    await user.click(
      screen.getByRole('radio', { name: firstQuestion.options[1].label }),
    )
    expect(readPersistedState()).toMatchObject({
      view: 'quiz',
      questionIndex: 0,
      answers: { [firstQuestion.id]: firstQuestion.options[1].id },
    })

    await user.click(screen.getByRole('button', { name: '下一题' }))
    expect(readPersistedState()).toMatchObject({
      view: 'quiz',
      questionIndex: 1,
      answers: { [firstQuestion.id]: firstQuestion.options[1].id },
    })
  })

  it('persists analyzing and one focused result under StrictMode, then clears reset progress', () => {
    vi.useFakeTimers()
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    fireEvent.click(screen.getByRole('button', { name: '开始扫描' }))

    answerEveryQuestion()

    expect(screen.getByRole('status')).toHaveTextContent(/正在生成/)
    expect(readPersistedState().view).toBe('analyzing')

    act(() => vi.advanceTimersByTime(1_499))
    expect(screen.queryByText('科创转译者')).not.toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1))
    const resultHeadings = screen.getAllByRole('heading', {
      name: '科创转译者',
    })
    expect(resultHeadings).toHaveLength(1)
    expect(resultHeadings[0]).toHaveFocus()
    expect(readPersistedState().view).toBe('result')

    act(() => vi.advanceTimersByTime(1_500))
    expect(
      screen.getAllByRole('heading', { name: '科创转译者' }),
    ).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: '重新测评' }))
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(
      screen.getByRole('heading', { name: '找到与你同频的部门' }),
    ).toBeInTheDocument()
  })

  it('focuses department details and restores the exact directory trigger on return', async () => {
    const primaryDepartment = scoreQuiz(completeAnswers).ranking[0]
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      serializeSession({
        view: 'result',
        questionIndex: questions.length - 1,
        answers: completeAnswers,
      }),
    )
    const user = userEvent.setup()
    render(<App />)

    const directoryTrigger = screen.getByRole('button', {
      name: `查看${primaryDepartment.name}详情`,
    })
    await user.click(directoryTrigger)
    expect(
      screen.getByRole('heading', { level: 1, name: primaryDepartment.name }),
    ).toHaveFocus()

    await user.click(screen.getByRole('button', { name: '返回结果' }))
    expect(
      screen.getByRole('button', { name: `查看${primaryDepartment.name}详情` }),
    ).toHaveFocus()
    expect(
      screen.getByRole('button', {
        name: `查看首选部门${primaryDepartment.name}详情`,
      }),
    ).not.toHaveFocus()
  })

  it('keeps a direct start CTA when the RadarHero chunk fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const radarHeroLoader = vi
      .fn()
      .mockRejectedValue(new Error('Radar chunk unavailable'))

    render(<App radarHeroLoader={radarHeroLoader} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/雷达暂时无法加载/)
    expect(
      screen.getByText('成都理工大学青年科技创新服务中心'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '找到与你同频的部门' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '开始扫描' }))
    expect(await screen.findByText('1 / 20')).toBeInTheDocument()
  })

  it('creates a fresh lazy loader attempt when retrying RadarHero', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const radarHeroLoader = vi
      .fn()
      .mockRejectedValueOnce(new Error('First Radar chunk failed'))
      .mockResolvedValueOnce({
        default: ({ onStart }: { onStart: () => void }) => (
          <main>
            <p>雷达重试成功</p>
            <button onClick={onStart} type="button">开始扫描</button>
          </main>
        ),
      })

    render(<App radarHeroLoader={radarHeroLoader} />)
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '重新加载雷达' }))

    expect(await screen.findByText('雷达重试成功')).toBeInTheDocument()
    expect(radarHeroLoader).toHaveBeenCalledTimes(2)
  })
})
