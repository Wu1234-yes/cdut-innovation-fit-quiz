import { ArrowRight, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { departments as departmentFacts } from '../content/departments'
import type { Department, DepartmentId, DimensionId } from '../content/types'
import type { scoreQuiz } from '../scoring/scoreQuiz'
import { JoinPanel } from './JoinPanel'
import { ProfileRadar } from './ProfileRadar'
import { ResultPoster } from './ResultPoster'
import { ResultReveal } from './ResultReveal'
import { CenterSignalMark, SignalMascot } from './SignalMascot'

type QuizResult = ReturnType<typeof scoreQuiz>

const dimensions: ReadonlyArray<{
  id: DimensionId
  label: string
}> = [
  { id: 'expression', label: '表达转化' },
  { id: 'analysis', label: '分析研究' },
  { id: 'execution', label: '执行推进' },
  { id: 'adaptation', label: '协作应变' },
]

interface ResultScreenProps {
  result: QuizResult
  departments?: ReadonlyArray<Department>
  onOpenDepartment: (
    departmentId: DepartmentId,
    source: ResultTriggerSource,
  ) => void
  onReset: () => void
  restoreFocusTarget?: ResultFocusTarget | null
}

export type ResultTriggerSource = 'primary' | 'alternate' | 'directory'

export interface ResultFocusTarget {
  departmentId: DepartmentId
  source: ResultTriggerSource
}

const contentVariants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.12, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { y: 12 },
  visible: { y: 0, transition: { duration: 0.32 } },
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

const usePrefersReducedMotion = () => {
  const [matches, setMatches] = useState(() =>
    typeof window.matchMedia === 'function'
      ? window.matchMedia(reducedMotionQuery).matches
      : false,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }
    const media = window.matchMedia(reducedMotionQuery)
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }

    media.addListener(handleChange)
    return () => media.removeListener(handleChange)
  }, [])

  return matches
}

const strongestDimension = (result: QuizResult) =>
  dimensions.reduce((strongest, current) =>
    sanitizeScore(result.dimensions[current.id]) >
    sanitizeScore(result.dimensions[strongest.id])
      ? current
      : strongest,
  )

const sanitizeScore = (score: number) =>
  Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0

const uniqueByDepartmentId = <T extends { id: DepartmentId }>(items: ReadonlyArray<T>) => {
  const seen = new Set<DepartmentId>()
  return items.filter(({ id }) => {
    if (seen.has(id)) {
      return false
    }
    seen.add(id)
    return true
  })
}

const departmentCountLabels: Record<number, string> = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
}

const triggerKey = (source: ResultTriggerSource, departmentId: DepartmentId) =>
  `${source}:${departmentId}`

const recommendationReason = (
  department: Department,
  strongestLabel: string,
) =>
  `你的${strongestLabel}倾向最突出；${department.name}围绕${department.keywords
    .slice(0, 2)
    .join('、')}展开，${department.summary}`

const alternateReason = (department: Department) =>
  `${department.keywords.slice(0, 2).join('、')}是该部门的工作关键词；${department.summary}`

