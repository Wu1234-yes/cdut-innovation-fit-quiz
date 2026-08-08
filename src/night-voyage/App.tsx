import { ArrowLeft } from 'lucide-react'
import { useEffect, useLayoutEffect, useReducer } from 'react'
import {
  journeyReducer,
  type SceneSignalSubmission,
  type JourneyState,
} from './app/journeyReducer'
import {
  clearVoyageSession,
  loadVoyageSession,
  saveVoyageSession,
} from './app/session'
import { ActionProfile } from './components/ActionProfile'
import { CinematicPlanetIntro } from './components/CinematicPlanetIntro'
import { DepartmentArchive } from './components/DepartmentArchive'
import { DepartmentAtlas } from './components/DepartmentAtlas'
import { JourneyReveal } from './components/JourneyReveal'
import { OpenWorldHub } from './components/OpenWorldHub'
import { SceneDirector } from './components/SceneDirector'
import { ScreeningRoom } from './components/ScreeningRoom'
import { departmentArchives } from './content/departmentArchives'
import { projects } from './content/projects'
import type { SceneId } from './content/types'
import { buildActionProfile } from './result/buildActionProfile'

const hasNoJourneySignals = (state: JourneyState) =>
  state.signals.observation.length === 0 &&
  state.signals.clues.length === 0 &&
  state.signals.dialogue === null &&
  state.signals.route.time === null &&
  state.signals.route.partner === null &&
  state.signals.route.approach === null &&
  state.signals.expression === null &&
  state.signals.expressionTuning === null

export default function App() {
  const [state, dispatch] = useReducer(journeyReducer, undefined, loadVoyageSession)

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  useLayoutEffect(() => {
    window.scrollTo({ behavior: 'auto', left: 0, top: 0 })
  }, [state.activeSceneId, state.selectedDepartmentId, state.view])

  useEffect(() => {
    if (state.view === 'intro') clearVoyageSession()
    else saveVoyageSession(state)
  }, [state])

  if (state.view === 'intro') {
    return (
      <CinematicPlanetIntro
        onExplore={() => dispatch({ type: 'SKIP_TO_RESULT' })}
        onStart={() => dispatch({ type: 'START' })}
      />
    )
  }

  if (state.view === 'hub') {
    return (
      <OpenWorldHub
        completedSceneIds={state.completedSceneIds}
        onBeginReveal={() => dispatch({ type: 'BEGIN_REVEAL' })}
        onEnterScene={(sceneId) => dispatch({ type: 'ENTER_SCENE', sceneId })}
      />
    )
  }

  if (state.view === 'scene' && state.activeSceneId) {
    return (
      <SceneDirector
        activeSceneId={state.activeSceneId}
        onComplete={(sceneId: SceneId, signal: SceneSignalSubmission) =>
          dispatch({ type: 'COMPLETE_SCENE', sceneId, signal })
        }
        onReturn={() => dispatch({ type: 'RETURN_TO_HUB' })}
        signals={state.signals}
      />
    )
  }

  if (state.view === 'reveal') {
    return (
      <JourneyReveal
        onComplete={() => dispatch({ type: 'SHOW_RESULT' })}
        signals={state.signals}
      />
    )
  }

  if (state.view === 'result') {
    const fastPath = hasNoJourneySignals(state)
    return (
      <ActionProfile
        fastPath={fastPath}
        onOpenAtlas={() => dispatch({ type: 'OPEN_DEPARTMENT_ATLAS' })}
        onOpenScreening={() => dispatch({ type: 'OPEN_SCREENING_ROOM' })}
        onRestart={() => dispatch({ type: 'RESET' })}
        profile={buildActionProfile(state.signals)}
      />
    )
  }

  if (state.view === 'screeningRoom') {
    return (
      <ScreeningRoom
        departments={departmentArchives}
        onBack={() => dispatch({ type: 'CLOSE_SCREENING_ROOM' })}
        onOpenAtlas={() => dispatch({ type: 'OPEN_DEPARTMENT_ATLAS' })}
        onOpenDepartment={(departmentId) =>
          dispatch({ type: 'OPEN_DEPARTMENT', departmentId })
        }
        projects={projects}
      />
    )
  }

  if (state.view === 'departmentAtlas') {
    return (
      <DepartmentAtlas
        departments={departmentArchives}
        onBack={() => dispatch({ type: 'CLOSE_DEPARTMENT_ATLAS' })}
        onOpenDepartment={(departmentId) =>
          dispatch({ type: 'OPEN_DEPARTMENT', departmentId })
        }
      />
    )
  }

  const department = departmentArchives.find(
    ({ id }) => id === state.selectedDepartmentId,
  )
  if (!department) {
    return (
      <main className="voyage-missing-archive">
        <p>ARCHIVE SIGNAL LOST</p>
        <h1>这份部门档案暂时无法打开</h1>
        <span>放映舱仍然在线，可以返回继续查看其他真实项目。</span>
        <button
          className="voyage-button voyage-button--primary"
          onClick={() => dispatch({ type: 'CLOSE_DEPARTMENT' })}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          返回科创放映舱
        </button>
      </main>
    )
  }

  return (
    <DepartmentArchive
      department={department}
      departments={departmentArchives}
      key={department.id}
      onBack={() => dispatch({ type: 'CLOSE_DEPARTMENT' })}
      onBackToAtlas={
        state.departmentReturnView === 'departmentAtlas'
          ? () => dispatch({ type: 'CLOSE_DEPARTMENT' })
          : undefined
      }
      onOpenDepartment={(departmentId) =>
        dispatch({ type: 'OPEN_DEPARTMENT', departmentId })
      }
    />
  )
}
