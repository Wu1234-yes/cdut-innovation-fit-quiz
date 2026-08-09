import { describe, expect, it } from 'vitest'
import { createInitialVoyageState, type VoyageState } from './voyageReducer'
import { loadVoyageSession, saveVoyageSession } from './voyageSession'

const storage = () => {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
}

describe('voyageSession', () => {
  it('round-trips a new voyage state under its own storage key', () => {
    const target = storage()
    const state: VoyageState = { ...createInitialVoyageState(), view: 'report', answers: {} }
    expect(saveVoyageSession(state, target)).toBe(true)
    expect(loadVoyageSession(target)).toEqual(state)
  })

  it('falls back to intro for malformed or foreign sessions', () => {
    const target = storage()
    target.setItem('cdut-new-student-voyage-session-v1', '{"version":99}')
    expect(loadVoyageSession(target)).toEqual(createInitialVoyageState())
  })
})