export function ResultScreen({
  result,
  departments = departmentFacts,
  onOpenDepartment,
  onReset,
  restoreFocusTarget,
}: ResultScreenProps) {
  const reducedMotion = usePrefersReducedMotion()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const uniqueDepartments = uniqueByDepartmentId(departments)
  const departmentsById = new Map(
    uniqueDepartments.map((department) => [department.id, department]),
  )
  const recommendations = uniqueByDepartmentId(result.ranking)
    .map((ranked) => ({ ranked, department: departmentsById.get(ranked.id) }))
    .filter(
      (
        recommendation,
      ): recommendation is {
        ranked: QuizResult['ranking'][number]
        department: Department
      } => recommendation.department !== undefined,
    )
    .slice(0, 3)
  const strongest = strongestDimension(result)
  const primary = recommendations[0]
  const alternates = recommendations.slice(1, 3)

  useEffect(() => {
    if (restoreFocusTarget) {
      const restoredButton = document.querySelector<HTMLButtonElement>(
        `[data-result-trigger="${triggerKey(
          restoreFocusTarget.source,
          restoreFocusTarget.departmentId,
        )}"]`,
      )
      if (restoredButton) {
        restoredButton.focus()
        return
      }
    }
    headingRef.current?.focus()
  }, [restoreFocusTarget])

  return (
    <main
      className={`app-view result-view${
        reducedMotion ? ' result-view--reduced-motion' : ''
      }`}
    >
      {primary ? (
        <ResultReveal
          department={primary.department}
          headingRef={headingRef}
          profile={result.profile}
          score={primary.ranked.score}
        />
      ) : (
        <header className="result-reveal result-reveal--fallback">
          <div className="result-reveal__copy">
            <p className="status-label">结果暂不可用</p>
            <h1 ref={headingRef} tabIndex={-1}>{result.profile}</h1>
          </div>
        </header>
      )}

      {primary ? (
        <aside className="result-brand-rail" aria-label="青年科技创新服务中心品牌信号">
          <CenterSignalMark />
          <div className="result-brand-rail__copy">
            <span>YOUTH INNOVATION SIGNAL</span>
            <strong>{primary.department.name} / {result.profile}</strong>
          </div>
          <div className="result-brand-rail__readout">
            <span>DIMENSION SYNC</span>
            <strong>{Math.round(sanitizeScore(primary.ranked.score))} / 100</strong>
          </div>
          <div aria-hidden="true" className="result-brand-rail__pulse">
            {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
          </div>
        </aside>
      ) : null}

      <motion.div
        className="result-content"
        initial={reducedMotion ? false : 'hidden'}
        animate={reducedMotion ? undefined : 'visible'}
        transition={reducedMotion ? { duration: 0 } : undefined}
        variants={reducedMotion ? undefined : contentVariants}
      >
        <motion.section
          className="dimension-section"
          aria-labelledby="dimension-title"
          initial={reducedMotion ? false : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          variants={reducedMotion ? undefined : itemVariants}
        >
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">四维倾向</p>
              <h2 id="dimension-title">你的协作坐标</h2>
            </div>
            <p>0-100</p>
          </div>
          <div className="profile-analysis">
            <ProfileRadar scores={result.dimensions} />
            <div className="dimension-list">
              {dimensions.map(({ id, label }) => {
                const score = Math.round(sanitizeScore(result.dimensions[id]))
                return (
                  <div
                    className="dimension-row"
                    aria-label={`${label} ${score} 分`}
                    key={id}
                  >
                    <div className="dimension-row__label">
                      <span>{label}</span>
                      <strong>{score}</strong>
                    </div>
                    <div className="dimension-track" aria-hidden="true">
                      <motion.span
                        initial={reducedMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: score / 100 }}
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : { delay: 0.18, duration: 0.45 }
                        }
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <SignalMascot className="profile-analysis__mascot" variant="research" />
          </div>
        </motion.section>

        {primary && (
          <motion.section
            className="primary-recommendation"
            aria-label="首选部门"
            initial={reducedMotion ? false : undefined}
            transition={reducedMotion ? { duration: 0 } : undefined}
            variants={reducedMotion ? undefined : itemVariants}
          >
            <div className="primary-recommendation__label">
              <p className="section-kicker">首选部门</p>
              <span>{Math.round(sanitizeScore(primary.ranked.score))} 适配指数</span>
            </div>
            <h2 id="primary-department-title">{primary.department.name}</h2>
            <p>
              {recommendationReason(primary.department, strongest.label)}
            </p>
            <div className="primary-responsibilities">
              <h3>你会参与的真实工作</h3>
              <ul>
                {primary.department.responsibilities.slice(0, 3).map((responsibility) => (
                  <li key={responsibility}>{responsibility}</li>
                ))}
              </ul>
            </div>
            <button
              aria-label={`查看首选部门${primary.department.name}详情`}
              className="button button--accent button--with-icon"
              data-result-trigger={triggerKey('primary', primary.department.id)}
              onClick={() => onOpenDepartment(primary.department.id, 'primary')}
              type="button"
            >
              查看{primary.department.name}详情
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </motion.section>
        )}

        {alternates.length > 0 && <motion.section
          className="alternate-section"
          aria-labelledby="alternate-title"
          initial={reducedMotion ? false : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          variants={reducedMotion ? undefined : itemVariants}
        >
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">备选方向</p>
              <h2 id="alternate-title">同样值得了解</h2>
            </div>
          </div>
          <div className="alternate-grid">
            {alternates.map(({ department, ranked }) => (
              <article
                aria-label={`备选部门 ${department.name}`}
                className="alternate-card"
                key={department.id}
              >
                <picture className="alternate-card__media">
                  <source sizes="(min-width: 720px) 42vw, 100vw" srcSet={department.hero.srcSet} type="image/webp" />
                  <img
                    alt={department.hero.alt}
                    loading="lazy"
                    src={department.hero.fallback}
                    style={{ objectPosition: department.hero.objectPosition }}
                  />
                </picture>
                <div className="alternate-card__heading">
                  <h3>{department.name}</h3>
                  <span>{Math.round(sanitizeScore(ranked.score))}</span>
                </div>
                <p>{alternateReason(department)}</p>
                <button
                  aria-label={`查看备选部门${department.name}详情`}
                  className="button button--secondary button--with-icon"
                  data-result-trigger={triggerKey('alternate', department.id)}
                  onClick={() => onOpenDepartment(department.id, 'alternate')}
                  type="button"
                >
                  查看{department.name}详情
                  <ArrowRight aria-hidden="true" size={18} />
                </button>
              </article>
            ))}
          </div>
        </motion.section>}

        {primary ? (
          <motion.div
            initial={reducedMotion ? false : undefined}
            transition={reducedMotion ? { duration: 0 } : undefined}
            variants={reducedMotion ? undefined : itemVariants}
          >
            <ResultPoster
              department={primary.department}
              dimensions={result.dimensions}
              profile={result.profile}
              score={primary.ranked.score}
            />
          </motion.div>
        ) : null}

        {primary ? <motion.section
          className="department-directory"
          aria-labelledby="department-directory-title"
          initial={reducedMotion ? false : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          variants={reducedMotion ? undefined : itemVariants}
        >
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">全部部门</p>
              <h2 id="department-directory-title">
                继续查看{departmentCountLabels[uniqueDepartments.length] ?? uniqueDepartments.length}个部门
              </h2>
            </div>
          </div>
          <div className="department-directory__list">
            {uniqueDepartments.map((department) => (
              <button
                aria-label={`查看${department.name}详情`}
                className="department-directory__button"
                data-result-trigger={triggerKey('directory', department.id)}
                key={department.id}
                onClick={() => onOpenDepartment(department.id, 'directory')}
                type="button"
              >
                <span>{department.name}</span>
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            ))}
          </div>
        </motion.section> : null}

        {primary ? <motion.div
          initial={reducedMotion ? false : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          variants={reducedMotion ? undefined : itemVariants}
        >
          <JoinPanel />
        </motion.div> : null}

        {primary ? <motion.footer
          className="result-footer"
          initial={reducedMotion ? false : undefined}
          transition={reducedMotion ? { duration: 0 } : undefined}
          variants={reducedMotion ? undefined : itemVariants}
        >
          <p>
            适配指数仅表示本测评内的相对匹配，不代表能力或录取概率。
          </p>
          <button
            className="button button--secondary button--with-icon"
            onClick={onReset}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={18} />
            重新测评
          </button>
        </motion.footer> : (
          <section className="result-unavailable" role="alert">
            <h2>暂时没有可用的部门推荐</h2>
            <p>结果数据不完整，请重新测评。</p>
            <button
              className="button button--secondary button--with-icon"
              onClick={onReset}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={18} />
              重新测评
            </button>
          </section>
        )}
      </motion.div>
    </main>
  )
}
