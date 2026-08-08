import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { QuizScreen } from '../components/QuizScreen'
import { DepartmentDetails } from '../components/DepartmentDetails'
import type { RadarHeroProps } from '../components/RadarHero'
import {
  ResultScreen,
  type ResultFocusTarget,
  type ResultTriggerSource,
} from '../components/ResultScreen'
import { questions } from '../content/questions'
import { scoreQuiz } from '../scoring/scoreQuiz'
import { appReducer, hasCompleteAnswers } from './appReducer'
import {
  clearInvalidSession,
  clearSession,
  readSession,
  saveSession,
} from './session'

type RadarHeroModule = { default: ComponentType<RadarHeroProps> }
export type RadarHeroLoader = () => Promise<RadarHeroModule>

const loadRadarHero: RadarHeroLoader = () => import('../components/RadarHero')

function WelcomeFallback({ onStart }: { onStart: () => void }) {
  return (
    <main className="app-view welcome-view welcome-view--loading">
      <div className="welcome-content">
        <p className="organization-name">
          成都理工大学青年科技创新服务中心
        </p>
        <h2 className="assessment-name">科创部门适配测评</h2>
        <h1>找到与你同频的部门</h1>
        <p className="welcome-lead">
          用 3 至 4 分钟完成 25 道情境选择，定位更适合你的科创协作方式。
        </p>
        <p className="privacy-note">
          测评匿名进行，答案仅保存在当前标签页，不会上传。
        </p>
        <button className="button button--accent" onClick={onStart} type="button">
          开始扫描
        </button>
        <p className="welcome-loading-status" role="status">
          正在准备扫描界面
        </p>
      </div>
    </main>
  )
}

function WelcomeLoadError({
  onRetry,
  onStart,
}: {
  onRetry: () => void
  onStart: () => void
}) {
  return (
    <main className="app-view welcome-view welcome-view--error">
      <div className="welcome-content">
        <p className="organization-name">
          成都理工大学青年科技创新服务中心
        </p>
        <h2 className="assessment-name">科创部门适配测评</h2>
        <h1>找到与你同频的部门</h1>
        <p className="welcome-load-error" role="alert">
          雷达暂时无法加载，你仍可直接开始测评。
        </p>
        <div className="welcome-error-actions">
          <button className="button button--accent" onClick={onStart} type="button">
            开始扫描
          </button>
          <button className="button button--secondary" onClick={onRetry} type="button">
            重新加载雷达
          </button>
        </div>
      </div>
    </main>
  )
}

class RadarLoadBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function LazyRadarWelcome({
  loader,
  onStart,
}: {
  loader: RadarHeroLoader
  onStart: () => void
}) {
  const [attempt, setAttempt] = useState(() => ({
    component: lazy(loader),
    key: 0,
  }))
  const retry = () => {
    setAttempt((current) => ({
      component: lazy(loader),
      key: current.key + 1,
    }))
  }
  const LazyRadarHero = attempt.component

  return (
    <RadarLoadBoundary
      fallback={<WelcomeLoadError onRetry={retry} onStart={onStart} />}
      key={attempt.key}
    >
      <Suspense fallback={<WelcomeFallback onStart={onStart} />}>
        <LazyRadarHero onStart={onStart} />
      </Suspense>
    </RadarLoadBoundary>
  )
}

function AnalyzingScreen({
  canAnalyze,
  onReset,
}: {
  canAnalyze: boolean
  onReset: () => void
}) {
  return (
    <main className="app-view analyzing-view">
      <div className="status-panel view-transition" role="status" aria-live="polite">
        <p className="status-label">科创坐标扫描</p>
        <h1>{canAnalyze ? '正在生成你的科创画像' : '答案尚未完整'}</h1>
        <p>
          {canAnalyze
            ? '正在汇总四维倾向与部门适配结果，请稍候。'
            : '答案尚未完整，无法生成结果。请重新开始测评。'}
        </p>
        {!canAnalyze && (
          <button className="button button--accent" onClick={onReset} type="button">
            返回首页
          </button>
        )}
      </div>
    </main>
  )
}

function App({ radarHeroLoader = loadRadarHero }: { radarHeroLoader?: RadarHeroLoader }) {
  const [resultFocusTarget, setResultFocusTarget] =
    useState<ResultFocusTarget | null>(null)
  const [state, dispatch] = useReducer(
    appReducer,
    undefined,
    () => readSession(),
  )
  const answersAreComplete = hasCompleteAnswers(state.answers)
  const result = useMemo(() => {
    const canShowScoredView =
      state.view === 'analyzing' ||
      state.view === 'result' ||
      state.view === 'departmentDetails'

    return canShowScoredView && answersAreComplete
      ? scoreQuiz(state.answers)
      : null
  }, [answersAreComplete, state.answers, state.view])

  useEffect(() => {
    clearInvalidSession()
  }, [])

  useEffect(() => {
    if (state.view === 'welcome') {
      clearSession()
      return
    }

    saveSession(state)
  }, [state])

  useEffect(() => {
    if (state.view !== 'analyzing' || result === null) {
      return
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: 'SHOW_RESULT' })
    }, 1_500)

    return () => window.clearTimeout(timer)
  }, [result, state.view])

  const reset = () => {
    setResultFocusTarget(null)
    dispatch({ type: 'RESET' })
  }

  if (state.view === 'welcome') {
    const start = () => dispatch({ type: 'START' })
    return (
      <LazyRadarWelcome loader={radarHeroLoader} onStart={start} />
    )
  }

  if (state.view === 'quiz') {
    const question = questions[state.questionIndex]
    const finishOrAdvance = () => {
      if (state.answers[question.id] === undefined) {
        return
      }

      dispatch({
        type:
          state.questionIndex === questions.length - 1 ? 'FINISH' : 'NEXT',
      })
    }

    return (
      <QuizScreen
        question={question}
        questionIndex={state.questionIndex}
        totalQuestions={questions.length}
        selectedOptionId={state.answers[question.id]}
        onAnswer={(questionId, optionId) =>
          dispatch({ type: 'ANSWER', questionId, optionId })
        }
        onPrevious={() => dispatch({ type: 'PREVIOUS' })}
        onNext={finishOrAdvance}
      />
    )
  }

  if (state.view === 'analyzing') {
    return <AnalyzingScreen canAnalyze={result !== null} onReset={reset} />
  }

  if (state.view === 'departmentDetails') {
    return (
      <DepartmentDetails
        selectedDepartmentId={state.selectedDepartmentId}
        onBack={() => dispatch({ type: 'SHOW_RESULT' })}
        onOpenDepartment={(departmentId) =>
          dispatch({ type: 'OPEN_DEPARTMENT', departmentId })
        }
      />
    )
  }

  if (result === null) {
    return (
      <main className="app-view result-view">
        <div className="result-placeholder view-transition">
          <p className="status-label">结果暂不可用</p>
          <h1>无法生成测评结果</h1>
          <p>答案数据不完整，请重新开始测评。</p>
          <button className="button button--secondary" onClick={reset} type="button">
            重新测评
          </button>
        </div>
      </main>
    )
  }

  return (
    <ResultScreen
      result={result}
      restoreFocusTarget={resultFocusTarget}
      onOpenDepartment={(departmentId, source: ResultTriggerSource) => {
        setResultFocusTarget({ departmentId, source })
        dispatch({ type: 'OPEN_DEPARTMENT', departmentId })
      }}
      onReset={reset}
    />
  )
}

export default App
