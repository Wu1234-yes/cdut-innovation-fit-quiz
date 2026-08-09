import { describe, expect, it } from 'vitest'
import {
  createInitialVoyageState,
  voyageReducer,
  type VoyageState,
  type StationAnswer,
} from './voyageReducer'

const answers: Record<string, StationAnswer> = {
  observation: { stationId: 'observation', choiceId: 'pattern', weights: { observation: 3, progress: 1 } },
  experiment: { stationId: 'experiment', choiceId: 'prototype', weights: { handsOn: 3, observation: 1 } },
  collaboration: { stationId: 'collaboration', choiceId: 'clarify', weights: { collaboration: 3, expression: 1 } },
  progress: { stationId: 'progress', choiceId: 'milestone', weights: { progress: 3, collaboration: 1 } },
  expression: { stationId: 'expression', choiceId: 'story', weights: { expression: 3, observation: 1 } },
}

describe('voyageReducer', () => {
  it('moves through the guided prelude into the first station', () => {
    let state = createInitialVoyageState()
    state = voyageReducer(state, { type: 'START' })
    expect(state.view).toBe('myths')

    state = voyageReducer(state, { type: 'COMPLETE_MYTHS' })
    expect(state.view).toBe('screening')

    state = voyageReducer(state, { type: 'COMPLETE_SCREENING' })
    expect(state.view).toBe('handoff')

    state = voyageReducer(state, { type: 'BEGIN_STATIONS' })
    expect(state.view).toBe('station')
    expect(state.activeStationId).toBe('observation')
  })

  it('stores station answers and advances in a fixed order', () => {
    let state: VoyageState = { ...createInitialVoyageState(), view: 'station', activeStationId: 'observation' }
    state = voyageReducer(state, { type: 'COMPLETE_STATION', answer: answers.observation })
    expect(state.activeStationId).toBe('experiment')
    expect(state.answers.observation).toEqual(answers.observation)

    state = voyageReducer(state, { type: 'COMPLETE_STATION', answer: answers.experiment })
    state = voyageReducer(state, { type: 'COMPLETE_STATION', answer: answers.collaboration })
    state = voyageReducer(state, { type: 'COMPLETE_STATION', answer: answers.progress })
    state = voyageReducer(state, { type: 'COMPLETE_STATION', answer: answers.expression })
    expect(state.view).toBe('report')
    expect(state.activeStationId).toBeNull()
  })

  it('can redo a completed station without discarding other answers', () => {
    const initial: VoyageState = {
      ...createInitialVoyageState(),
      view: 'report' as const,
      answers: { observation: answers.observation, experiment: answers.experiment },
    }
    const state = voyageReducer(initial, { type: 'REDO_STATION', stationId: 'observation' })
    expect(state.view).toBe('station')
    expect(state.activeStationId).toBe('observation')
    expect(state.answers.experiment).toEqual(answers.experiment)
  })

  it('allows an early report after at least one station', () => {
    const initial: VoyageState = {
      ...createInitialVoyageState(),
      view: 'station' as const,
      activeStationId: 'experiment' as const,
      answers: { observation: answers.observation },
    }
    expect(voyageReducer(initial, { type: 'SHOW_REPORT' }).view).toBe('report')
    expect(voyageReducer(createInitialVoyageState(), { type: 'SHOW_REPORT' }).view).toBe('intro')
  })

  it('returns from an archive to the atlas and can reset', () => {
    let state: VoyageState = { ...createInitialVoyageState(), view: 'report', answers: { observation: answers.observation } }
    state = voyageReducer(state, { type: 'OPEN_ATLAS' })
    state = voyageReducer(state, { type: 'OPEN_DEPARTMENT', departmentId: 'publicity' })
    expect(state.view).toBe('archive')
    expect(state.selectedDepartmentId).toBe('publicity')

    state = voyageReducer(state, { type: 'CLOSE_DEPARTMENT' })
    expect(state.view).toBe('atlas')
    expect(voyageReducer(state, { type: 'RESET' })).toEqual(createInitialVoyageState())
  })

  it('returns from the department atlas to the generated report', () => {
    let state: VoyageState = {
      ...createInitialVoyageState(),
      view: 'report',
      answers: { observation: answers.observation },
    }
    state = voyageReducer(state, { type: 'OPEN_ATLAS' })

    state = voyageReducer(state, { type: 'CLOSE_ATLAS' })

    expect(state.view).toBe('report')
    expect(state.answers.observation).toEqual(answers.observation)
  })

  it('switches between department archives without losing the original return path', () => {
    let state: VoyageState = {
      ...createInitialVoyageState(),
      view: 'atlas',
      answers: { observation: answers.observation },
    }

    state = voyageReducer(state, { type: 'OPEN_DEPARTMENT', departmentId: 'publicity' })
    state = voyageReducer(state, { type: 'OPEN_DEPARTMENT', departmentId: 'language' })

    expect(state.view).toBe('archive')
    expect(state.selectedDepartmentId).toBe('language')
    expect(state.archiveReturnView).toBe('atlas')
  })
})
