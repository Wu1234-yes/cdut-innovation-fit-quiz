import type { DepartmentId } from '../content/types'

export const STATION_ORDER = [
  'observation',
  'experiment',
  'collaboration',
  'progress',
  'expression',
] as const

export type StationId = (typeof STATION_ORDER)[number]
export type ActionDimension = 'observation' | 'handsOn' | 'collaboration' | 'progress' | 'expression'
export type VoyageView = 'intro' | 'myths' | 'screening' | 'handoff' | 'station' | 'report' | 'atlas' | 'archive' | 'egg'

export interface StationAnswer {
  stationId: StationId
  choiceId: string
  weights: Partial<Record<ActionDimension, number>>
}

export interface VoyageState {
  version: 1
  view: VoyageView
  activeStationId: StationId | null
  completedMythCount: number
  screeningAct: number
  answers: Partial<Record<StationId, StationAnswer>>
  selectedDepartmentId?: DepartmentId
  archiveReturnView?: 'report' | 'atlas'
}

export type VoyageAction =
  | { type: 'START' }
  | { type: 'PEEK_SCREENING' }
  | { type: 'COMPLETE_MYTHS' }
  | { type: 'COMPLETE_SCREENING' }
  | { type: 'BEGIN_STATIONS' }
  | { type: 'COMPLETE_STATION'; answer: StationAnswer }
  | { type: 'REDO_STATION'; stationId: StationId }
  | { type: 'SHOW_REPORT' }
  | { type: 'OPEN_ATLAS' }
  | { type: 'CLOSE_ATLAS' }
  | { type: 'OPEN_DEPARTMENT'; departmentId: DepartmentId }
  | { type: 'CLOSE_DEPARTMENT' }
  | { type: 'OPEN_EGG' }
  | { type: 'CLOSE_EGG' }
  | { type: 'RESET' }

export const createInitialVoyageState = (): VoyageState => ({
  version: 1,
  view: 'intro',
  activeStationId: null,
  completedMythCount: 0,
  screeningAct: 0,
  answers: {},
})

const isStation = (value: string): value is StationId =>
  (STATION_ORDER as readonly string[]).includes(value)

const answerIsForActiveStation = (state: VoyageState, answer: StationAnswer) =>
  state.view === 'station' &&
  state.activeStationId === answer.stationId &&
  isStation(answer.stationId)

export const voyageReducer = (state: VoyageState, action: VoyageAction): VoyageState => {
  switch (action.type) {
    case 'START':
      return state.view === 'intro' ? { ...state, view: 'myths' } : state
    case 'PEEK_SCREENING':
      return state.view === 'intro' ? { ...state, view: 'screening', screeningAct: 0 } : state
    case 'COMPLETE_MYTHS':
      return state.view === 'myths'
        ? { ...state, view: 'screening', completedMythCount: 3 }
        : state
    case 'COMPLETE_SCREENING':
      return state.view === 'screening' ? { ...state, view: 'handoff', screeningAct: 2 } : state
    case 'BEGIN_STATIONS':
      return state.view === 'handoff'
        ? { ...state, view: 'station', activeStationId: STATION_ORDER[0] }
        : state
    case 'COMPLETE_STATION': {
      if (!answerIsForActiveStation(state, action.answer)) return state
      const answerIndex = STATION_ORDER.indexOf(action.answer.stationId)
      const nextStation = STATION_ORDER[answerIndex + 1] ?? null
      const answers = { ...state.answers, [action.answer.stationId]: action.answer }
      return nextStation
        ? { ...state, answers, activeStationId: nextStation }
        : { ...state, answers, view: 'report', activeStationId: null }
    }
    case 'REDO_STATION':
      return state.answers[action.stationId]
        ? { ...state, view: 'station', activeStationId: action.stationId }
        : state
    case 'SHOW_REPORT':
      return Object.keys(state.answers).length > 0
        ? { ...state, view: 'report', activeStationId: null }
        : state
    case 'OPEN_ATLAS':
      return state.view === 'report'
        ? { ...state, view: 'atlas', selectedDepartmentId: undefined, archiveReturnView: undefined }
        : state
    case 'CLOSE_ATLAS':
      return state.view === 'atlas' ? { ...state, view: 'report' } : state
    case 'OPEN_DEPARTMENT':
      if (state.view !== 'report' && state.view !== 'atlas' && state.view !== 'archive') return state
      return {
        ...state,
        view: 'archive',
        selectedDepartmentId: action.departmentId,
        archiveReturnView: state.view === 'archive' ? state.archiveReturnView : state.view,
      }
    case 'CLOSE_DEPARTMENT':
      return state.view === 'archive'
        ? {
            ...state,
            view: state.archiveReturnView ?? 'atlas',
            selectedDepartmentId: undefined,
            archiveReturnView: undefined,
          }
        : state
    case 'OPEN_EGG':
      return state.view === 'report' ? { ...state, view: 'egg' } : state
    case 'CLOSE_EGG':
      return state.view === 'egg' ? { ...state, view: 'report' } : state
    case 'RESET':
      return createInitialVoyageState()
  }
}
