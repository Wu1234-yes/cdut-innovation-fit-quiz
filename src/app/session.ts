import { departments } from '../content/departments'
import { questions } from '../content/questions'
import type { Answers, DepartmentId } from '../content/types'
import {
  LAST_QUESTION_INDEX,
  createInitialState,
  hasAnsweredQuestionsBefore,
  hasCompleteAnswers,
  type AppState,
  type View,
} from './appReducer'

export const SESSION_STORAGE_KEY = 'cdut-fit-quiz-session-v1'

interface SessionStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const views = new Set<View>([
  'welcome',
  'quiz',
  'analyzing',
  'result',
  'departmentDetails',
])
const departmentIds = new Set(departments.map(({ id }) => id))
const questionsById = new Map(questions.map((question) => [question.id, question]))
const stateKeys = new Set([
  'view',
  'questionIndex',
  'answers',
  'selectedDepartmentId',
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactSessionKeys = (value: Record<string, unknown>) => {
  const keys = Object.keys(value)
  return keys.length === 2 && keys.includes('version') && keys.includes('state')
}

const hasValidStateKeys = (value: Record<string, unknown>) => {
  const keys = Object.keys(value)
  return (
    keys.length >= 3 &&
    keys.length <= 4 &&
    keys.every((key) => stateKeys.has(key)) &&
    keys.includes('view') &&
    keys.includes('questionIndex') &&
    keys.includes('answers')
  )
}

const isValidAnswers = (value: unknown): value is Answers => {
  if (!isRecord(value)) {
    return false
  }

  return Object.entries(value).every(([questionId, optionId]) => {
    const question = questionsById.get(questionId)
    return (
      typeof optionId === 'string' &&
      question?.options.some(({ id }) => id === optionId) === true
    )
  })
}

const hasValidViewState = (state: AppState) => {
  switch (state.view) {
    case 'welcome':
      return state.questionIndex === 0 && Object.keys(state.answers).length === 0
    case 'quiz':
      return hasAnsweredQuestionsBefore(state.answers, state.questionIndex)
    case 'analyzing':
    case 'result':
    case 'departmentDetails':
      return hasCompleteAnswers(state.answers)
  }
}

export const parseSession = (raw: string): AppState | null => {
  try {
    const payload: unknown = JSON.parse(raw)

    if (
      !isRecord(payload) ||
      !hasExactSessionKeys(payload) ||
      payload.version !== 1 ||
      !isRecord(payload.state)
    ) {
      return null
    }

    const state = payload.state
    if (
      !hasValidStateKeys(state) ||
      typeof state.view !== 'string' ||
      !views.has(state.view as View) ||
      !Number.isInteger(state.questionIndex) ||
      (state.questionIndex as number) < 0 ||
      (state.questionIndex as number) > LAST_QUESTION_INDEX ||
      !isValidAnswers(state.answers)
    ) {
      return null
    }

    const hasSelectedDepartment = Object.hasOwn(
      state,
      'selectedDepartmentId',
    )
    if (
      (state.view === 'departmentDetails') !== hasSelectedDepartment ||
      hasSelectedDepartment &&
      (typeof state.selectedDepartmentId !== 'string' ||
        !departmentIds.has(state.selectedDepartmentId as DepartmentId))
    ) {
      return null
    }

    const parsedState: AppState = {
      view: state.view as View,
      questionIndex: state.questionIndex as number,
      answers: { ...state.answers },
    }

    if (hasSelectedDepartment) {
      parsedState.selectedDepartmentId = state.selectedDepartmentId as DepartmentId
    }

    return hasValidViewState(parsedState) ? parsedState : null
  } catch {
    return null
  }
}

export const serializeSession = (state: AppState): string =>
  JSON.stringify({ version: 1, state })

const resolveStorage = (
  storage: SessionStorageLike | null | undefined,
): SessionStorageLike | null => {
  if (storage !== undefined) {
    return storage
  }

  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

interface SessionInspection {
  state: AppState
  invalid: boolean
}

const inspectSession = (
  storage?: SessionStorageLike | null,
): SessionInspection => {
  const target = resolveStorage(storage)
  if (!target) {
    return { state: createInitialState(), invalid: false }
  }

  let raw: string | null
  try {
    raw = target.getItem(SESSION_STORAGE_KEY)
  } catch {
    return { state: createInitialState(), invalid: false }
  }

  if (raw === null) {
    return { state: createInitialState(), invalid: false }
  }

  const state = parseSession(raw)
  return state
    ? { state, invalid: false }
    : { state: createInitialState(), invalid: true }
}

export const saveSession = (
  state: AppState,
  storage?: SessionStorageLike | null,
): boolean => {
  const target = resolveStorage(storage)
  if (!target) {
    return false
  }

  try {
    target.setItem(SESSION_STORAGE_KEY, serializeSession(state))
    return true
  } catch {
    return false
  }
}

export const clearSession = (
  storage?: SessionStorageLike | null,
): boolean => {
  const target = resolveStorage(storage)
  if (!target) {
    return false
  }

  try {
    target.removeItem(SESSION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export const readSession = (
  storage?: SessionStorageLike | null,
): AppState => inspectSession(storage).state

export const clearInvalidSession = (
  storage?: SessionStorageLike | null,
): boolean => {
  const inspection = inspectSession(storage)
  return inspection.invalid ? clearSession(storage) : false
}

export const loadSession = (
  storage?: SessionStorageLike | null,
): AppState => {
  const inspection = inspectSession(storage)
  if (inspection.invalid) {
    clearSession(storage)
  }

  return inspection.state
}
