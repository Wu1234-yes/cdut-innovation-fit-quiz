import { beforeEach, describe, expect, it } from 'vitest'
import {
  LAST_QUESTION_INDEX,
  appReducer,
  createInitialState,
  initialState,
  type AppAction,
  type AppState,
  type View,
} from '../../src/app/appReducer'
import {
  SESSION_STORAGE_KEY,
  clearSession,
  loadSession,
  parseSession,
  saveSession,
  serializeSession,
} from '../../src/app/session'
import * as sessionModule from '../../src/app/session'
import { questions } from '../../src/content/questions'
import type { Answers } from '../../src/content/types'

const completeAnswers: Answers = Object.fromEntries(
  questions.map((question) => [question.id, question.options[0].id]),
)

const completeQuizState: AppState = {
  view: 'quiz',
  questionIndex: LAST_QUESTION_INDEX,
  answers: completeAnswers,
}

const answeredState: AppState = {
  ...completeQuizState,
  view: 'result',
}

const departmentDetailsState: AppState = {
  ...answeredState,
  view: 'departmentDetails',
  selectedDepartmentId: 'office',
}

const persisted = (state: unknown = answeredState, version: unknown = 1) =>
  JSON.stringify({ version, state })

describe('appReducer', () => {
  it('starts from a clean welcome state', () => {
    expect(initialState).toEqual({
      view: 'welcome',
      questionIndex: 0,
      answers: {},
    })
  })

  it('derives the last question index from the real question bank', () => {
    expect(questions).toHaveLength(25)
    expect(LAST_QUESTION_INDEX).toBe(questions.length - 1)
  })

  it('starts only from welcome', () => {
    const quiz = appReducer(initialState, { type: 'START' })

    expect(quiz).toEqual({ ...initialState, view: 'quiz' })
    expect(appReducer(quiz, { type: 'START' })).toBe(quiz)
    expect(appReducer(answeredState, { type: 'START' })).toBe(answeredState)
  })

  it('records and replaces valid answers only while in quiz', () => {
    let state = appReducer(initialState, { type: 'START' })
    state = appReducer(state, {
      type: 'ANSWER',
      questionId: 'p01',
      optionId: 'p01-a',
    })
    state = appReducer(state, {
      type: 'ANSWER',
      questionId: 'p01',
      optionId: 'p01-b',
    })

    expect(state.answers).toEqual({ p01: 'p01-b' })
    expect(
      appReducer(answeredState, {
        type: 'ANSWER',
        questionId: 'p01',
        optionId: 'p01-a',
      }),
    ).toBe(answeredState)
  })

  it('ignores unknown questions and options', () => {
    const quiz = appReducer(initialState, { type: 'START' })

    expect(
      appReducer(quiz, {
        type: 'ANSWER',
        questionId: 'unknown',
        optionId: 'p01-a',
      }),
    ).toBe(quiz)
    expect(
      appReducer(quiz, {
        type: 'ANSWER',
        questionId: 'p01',
        optionId: 's01-a',
      }),
    ).toBe(quiz)
  })

  it('moves next only when the current quiz question is answered', () => {
    const quiz = appReducer(initialState, { type: 'START' })
    const answered = appReducer(quiz, {
      type: 'ANSWER',
      questionId: questions[0].id,
      optionId: questions[0].options[0].id,
    })

    expect(appReducer(quiz, { type: 'NEXT' })).toBe(quiz)
    expect(appReducer(answered, { type: 'NEXT' }).questionIndex).toBe(1)
    expect(appReducer(answeredState, { type: 'NEXT' })).toBe(answeredState)
  })

  it('moves previous only in quiz and keeps the first index fixed', () => {
    const first = appReducer(initialState, { type: 'START' })
    const middle = { ...first, questionIndex: 10 }

    expect(appReducer(first, { type: 'PREVIOUS' })).toBe(first)
    expect(appReducer(middle, { type: 'PREVIOUS' }).questionIndex).toBe(9)
    expect(appReducer(answeredState, { type: 'PREVIOUS' })).toBe(answeredState)
  })

  it('cannot leave question 25 with an incomplete answer set', () => {
    const deadEndCandidate: AppState = {
      view: 'quiz',
      questionIndex: LAST_QUESTION_INDEX,
      answers: {},
    }

    expect(appReducer(deadEndCandidate, { type: 'NEXT' })).toBe(deadEndCandidate)
    expect(appReducer(deadEndCandidate, { type: 'FINISH' })).toBe(
      deadEndCandidate,
    )
  })

  it('finishes only from the last quiz question with all answers complete', () => {
    const notLast = { ...completeQuizState, questionIndex: 18 }
    const incomplete = {
      ...completeQuizState,
      answers: { ...completeAnswers, s08: undefined },
    }
    const analyzing = appReducer(completeQuizState, { type: 'FINISH' })

    expect(appReducer(notLast, { type: 'FINISH' })).toBe(notLast)
    expect(appReducer(incomplete, { type: 'FINISH' })).toBe(incomplete)
    expect(analyzing).toEqual({ ...completeQuizState, view: 'analyzing' })
  })

  it('shows results only from complete analyzing or department details states', () => {
    const analyzing: AppState = { ...completeQuizState, view: 'analyzing' }
    const incompleteAnalyzing: AppState = {
      ...analyzing,
      answers: { p01: 'p01-a' },
    }
    const result = appReducer(analyzing, { type: 'SHOW_RESULT' })
    const returnedResult = appReducer(departmentDetailsState, {
      type: 'SHOW_RESULT',
    })

    expect(result.view).toBe('result')
    expect(returnedResult).toEqual(answeredState)
    expect(appReducer(incompleteAnalyzing, { type: 'SHOW_RESULT' })).toBe(
      incompleteAnalyzing,
    )
    expect(appReducer(completeQuizState, { type: 'SHOW_RESULT' })).toBe(
      completeQuizState,
    )
  })

  it('opens a valid department only from a complete result', () => {
    const details = appReducer(answeredState, {
      type: 'OPEN_DEPARTMENT',
      departmentId: 'publicity',
    })
    const incompleteResult: AppState = {
      ...answeredState,
      answers: { p01: 'p01-a' },
    }

    expect(details).toMatchObject({
      view: 'departmentDetails',
      selectedDepartmentId: 'publicity',
    })
    expect(
      appReducer(incompleteResult, {
        type: 'OPEN_DEPARTMENT',
        departmentId: 'office',
      }),
    ).toBe(incompleteResult)
    expect(
      appReducer(completeQuizState, {
        type: 'OPEN_DEPARTMENT',
        departmentId: 'office',
      }),
    ).toBe(completeQuizState)
  })

  it('does not open an unknown department received at runtime', () => {
    const action = {
      type: 'OPEN_DEPARTMENT',
      departmentId: 'unknown',
    } as unknown as AppAction

    expect(appReducer(answeredState, action)).toBe(answeredState)
  })

  it('round-trips reducer-generated states for every legal view', () => {
    const welcome = createInitialState()
    const quiz = appReducer(welcome, { type: 'START' })
    const analyzing = appReducer(completeQuizState, { type: 'FINISH' })
    const result = appReducer(analyzing, { type: 'SHOW_RESULT' })
    const departmentDetails = appReducer(result, {
      type: 'OPEN_DEPARTMENT',
      departmentId: 'science',
    })
    const returnedResult = appReducer(departmentDetails, {
      type: 'SHOW_RESULT',
    })

    for (const state of [
      welcome,
      quiz,
      analyzing,
      result,
      departmentDetails,
      returnedResult,
    ]) {
      expect(parseSession(serializeSession(state))).toEqual(state)
    }
  })

  it('resets every view to an independent clean state', () => {
    const firstReset = appReducer(answeredState, { type: 'RESET' })
    firstReset.answers.p01 = 'p01-a'
    const secondReset = appReducer(departmentDetailsState, { type: 'RESET' })

    try {
      expect(firstReset).not.toBe(secondReset)
      expect(firstReset.answers).not.toBe(secondReset.answers)
      expect(secondReset).toEqual(initialState)
    } finally {
      delete firstReset.answers.p01
    }
  })
})

