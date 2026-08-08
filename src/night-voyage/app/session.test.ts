import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialJourneyState, journeyReducer } from './journeyReducer'
import {
  LEGACY_QUIZ_STORAGE_KEY,
  LEGACY_VOYAGE_STORAGE_KEY,
  VOYAGE_SESSION_STORAGE_KEY,
  clearVoyageSession,
  loadVoyageSession,
  parseVoyageSession,
  saveVoyageSession,
  serializeVoyageSession,
} from './session'

const resultState = journeyReducer(createInitialJourneyState(), {
  type: 'SKIP_TO_RESULT',
})

const persisted = (state: unknown = resultState, version: unknown = 3) =>
  JSON.stringify({ version, state })

describe('parseVoyageSession version 3', () => {
  it('round-trips a valid version 3 state', () => {
    expect(parseVoyageSession(serializeVoyageSession(resultState))).toEqual(
      resultState,
    )
  })

  it('rejects version 2 and malformed payloads', () => {
    expect(parseVoyageSession('{bad json')).toBeNull()
    expect(parseVoyageSession(persisted(resultState, 2))).toBeNull()
    expect(
      parseVoyageSession(JSON.stringify({ version: 3, state: resultState, extra: true })),
    ).toBeNull()
  })

  it('rejects inconsistent scene and completion state', () => {
    expect(
      parseVoyageSession(
        persisted({ ...resultState, view: 'scene', activeSceneId: null }),
      ),
    ).toBeNull()
    expect(
      parseVoyageSession(
        persisted({
          ...resultState,
          completedSceneIds: ['observation', 'observation'],
        }),
      ),
    ).toBeNull()
  })

  it('restores an atlas session without fabricating signals', () => {
    const restored = parseVoyageSession(
      persisted({ ...resultState, view: 'departmentAtlas' }),
    )

    expect(restored?.view).toBe('departmentAtlas')
    expect(restored?.signals).toEqual(resultState.signals)
  })

  it('requires a valid return target for department archives', () => {
    expect(
      parseVoyageSession(
        persisted({
          ...resultState,
          view: 'departmentArchive',
          selectedDepartmentId: 'publicity',
        }),
      ),
    ).toBeNull()
    expect(
      parseVoyageSession(
        persisted({
          ...resultState,
          view: 'departmentArchive',
          selectedDepartmentId: 'publicity',
          departmentReturnView: 'departmentAtlas',
        }),
      )?.departmentReturnView,
    ).toBe('departmentAtlas')
  })
})

describe('voyage session helpers', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('stores the exact version 3 payload under the new key', () => {
    expect(saveVoyageSession(resultState)).toBe(true)
    expect(JSON.parse(sessionStorage.getItem(VOYAGE_SESSION_STORAGE_KEY)!)).toEqual({
      version: 3,
      state: resultState,
    })
  })

  it('removes both legacy keys when loading', () => {
    sessionStorage.setItem(LEGACY_QUIZ_STORAGE_KEY, '{"old":true}')
    sessionStorage.setItem(LEGACY_VOYAGE_STORAGE_KEY, '{"version":2}')

    expect(loadVoyageSession()).toEqual(createInitialJourneyState())
    expect(sessionStorage.getItem(LEGACY_QUIZ_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(LEGACY_VOYAGE_STORAGE_KEY)).toBeNull()
  })

  it('clears invalid current data and returns a clean state', () => {
    sessionStorage.setItem(VOYAGE_SESSION_STORAGE_KEY, persisted(resultState, 2))

    expect(loadVoyageSession()).toEqual(createInitialJourneyState())
    expect(sessionStorage.getItem(VOYAGE_SESSION_STORAGE_KEY)).toBeNull()
  })

  it('does not throw when storage is unavailable or blocked', () => {
    const blockedStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }

    expect(loadVoyageSession(null)).toEqual(createInitialJourneyState())
    expect(saveVoyageSession(resultState, null)).toBe(false)
    expect(clearVoyageSession(null)).toBe(false)
    expect(loadVoyageSession(blockedStorage)).toEqual(createInitialJourneyState())
    expect(saveVoyageSession(resultState, blockedStorage)).toBe(false)
  })
})
