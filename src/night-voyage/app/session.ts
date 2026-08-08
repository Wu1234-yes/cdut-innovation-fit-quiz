import type {
  ClueId,
  DepartmentId,
  DialogueId,
  ExpressionId,
  ObservationId,
  RouteApproachId,
  RoutePartnerId,
  RouteTimeId,
  SceneId,
} from '../content/types'
import {
  CLUE_IDS,
  DEPARTMENT_IDS,
  DIALOGUE_IDS,
  EXPRESSION_IDS,
  OBSERVATION_IDS,
  ROUTE_APPROACH_IDS,
  ROUTE_PARTNER_IDS,
  ROUTE_TIME_IDS,
  SCENE_IDS,
  SCENE_ORDER,
  createInitialJourneyState,
  isSceneComplete,
  type JourneyState,
  type DepartmentReturnView,
  type VoyageView,
} from './journeyReducer'

export const VOYAGE_SESSION_STORAGE_KEY = 'cdut-night-voyage-session-v3'
export const LEGACY_VOYAGE_STORAGE_KEY = 'cdut-night-voyage-session-v2'
export const LEGACY_QUIZ_STORAGE_KEY = 'cdut-fit-quiz-session-v1'

interface SessionStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const VIEWS = new Set<VoyageView>([
  'intro',
  'hub',
  'scene',
  'reveal',
  'result',
  'screeningRoom',
  'departmentAtlas',
  'departmentArchive',
])
const DEPARTMENT_RETURN_VIEWS = new Set<DepartmentReturnView>([
  'screeningRoom',
  'departmentAtlas',
])
const STATE_KEYS = new Set([
  'version',
  'view',
  'activeSceneId',
  'completedSceneIds',
  'signals',
  'selectedDepartmentId',
  'departmentReturnView',
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNullableMember = <T extends string>(
  value: unknown,
  values: Set<T>,
): value is T | null =>
  value === null || (typeof value === 'string' && values.has(value as T))

const isStringArray = <T extends string>(
  value: unknown,
  values: Set<T>,
  maximum: number,
): value is T[] =>
  Array.isArray(value) &&
  value.length <= maximum &&
  new Set(value).size === value.length &&
  value.every((item) => typeof item === 'string' && values.has(item as T))

const parseSignals = (value: unknown): JourneyState['signals'] | null => {
  if (!isRecord(value)) return null
  const keys = Object.keys(value)
  if (
    keys.length !== 6 ||
    ![
      'observation',
      'clues',
      'dialogue',
      'route',
      'expression',
      'expressionTuning',
    ].every((key) => keys.includes(key)) ||
    !isStringArray<ObservationId>(value.observation, OBSERVATION_IDS, 1) ||
    !isStringArray<ClueId>(value.clues, CLUE_IDS, 2) ||
    !isNullableMember<DialogueId>(value.dialogue, DIALOGUE_IDS) ||
    !isNullableMember<ExpressionId>(value.expression, EXPRESSION_IDS) ||
    !(
      value.expressionTuning === null ||
      (typeof value.expressionTuning === 'number' &&
        Number.isFinite(value.expressionTuning) &&
        value.expressionTuning >= 0 &&
        value.expressionTuning <= 100)
    ) ||
    !isRecord(value.route)
  ) {
    return null
  }

  const routeKeys = Object.keys(value.route)
  if (
    routeKeys.length !== 3 ||
    !['time', 'partner', 'approach'].every((key) => routeKeys.includes(key)) ||
    !isNullableMember<RouteTimeId>(value.route.time, ROUTE_TIME_IDS) ||
    !isNullableMember<RoutePartnerId>(value.route.partner, ROUTE_PARTNER_IDS) ||
    !isNullableMember<RouteApproachId>(value.route.approach, ROUTE_APPROACH_IDS)
  ) {
    return null
  }

  return {
    observation: [...value.observation],
    clues: [...value.clues],
    dialogue: value.dialogue,
    route: {
      time: value.route.time,
      partner: value.route.partner,
      approach: value.route.approach,
    },
    expression: value.expression,
    expressionTuning: value.expressionTuning,
  }
}

const hasNoSignals = (state: JourneyState) =>
  state.signals.observation.length === 0 &&
  state.signals.clues.length === 0 &&
  state.signals.dialogue === null &&
  state.signals.route.time === null &&
  state.signals.route.partner === null &&
  state.signals.route.approach === null &&
  state.signals.expression === null &&
  state.signals.expressionTuning === null

const completedSignalsMatch = (state: JourneyState) =>
  SCENE_ORDER.every(
    (sceneId) =>
      state.completedSceneIds.includes(sceneId) ===
      isSceneComplete(state.signals, sceneId),
  )

const hasCompleteJourney = (state: JourneyState) =>
  state.completedSceneIds.length === SCENE_ORDER.length && completedSignalsMatch(state)

const hasValidViewState = (state: JourneyState) => {
  const hasDepartment = state.selectedDepartmentId !== undefined
  const hasDepartmentReturnView = state.departmentReturnView !== undefined

  if (!completedSignalsMatch(state)) return false

  switch (state.view) {
    case 'intro':
      return hasNoSignals(state) && state.completedSceneIds.length === 0 && !hasDepartment && !hasDepartmentReturnView
    case 'hub':
      return state.activeSceneId === null && !hasDepartment && !hasDepartmentReturnView
    case 'scene':
      return state.activeSceneId !== null && SCENE_IDS.has(state.activeSceneId) && !hasDepartment && !hasDepartmentReturnView
    case 'reveal':
      return hasCompleteJourney(state) && state.activeSceneId === null && !hasDepartment && !hasDepartmentReturnView
    case 'result':
    case 'screeningRoom':
    case 'departmentAtlas':
      return (
        (hasCompleteJourney(state) || hasNoSignals(state)) &&
        state.activeSceneId === null &&
        !hasDepartment &&
        !hasDepartmentReturnView
      )
    case 'departmentArchive':
      return (
        (hasCompleteJourney(state) || hasNoSignals(state)) &&
        state.activeSceneId === null &&
        hasDepartment &&
        DEPARTMENT_IDS.has(state.selectedDepartmentId as DepartmentId) &&
        hasDepartmentReturnView &&
        DEPARTMENT_RETURN_VIEWS.has(
          state.departmentReturnView as DepartmentReturnView,
        )
      )
  }
}

export const parseVoyageSession = (raw: string): JourneyState | null => {
  try {
    const payload: unknown = JSON.parse(raw)
    if (!isRecord(payload) || Object.keys(payload).length !== 2) return null
    if (payload.version !== 3 || !isRecord(payload.state)) return null

    const value = payload.state
    const keys = Object.keys(value)
    if (
      keys.length < 5 ||
      keys.length > 7 ||
      !keys.every((key) => STATE_KEYS.has(key)) ||
      value.version !== 3 ||
      typeof value.view !== 'string' ||
      !VIEWS.has(value.view as VoyageView) ||
      !(
        value.activeSceneId === null ||
        (typeof value.activeSceneId === 'string' &&
          SCENE_IDS.has(value.activeSceneId as SceneId))
      ) ||
      !isStringArray<SceneId>(value.completedSceneIds, SCENE_IDS, SCENE_ORDER.length)
    ) {
      return null
    }

    const signals = parseSignals(value.signals)
    if (!signals) return null

    const state: JourneyState = {
      version: 3,
      view: value.view as VoyageView,
      activeSceneId: value.activeSceneId as SceneId | null,
      completedSceneIds: [...value.completedSceneIds],
      signals,
    }

    if (Object.hasOwn(value, 'selectedDepartmentId')) {
      if (
        typeof value.selectedDepartmentId !== 'string' ||
        !DEPARTMENT_IDS.has(value.selectedDepartmentId as DepartmentId)
      ) {
        return null
      }
      state.selectedDepartmentId = value.selectedDepartmentId as DepartmentId
    }

    if (Object.hasOwn(value, 'departmentReturnView')) {
      if (
        typeof value.departmentReturnView !== 'string' ||
        !DEPARTMENT_RETURN_VIEWS.has(
          value.departmentReturnView as DepartmentReturnView,
        )
      ) {
        return null
      }
      state.departmentReturnView =
        value.departmentReturnView as DepartmentReturnView
    }

    return hasValidViewState(state) ? state : null
  } catch {
    return null
  }
}

export const serializeVoyageSession = (state: JourneyState) =>
  JSON.stringify({ version: 3, state })

const resolveStorage = (
  storage: SessionStorageLike | null | undefined,
): SessionStorageLike | null => {
  if (storage !== undefined) return storage
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

export const saveVoyageSession = (
  state: JourneyState,
  storage?: SessionStorageLike | null,
) => {
  const target = resolveStorage(storage)
  if (!target) return false
  try {
    target.setItem(VOYAGE_SESSION_STORAGE_KEY, serializeVoyageSession(state))
    return true
  } catch {
    return false
  }
}

export const clearVoyageSession = (storage?: SessionStorageLike | null) => {
  const target = resolveStorage(storage)
  if (!target) return false
  try {
    target.removeItem(VOYAGE_SESSION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export const loadVoyageSession = (
  storage?: SessionStorageLike | null,
): JourneyState => {
  const target = resolveStorage(storage)
  if (!target) return createInitialJourneyState()

  try {
    target.removeItem(LEGACY_QUIZ_STORAGE_KEY)
    target.removeItem(LEGACY_VOYAGE_STORAGE_KEY)
    const raw = target.getItem(VOYAGE_SESSION_STORAGE_KEY)
    if (raw === null) return createInitialJourneyState()

    const state = parseVoyageSession(raw)
    if (state) return state

    target.removeItem(VOYAGE_SESSION_STORAGE_KEY)
    return createInitialJourneyState()
  } catch {
    return createInitialJourneyState()
  }
}
