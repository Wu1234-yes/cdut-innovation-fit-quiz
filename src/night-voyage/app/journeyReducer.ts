import type {
  ClueId,
  DepartmentId,
  DialogueId,
  ExpressionId,
  JourneySignals,
  ObservationId,
  RouteApproachId,
  RoutePartnerId,
  RouteTimeId,
  SceneId,
} from '../content/types'

export const SCENE_ORDER: SceneId[] = [
  'observation',
  'clues',
  'dialogue',
  'map',
  'expression',
]

export type VoyageView =
  | 'intro'
  | 'hub'
  | 'scene'
  | 'reveal'
  | 'result'
  | 'screeningRoom'
  | 'departmentAtlas'
  | 'departmentArchive'

export type DepartmentReturnView = 'screeningRoom' | 'departmentAtlas'

export interface JourneyState {
  version: 3
  view: VoyageView
  activeSceneId: SceneId | null
  completedSceneIds: SceneId[]
  signals: JourneySignals
  selectedDepartmentId?: DepartmentId
  departmentReturnView?: DepartmentReturnView
}

export type SceneSignalSubmission =
  | { observation: ObservationId[] }
  | { clues: ClueId[] }
  | { dialogue: DialogueId }
  | {
      route: {
        time: RouteTimeId
        partner: RoutePartnerId
        approach: RouteApproachId
      }
    }
  | { expression: ExpressionId; expressionTuning: number }

export type JourneyAction =
  | { type: 'START' }
  | { type: 'ENTER_SCENE'; sceneId: SceneId }
  | {
      type: 'COMPLETE_SCENE'
      sceneId: SceneId
      signal: SceneSignalSubmission
    }
  | { type: 'RETURN_TO_HUB' }
  | { type: 'BEGIN_REVEAL' }
  | { type: 'SKIP_TO_RESULT' }
  | { type: 'SHOW_RESULT' }
  | { type: 'OPEN_SCREENING_ROOM' }
  | { type: 'CLOSE_SCREENING_ROOM' }
  | { type: 'OPEN_DEPARTMENT_ATLAS' }
  | { type: 'CLOSE_DEPARTMENT_ATLAS' }
  | { type: 'OPEN_DEPARTMENT'; departmentId: DepartmentId }
  | { type: 'CLOSE_DEPARTMENT' }
  | { type: 'RESET' }

export const SCENE_IDS = new Set<SceneId>(SCENE_ORDER)
export const OBSERVATION_IDS = new Set<ObservationId>(['detail', 'people', 'place'])
export const CLUE_IDS = new Set<ClueId>([
  'beginner-note',
  'project-record',
  'event-image',
  'schedule-gap',
])
export const DIALOGUE_IDS = new Set<DialogueId>([
  'newcomer',
  'participant',
  'mentor',
])
export const ROUTE_TIME_IDS = new Set<RouteTimeId>(['short', 'weekend', 'flexible'])
export const ROUTE_PARTNER_IDS = new Set<RoutePartnerId>(['peer', 'team', 'solo'])
export const ROUTE_APPROACH_IDS = new Set<RouteApproachId>([
  'try-first',
  'research-first',
  'ask-first',
])
export const EXPRESSION_IDS = new Set<ExpressionId>([
  'map',
  'poster',
  'video',
  'sharing',
])
export const DEPARTMENT_IDS = new Set<DepartmentId>([
  'office',
  'project',
  'competition',
  'training',
  'science',
  'publicity',
  'language',
])

const uniqueValidValues = <T extends string>(
  values: T[],
  validValues: Set<T>,
  minimum: number,
  maximum: number,
) =>
  values.length >= minimum &&
  values.length <= maximum &&
  new Set(values).size === values.length &&
  values.every((value) => validValues.has(value))

export const createEmptySignals = (): JourneySignals => ({
  observation: [],
  clues: [],
  dialogue: null,
  route: { time: null, partner: null, approach: null },
  expression: null,
  expressionTuning: null,
})

export const createInitialJourneyState = (): JourneyState => ({
  version: 3,
  view: 'intro',
  activeSceneId: null,
  completedSceneIds: [],
  signals: createEmptySignals(),
})

export const isSceneComplete = (signals: JourneySignals, sceneId: SceneId) => {
  switch (sceneId) {
    case 'observation':
      return uniqueValidValues(signals.observation, OBSERVATION_IDS, 1, 1)
    case 'clues':
      return uniqueValidValues(signals.clues, CLUE_IDS, 2, 2)
    case 'dialogue':
      return signals.dialogue !== null && DIALOGUE_IDS.has(signals.dialogue)
    case 'map':
      return (
        signals.route.time !== null &&
        ROUTE_TIME_IDS.has(signals.route.time) &&
        signals.route.partner !== null &&
        ROUTE_PARTNER_IDS.has(signals.route.partner) &&
        signals.route.approach !== null &&
        ROUTE_APPROACH_IDS.has(signals.route.approach)
      )
    case 'expression':
      return (
        signals.expression !== null &&
        EXPRESSION_IDS.has(signals.expression) &&
        signals.expressionTuning !== null &&
        Number.isFinite(signals.expressionTuning) &&
        signals.expressionTuning >= 0 &&
        signals.expressionTuning <= 100
      )
  }
}

