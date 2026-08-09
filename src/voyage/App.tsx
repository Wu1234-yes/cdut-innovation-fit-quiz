import { useEffect, useLayoutEffect, useMemo, useReducer } from 'react'
import { voyageReducer } from './app/voyageReducer'
import { clearVoyageSession, loadVoyageSession, saveVoyageSession } from './app/voyageSession'
import { DepartmentArchive } from './components/DepartmentArchive'
import { DepartmentAtlas } from './components/DepartmentAtlas'
import { MythBreaker } from './components/MythBreaker'
import { SignalAnomaly } from './components/SignalAnomaly'
import { StationShell } from './components/StationShell'
import { VoyageIntro } from './components/VoyageIntro'
import { VoyageReportView } from './components/VoyageReportView'
import { VoyageScreeningRoom } from './components/VoyageScreeningRoom'
import { VoyageHandoff } from './components/VoyageHandoff'
import { departmentArchives } from './content/departmentArchives'
import { projects } from './content/projects'
import { buildVoyageReport } from './result/buildVoyageReport'

export default function App() {
  const [state, dispatch] = useReducer(voyageReducer, undefined, loadVoyageSession)
  const report = useMemo(() => buildVoyageReport(state.answers), [state.answers])

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => { window.history.scrollRestoration = previous }
  }, [])
  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [state.view, state.activeStationId, state.selectedDepartmentId])
  useEffect(() => { document.title = state.view === 'report' ? `${report.title} · 科创夜航` : '科创夜航 · 新生试航' }, [report.title, state.view])
  useEffect(() => { if (state.view === 'intro') clearVoyageSession(); else saveVoyageSession(state) }, [state])

  if (state.view === 'intro') return <VoyageIntro onPeek={() => dispatch({ type: 'PEEK_SCREENING' })} onStart={() => dispatch({ type: 'START' })} />
  if (state.view === 'myths') return <MythBreaker onComplete={() => dispatch({ type: 'COMPLETE_MYTHS' })} />
  if (state.view === 'screening') return <VoyageScreeningRoom onBack={() => dispatch({ type: 'RESET' })} onContinue={() => dispatch({ type: 'COMPLETE_SCREENING' })} projects={projects} />
  if (state.view === 'handoff') return <VoyageHandoff onBegin={() => dispatch({ type: 'BEGIN_STATIONS' })} />
  if (state.view === 'station' && state.activeStationId) return <StationShell answers={state.answers} key={state.activeStationId} onBack={() => dispatch({ type: 'BACK_TO_HANDOFF' })} onComplete={(answer) => dispatch({ type: 'COMPLETE_STATION', answer })} onReport={() => dispatch({ type: 'SHOW_REPORT' })} stationId={state.activeStationId} />
  if (state.view === 'report') return <VoyageReportView onAtlas={() => dispatch({ type: 'OPEN_ATLAS' })} onDepartment={(departmentId) => dispatch({ type: 'OPEN_DEPARTMENT', departmentId })} onEgg={() => dispatch({ type: 'OPEN_EGG' })} onReset={() => dispatch({ type: 'RESET' })} report={report} />
  if (state.view === 'egg') return <SignalAnomaly onBack={() => dispatch({ type: 'CLOSE_EGG' })} />
  if (state.view === 'atlas') return <DepartmentAtlas departments={departmentArchives} onBack={() => dispatch({ type: 'CLOSE_ATLAS' })} onOpenDepartment={(departmentId) => dispatch({ type: 'OPEN_DEPARTMENT', departmentId })} />

  const department = departmentArchives.find(({ id }) => id === state.selectedDepartmentId)
  if (!department) return <main className="voyage-missing-archive"><p>ARCHIVE SIGNAL LOST</p><h1>这份部门档案暂时无法打开</h1><button className="voyage-cta voyage-cta--primary" onClick={() => dispatch({ type: 'OPEN_ATLAS' })} type="button">返回部门图鉴</button></main>
  return <DepartmentArchive department={department} departments={departmentArchives} key={department.id} onBack={() => dispatch({ type: 'CLOSE_DEPARTMENT' })} onBackToAtlas={state.archiveReturnView === 'atlas' ? () => dispatch({ type: 'CLOSE_DEPARTMENT' }) : undefined} onOpenDepartment={(departmentId) => dispatch({ type: 'OPEN_DEPARTMENT', departmentId })} />
}
