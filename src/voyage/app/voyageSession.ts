import { createInitialVoyageState, STATION_ORDER, type VoyageState, type VoyageView } from './voyageReducer'
import type { DepartmentId } from '../content/types'

export const VOYAGE_SESSION_STORAGE_KEY = 'cdut-new-student-voyage-session-v1'

interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
const views = new Set<VoyageView>(['intro', 'myths', 'screening', 'handoff', 'station', 'report', 'atlas', 'archive', 'egg'])
const departments = new Set<DepartmentId>(['office', 'project', 'competition', 'training', 'science', 'publicity', 'language'])

const storageFor = (provided?: StorageLike | null): StorageLike | null => {
  if (provided !== undefined) return provided
  try { return globalThis.sessionStorage ?? null } catch { return null }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const parseState = (value: unknown): VoyageState | null => {
  if (!isRecord(value) || value.version !== 1 || typeof value.view !== 'string' || !views.has(value.view as VoyageView)) return null
  if (!(value.activeStationId === null || (typeof value.activeStationId === 'string' && (STATION_ORDER as readonly string[]).includes(value.activeStationId)))) return null
  if (typeof value.completedMythCount !== 'number' || value.completedMythCount < 0 || value.completedMythCount > 3) return null
  if (typeof value.screeningAct !== 'number' || value.screeningAct < 0 || value.screeningAct > 2) return null
  if (!isRecord(value.answers)) return null
  const state: VoyageState = { version: 1, view: value.view as VoyageView, activeStationId: value.activeStationId as VoyageState['activeStationId'], completedMythCount: value.completedMythCount, screeningAct: value.screeningAct, answers: value.answers as VoyageState['answers'] }
  if (value.selectedDepartmentId !== undefined) {
    if (typeof value.selectedDepartmentId !== 'string' || !departments.has(value.selectedDepartmentId as DepartmentId)) return null
    state.selectedDepartmentId = value.selectedDepartmentId as DepartmentId
  }
  if (value.archiveReturnView !== undefined) {
    if (value.archiveReturnView !== 'report' && value.archiveReturnView !== 'atlas') return null
    state.archiveReturnView = value.archiveReturnView
  }
  return state
}

export const saveVoyageSession = (state: VoyageState, provided?: StorageLike | null) => {
  const target = storageFor(provided)
  if (!target) return false
  try { target.setItem(VOYAGE_SESSION_STORAGE_KEY, JSON.stringify({ version: 1, state })); return true } catch { return false }
}

export const clearVoyageSession = (provided?: StorageLike | null) => {
  const target = storageFor(provided)
  if (!target) return false
  try { target.removeItem(VOYAGE_SESSION_STORAGE_KEY); return true } catch { return false }
}

export const loadVoyageSession = (provided?: StorageLike | null): VoyageState => {
  const target = storageFor(provided)
  if (!target) return createInitialVoyageState()
  try {
    const raw = target.getItem(VOYAGE_SESSION_STORAGE_KEY)
    if (!raw) return createInitialVoyageState()
    const payload: unknown = JSON.parse(raw)
    if (!isRecord(payload) || payload.version !== 1) return createInitialVoyageState()
    return parseState(payload.state) ?? createInitialVoyageState()
  } catch { return createInitialVoyageState() }
}