const updateSignals = (
  signals: JourneySignals,
  sceneId: SceneId,
  submission: SceneSignalSubmission,
): JourneySignals | null => {
  switch (sceneId) {
    case 'observation':
      if (!('observation' in submission)) return null
      if (!uniqueValidValues(submission.observation, OBSERVATION_IDS, 1, 1)) return null
      return { ...signals, observation: [...submission.observation] }
    case 'clues':
      if (!('clues' in submission)) return null
      if (!uniqueValidValues(submission.clues, CLUE_IDS, 2, 2)) return null
      return { ...signals, clues: [...submission.clues] }
    case 'dialogue':
      if (!('dialogue' in submission) || !DIALOGUE_IDS.has(submission.dialogue)) {
        return null
      }
      return { ...signals, dialogue: submission.dialogue }
    case 'map':
      if (!('route' in submission)) return null
      if (
        !ROUTE_TIME_IDS.has(submission.route.time) ||
        !ROUTE_PARTNER_IDS.has(submission.route.partner) ||
        !ROUTE_APPROACH_IDS.has(submission.route.approach)
      ) {
        return null
      }
      return { ...signals, route: { ...submission.route } }
    case 'expression':
      if (
        !('expression' in submission) ||
        !EXPRESSION_IDS.has(submission.expression) ||
        !Number.isFinite(submission.expressionTuning) ||
        submission.expressionTuning < 0 ||
        submission.expressionTuning > 100
      ) {
        return null
      }
      return {
        ...signals,
        expression: submission.expression,
        expressionTuning: submission.expressionTuning,
      }
  }
}

const hasCompletedJourney = (state: JourneyState) =>
  SCENE_ORDER.every((sceneId) =>
    state.completedSceneIds.includes(sceneId) && isSceneComplete(state.signals, sceneId),
  )

export const journeyReducer = (
  state: JourneyState,
  action: JourneyAction,
): JourneyState => {
  switch (action.type) {
    case 'START':
      return state.view === 'intro' ? { ...state, view: 'hub' } : state
    case 'ENTER_SCENE':
      if (state.view !== 'hub' || !SCENE_IDS.has(action.sceneId)) return state
      return { ...state, view: 'scene', activeSceneId: action.sceneId }
    case 'COMPLETE_SCENE': {
      if (
        state.view !== 'scene' ||
        state.activeSceneId !== action.sceneId ||
        !SCENE_IDS.has(action.sceneId)
      ) {
        return state
      }
      const signals = updateSignals(state.signals, action.sceneId, action.signal)
      if (!signals || !isSceneComplete(signals, action.sceneId)) return state
      return {
        ...state,
        view: 'hub',
        activeSceneId: null,
        completedSceneIds: state.completedSceneIds.includes(action.sceneId)
          ? state.completedSceneIds
          : [...state.completedSceneIds, action.sceneId],
        signals,
      }
    }
    case 'RETURN_TO_HUB':
      return state.view === 'scene'
        ? { ...state, view: 'hub', activeSceneId: null }
        : state
    case 'BEGIN_REVEAL':
      return state.view === 'hub' && hasCompletedJourney(state)
        ? { ...state, view: 'reveal' }
        : state
    case 'SKIP_TO_RESULT':
      return state.view === 'intro' ? { ...state, view: 'result' } : state
    case 'SHOW_RESULT':
      return state.view === 'reveal' ? { ...state, view: 'result' } : state
    case 'OPEN_SCREENING_ROOM':
      return state.view === 'result' ? { ...state, view: 'screeningRoom' } : state
    case 'CLOSE_SCREENING_ROOM':
      return state.view === 'screeningRoom' ? { ...state, view: 'result' } : state
    case 'OPEN_DEPARTMENT_ATLAS':
      return state.view === 'result' || state.view === 'screeningRoom'
        ? {
            ...state,
            view: 'departmentAtlas',
            activeSceneId: null,
            selectedDepartmentId: undefined,
            departmentReturnView: undefined,
          }
        : state
    case 'CLOSE_DEPARTMENT_ATLAS':
      return state.view === 'departmentAtlas'
        ? { ...state, view: 'result' }
        : state
    case 'OPEN_DEPARTMENT':
      if (
        (state.view !== 'screeningRoom' &&
          state.view !== 'departmentAtlas' &&
          state.view !== 'departmentArchive') ||
        !DEPARTMENT_IDS.has(action.departmentId)
      ) {
        return state
      }
      return {
        ...state,
        view: 'departmentArchive',
        selectedDepartmentId: action.departmentId,
        departmentReturnView:
          state.view === 'departmentArchive'
            ? state.departmentReturnView
            : state.view,
      }
    case 'CLOSE_DEPARTMENT': {
      if (state.view !== 'departmentArchive') return state
      return {
        ...state,
        selectedDepartmentId: undefined,
        view: state.departmentReturnView ?? 'screeningRoom',
        departmentReturnView: undefined,
      }
    }
    case 'RESET':
      return createInitialJourneyState()
  }
}
