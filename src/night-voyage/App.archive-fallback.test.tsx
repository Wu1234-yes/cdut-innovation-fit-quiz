import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VOYAGE_SESSION_STORAGE_KEY, serializeVoyageSession } from './app/session'
import type { JourneyState } from './app/journeyReducer'

vi.mock('./content/departmentArchives', () => ({
  departmentArchives: [],
}))

import App from './App'

describe('Night Voyage archive fallback', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(cleanup)

  it('shows a recoverable fallback when a stored archive is unavailable', () => {
    const state: JourneyState = {
      version: 3,
      view: 'departmentArchive',
      activeSceneId: null,
      completedSceneIds: [],
      signals: {
        observation: [],
        clues: [],
        dialogue: null,
        route: { time: null, partner: null, approach: null },
        expression: null,
        expressionTuning: null,
      },
      selectedDepartmentId: 'publicity',
      departmentReturnView: 'screeningRoom',
    }
    sessionStorage.setItem(
      VOYAGE_SESSION_STORAGE_KEY,
      serializeVoyageSession(state),
    )

    render(<App />)

    expect(
      screen.getByRole('heading', { name: '这份部门档案暂时无法打开' }),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '返回科创放映舱' }))
    expect(screen.getByRole('heading', { name: '科创放映舱' })).toBeVisible()
  })
})
