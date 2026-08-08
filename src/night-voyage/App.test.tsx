import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialJourneyState, journeyReducer } from './app/journeyReducer'
import { VOYAGE_SESSION_STORAGE_KEY, serializeVoyageSession } from './app/session'
import App from './App'

describe('Night Voyage App version 3', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(cleanup)

  it('starts at the open-world hub from the cinematic intro', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '进入夜航' }))

    expect(screen.getByText('夜航枢纽')).toBeVisible()
    expect(screen.getAllByTestId('hub-destination')).toHaveLength(5)
    expect(sessionStorage.getItem(VOYAGE_SESSION_STORAGE_KEY)).not.toBeNull()
  })

  it('offers a general fast path without fabricated evidence', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '直接看看科创能做什么' }))

    expect(screen.getByRole('heading', { name: '从一件小事开始，也算科创' })).toBeVisible()
    expect(screen.queryByText(/匹配度|最适合|部门排名|%/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进入科创放映舱' })).toBeEnabled()
  })

  it('restores a valid version 3 active scene', () => {
    let state = journeyReducer(createInitialJourneyState(), { type: 'START' })
    state = journeyReducer(state, { type: 'ENTER_SCENE', sceneId: 'observation' })
    state = journeyReducer(state, {
      type: 'COMPLETE_SCENE',
      sceneId: 'observation',
      signal: { observation: ['detail'] },
    })
    state = journeyReducer(state, { type: 'ENTER_SCENE', sceneId: 'clues' })
    sessionStorage.setItem(VOYAGE_SESSION_STORAGE_KEY, serializeVoyageSession(state))

    render(<App />)

    expect(screen.getByRole('heading', { name: '磁吸星图' })).toBeVisible()
    expect(screen.getByRole('button', { name: '返回夜航枢纽' })).toBeEnabled()
  })

  it('disables browser scroll restoration while mounted', () => {
    Object.defineProperty(window.history, 'scrollRestoration', {
      configurable: true,
      value: 'auto',
      writable: true,
    })

    const { unmount } = render(<App />)

    expect(window.history.scrollRestoration).toBe('manual')
    unmount()
    expect(window.history.scrollRestoration).toBe('auto')
  })

  it('resets scroll when moving between major views', () => {
    const scrollTo = vi.mocked(window.scrollTo)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '直接看看科创能做什么' }))
    scrollTo.mockClear()

    fireEvent.click(screen.getByRole('button', { name: '进入科创放映舱' }))
    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'auto', left: 0, top: 0 })
  })

  it('opens a department from the atlas and returns to the atlas', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '直接看看科创能做什么' }))
    fireEvent.click(screen.getByRole('button', { name: '查看全部部门' }))
    fireEvent.click(screen.getByRole('button', { name: '查看宣传部档案' }))
    fireEvent.click(screen.getByRole('button', { name: '打开宣传部完整档案' }))

    expect(screen.getByRole('heading', { level: 1, name: '宣传部' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '返回部门总览' }))
    expect(screen.getByRole('heading', { name: '七部门探索图鉴' })).toBeVisible()
  })
})