describe('parseSession', () => {
  const validStates: Record<View, AppState> = {
    welcome: createInitialState(),
    quiz: {
      view: 'quiz',
      questionIndex: 2,
      answers: {
        p01: 'p01-a',
        p02: 'p02-b',
        p10: 'p10-a',
      },
    },
    analyzing: { ...completeQuizState, view: 'analyzing' },
    result: answeredState,
    departmentDetails: departmentDetailsState,
  }

  it.each<View>([
    'welcome',
    'quiz',
    'analyzing',
    'result',
    'departmentDetails',
  ])('accepts a semantically valid %s view', (view) => {
    expect(parseSession(persisted(validStates[view]))).toEqual(validStates[view])
  })

  it('requires welcome to be completely clean', () => {
    expect(
      parseSession(
        persisted({ view: 'welcome', questionIndex: 1, answers: {} }),
      ),
    ).toBeNull()
    expect(
      parseSession(
        persisted({
          view: 'welcome',
          questionIndex: 0,
          answers: { p01: 'p01-a' },
        }),
      ),
    ).toBeNull()
  })

  it('requires every question before the quiz index to be answered', () => {
    expect(
      parseSession(
        persisted({
          view: 'quiz',
          questionIndex: 2,
          answers: { p01: 'p01-a', p10: 'p10-a' },
        }),
      ),
    ).toBeNull()
    expect(
      parseSession(
        persisted({
          view: 'quiz',
          questionIndex: 1,
          answers: { p01: 'p01-a', s08: 's08-a' },
        }),
      ),
    ).toEqual({
      view: 'quiz',
      questionIndex: 1,
      answers: { p01: 'p01-a', s08: 's08-a' },
    })
  })

  it.each(['analyzing', 'result', 'departmentDetails'] as View[])(
    'requires complete answers for %s',
    (view) => {
      const state: AppState = {
        view,
        questionIndex: LAST_QUESTION_INDEX,
        answers: { p01: 'p01-a' },
        ...(view === 'departmentDetails'
          ? { selectedDepartmentId: 'office' as const }
          : {}),
      }

      expect(parseSession(persisted(state))).toBeNull()
    },
  )

  it('rejects bad JSON and non-object payloads', () => {
    expect(parseSession('{bad json')).toBeNull()
    expect(parseSession('null')).toBeNull()
    expect(parseSession('[]')).toBeNull()
    expect(parseSession('"value"')).toBeNull()
  })

  it('requires exactly version 1 and an object state', () => {
    expect(parseSession(persisted(answeredState, 0))).toBeNull()
    expect(parseSession(persisted(answeredState, 2))).toBeNull()
    expect(parseSession(persisted(answeredState, '1'))).toBeNull()
    expect(parseSession(JSON.stringify({ version: 1 }))).toBeNull()
    expect(parseSession(JSON.stringify({ version: 1, state: null }))).toBeNull()
    expect(parseSession(JSON.stringify({ version: 1, state: [] }))).toBeNull()
    expect(
      parseSession(
        JSON.stringify({ version: 1, state: answeredState, extra: true }),
      ),
    ).toBeNull()
  })

  it('rejects unknown views and missing or extra state fields', () => {
    expect(
      parseSession(persisted({ ...answeredState, view: 'unknown' })),
    ).toBeNull()
    expect(
      parseSession(
        persisted({ questionIndex: 0, answers: {}, viewMissing: 'welcome' }),
      ),
    ).toBeNull()
    expect(
      parseSession(persisted({ ...answeredState, unexpected: true })),
    ).toBeNull()
  })

  it.each([-1, LAST_QUESTION_INDEX + 1, 1.5, '1', null])(
    'rejects invalid question index %s',
    (questionIndex) => {
      expect(
        parseSession(persisted({ ...answeredState, questionIndex })),
      ).toBeNull()
    },
  )

  it('rejects invalid answer collections and values', () => {
    for (const answers of [null, [], 'answers', 1]) {
      expect(parseSession(persisted({ ...answeredState, answers }))).toBeNull()
    }
    expect(
      parseSession(
        persisted({ ...answeredState, answers: { unknown: 'p01-a' } }),
      ),
    ).toBeNull()
    expect(
      parseSession(
        persisted({ ...answeredState, answers: { p01: 'unknown' } }),
      ),
    ).toBeNull()
    expect(
      parseSession(
        persisted({ ...answeredState, answers: { p01: 's01-a' } }),
      ),
    ).toBeNull()
  })

  it('requires a valid selected department exactly for department details', () => {
    expect(
      parseSession(persisted({ ...answeredState, view: 'departmentDetails' })),
    ).toBeNull()
    expect(
      parseSession(
        persisted({
          ...departmentDetailsState,
          selectedDepartmentId: 'unknown',
        }),
      ),
    ).toBeNull()

    for (const view of ['welcome', 'quiz', 'analyzing', 'result'] as View[]) {
      expect(
        parseSession(
          persisted({ ...validStates[view], selectedDepartmentId: 'office' }),
        ),
      ).toBeNull()
    }
  })
})

