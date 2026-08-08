import { describe, expect, it } from 'vitest'
import {
  SCENE_ORDER,
  createInitialJourneyState,
  journeyReducer,
  type JourneyState,
} from './journeyReducer'

const start = () => journeyReducer(createInitialJourneyState(), { type: 'START' })

const completeScene = (
  state: JourneyState,
  sceneId: (typeof SCENE_ORDER)[number],
): JourneyState => {
  const entered = journeyReducer(state, { type: 'ENTER_SCENE', sceneId })

  switch (sceneId) {
    case 'observation':
      return journeyReducer(entered, {
        type: 'COMPLETE_SCENE',
        sceneId,
        signal: { observation: ['detail'] },
      })
    case 'clues':
      return journeyReducer(entered, {
        type: 'COMPLETE_SCENE',
        sceneId,
        signal: { clues: ['beginner-note', 'project-record'] },
      })
    case 'dialogue':
      return journeyReducer(entered, {
        type: 'COMPLETE_SCENE',
        sceneId,
        signal: { dialogue: 'participant' },
      })
    case 'map':
      return journeyReducer(entered, {
        type: 'COMPLETE_SCENE',
        sceneId,
        signal: {
          route: { time: 'short', partner: 'peer', approach: 'try-first' },
        },
      })
    case 'expression':
      return journeyReducer(entered, {
        type: 'COMPLETE_SCENE',
        sceneId,
        signal: { expression: 'poster', expressionTuning: 64 },
      })
  }
}

describe('journeyReducer version 3 hub flow', () => {
  it('starts at the open-world hub', () => {
    const initial = createInitialJourneyState()
    const started = start()

    expect(initial).toMatchObject({
      version: 3,
      view: 'intro',
      activeSceneId: null,
      completedSceneIds: [],
    })
    expect(started).toMatchObject({ view: 'hub', activeSceneId: null })
    expect(journeyReducer(started, { type: 'START' })).toBe(started)
  })

  it('enters any scene from the hub and returns after completion', () => {
    const entered = journeyReducer(start(), {
      type: 'ENTER_SCENE',
      sceneId: 'dialogue',
    })
    const completed = journeyReducer(entered, {
      type: 'COMPLETE_SCENE',
      sceneId: 'dialogue',
      signal: { dialogue: 'mentor' },
    })

    expect(entered).toMatchObject({ view: 'scene', activeSceneId: 'dialogue' })
    expect(completed).toMatchObject({
      view: 'hub',
      activeSceneId: null,
      completedSceneIds: ['dialogue'],
    })
    expect(completed.signals.dialogue).toBe('mentor')
  })

  it('rejects completion for a scene that is not active', () => {
    const entered = journeyReducer(start(), {
      type: 'ENTER_SCENE',
      sceneId: 'observation',
    })

    expect(
      journeyReducer(entered, {
        type: 'COMPLETE_SCENE',
        sceneId: 'dialogue',
        signal: { dialogue: 'mentor' },
      }),
    ).toBe(entered)
  })

  it('preserves prior signals when a completed scene is revisited', () => {
    const first = completeScene(start(), 'observation')
    const second = completeScene(first, 'clues')
    const revisited = journeyReducer(second, {
      type: 'ENTER_SCENE',
      sceneId: 'observation',
    })
    const updated = journeyReducer(revisited, {
      type: 'COMPLETE_SCENE',
      sceneId: 'observation',
      signal: { observation: ['people'] },
    })

    expect(updated.completedSceneIds).toEqual(['observation', 'clues'])
    expect(updated.signals.observation).toEqual(['people'])
    expect(updated.signals.clues).toEqual(['beginner-note', 'project-record'])
  })

  it('allows reveal only after all five scenes are complete', () => {
    const incomplete = completeScene(start(), 'observation')
    expect(journeyReducer(incomplete, { type: 'BEGIN_REVEAL' })).toBe(incomplete)

    const complete = SCENE_ORDER.reduce(completeScene, start())
    const reveal = journeyReducer(complete, { type: 'BEGIN_REVEAL' })
    const result = journeyReducer(reveal, { type: 'SHOW_RESULT' })

    expect(reveal.view).toBe('reveal')
    expect(result.view).toBe('result')
  })

  it('returns from a scene without deleting completed evidence', () => {
    const completed = completeScene(start(), 'observation')
    const entered = journeyReducer(completed, {
      type: 'ENTER_SCENE',
      sceneId: 'clues',
    })
    const returned = journeyReducer(entered, { type: 'RETURN_TO_HUB' })

    expect(returned).toMatchObject({ view: 'hub', activeSceneId: null })
    expect(returned.signals.observation).toEqual(['detail'])
  })

  it('keeps the generic fast path separate from personal evidence', () => {
    const result = journeyReducer(createInitialJourneyState(), {
      type: 'SKIP_TO_RESULT',
    })

    expect(result.view).toBe('result')
    expect(result.completedSceneIds).toEqual([])
    expect(result.signals.observation).toEqual([])
  })

  it('opens screening and valid department archives from result', () => {
    const result = journeyReducer(createInitialJourneyState(), {
      type: 'SKIP_TO_RESULT',
    })
    const screening = journeyReducer(result, { type: 'OPEN_SCREENING_ROOM' })
    const archive = journeyReducer(screening, {
      type: 'OPEN_DEPARTMENT',
      departmentId: 'publicity',
    })
    const returned = journeyReducer(archive, { type: 'CLOSE_DEPARTMENT' })

    expect(screening.view).toBe('screeningRoom')
    expect(archive).toMatchObject({
      view: 'departmentArchive',
      selectedDepartmentId: 'publicity',
    })
    expect(returned.view).toBe('screeningRoom')
    expect(returned.selectedDepartmentId).toBeUndefined()
  })

  it('opens and closes the department atlas without selecting a department', () => {
    const result = journeyReducer(createInitialJourneyState(), {
      type: 'SKIP_TO_RESULT',
    })
    const atlas = journeyReducer(result, { type: 'OPEN_DEPARTMENT_ATLAS' })
    const returned = journeyReducer(atlas, { type: 'CLOSE_DEPARTMENT_ATLAS' })

    expect(atlas).toMatchObject({
      view: 'departmentAtlas',
      selectedDepartmentId: undefined,
    })
    expect(returned.view).toBe('result')
  })

  it('returns a department archive to the view that opened it', () => {
    const result = journeyReducer(createInitialJourneyState(), {
      type: 'SKIP_TO_RESULT',
    })
    const screening = journeyReducer(result, { type: 'OPEN_SCREENING_ROOM' })
    const screeningArchive = journeyReducer(screening, {
      type: 'OPEN_DEPARTMENT',
      departmentId: 'science',
    })
    const atlas = journeyReducer(result, { type: 'OPEN_DEPARTMENT_ATLAS' })
    const atlasArchive = journeyReducer(atlas, {
      type: 'OPEN_DEPARTMENT',
      departmentId: 'project',
    })

    expect(screeningArchive.departmentReturnView).toBe('screeningRoom')
    expect(
      journeyReducer(screeningArchive, { type: 'CLOSE_DEPARTMENT' }).view,
    ).toBe('screeningRoom')
    expect(atlasArchive.departmentReturnView).toBe('departmentAtlas')
    expect(journeyReducer(atlasArchive, { type: 'CLOSE_DEPARTMENT' }).view).toBe(
      'departmentAtlas',
    )
  })
})