describe('session helpers', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('serializes and saves the exact versioned shape under the fixed key', () => {
    expect(JSON.parse(serializeSession(answeredState))).toEqual({
      version: 1,
      state: answeredState,
    })

    expect(saveSession(answeredState)).toBe(true)
    expect(sessionStorage.length).toBe(1)
    expect(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)!)).toEqual({
      version: 1,
      state: answeredState,
    })
  })

  it('loads a valid state and clears saved progress', () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, persisted())

    expect(loadSession()).toEqual(answeredState)
    expect(clearSession()).toBe(true)
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('returns independent clean states when no saved session exists', () => {
    const firstFallback = loadSession(null)
    firstFallback.answers.p01 = 'p01-a'
    const secondFallback = loadSession(null)

    expect(firstFallback).not.toBe(secondFallback)
    expect(firstFallback.answers).not.toBe(secondFallback.answers)
    expect(secondFallback).toEqual(initialState)
  })

  it('clears corrupt, semantically invalid, or version-mismatched data', () => {
    const invalidQuiz = persisted({
      view: 'quiz',
      questionIndex: LAST_QUESTION_INDEX,
      answers: {},
    })

    for (const raw of ['{bad json', persisted(answeredState, 0), invalidQuiz]) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, raw)

      expect(loadSession()).toEqual(initialState)
      expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    }
  })

  it('can read invalid data without mutating storage before explicit cleanup', () => {
    const raw = persisted({
      view: 'quiz',
      questionIndex: LAST_QUESTION_INDEX,
      answers: {},
    })
    const readOnlyHelpers = sessionModule as typeof sessionModule & {
      readSession?: () => AppState
      clearInvalidSession?: () => boolean
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY, raw)

    expect(readOnlyHelpers.readSession).toBeTypeOf('function')
    expect(readOnlyHelpers.clearInvalidSession).toBeTypeOf('function')
    expect(readOnlyHelpers.readSession!()).toEqual(initialState)
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(raw)
    expect(readOnlyHelpers.clearInvalidSession!()).toBe(true)
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('does not throw when storage is unavailable or blocked', () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('get blocked')
      },
      setItem: () => {
        throw new Error('set blocked')
      },
      removeItem: () => {
        throw new Error('remove blocked')
      },
    }

    expect(saveSession(answeredState, null)).toBe(false)
    expect(loadSession(null)).toEqual(initialState)
    expect(clearSession(null)).toBe(false)
    expect(saveSession(answeredState, throwingStorage)).toBe(false)
    expect(loadSession(throwingStorage)).toEqual(initialState)
    expect(clearSession(throwingStorage)).toBe(false)
  })
})
