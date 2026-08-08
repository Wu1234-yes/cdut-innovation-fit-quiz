import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, type CSSProperties } from 'react'
import { departments as departmentFacts } from '../content/departments'
import type { Department, DepartmentId } from '../content/types'
import { DepartmentHero } from './DepartmentHero'
import { EvidenceGallery } from './EvidenceGallery'
import { JoinPanel } from './JoinPanel'
import { WorkflowTimeline } from './WorkflowTimeline'
import { CenterSignalMark } from './SignalMascot'

interface DepartmentDetailsProps {
  selectedDepartmentId?: string
  departments?: ReadonlyArray<Department>
  onBack: () => void
  onOpenDepartment?: (departmentId: DepartmentId) => void
}

export function DepartmentDetails({
  selectedDepartmentId,
  departments = departmentFacts,
  onBack,
  onOpenDepartment,
}: DepartmentDetailsProps) {
  const selected = departments.find(({ id }) => id === selectedDepartmentId)
  const department = selected ?? departments[0]
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [department?.id])

  if (!department) {
    return (
      <main className="app-view department-details-view">
        <div className="department-details-shell">
          <button
            className="button button--secondary button--with-icon"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            返回结果
          </button>
          <div role="alert">
            <h1 ref={headingRef} tabIndex={-1}>部门信息暂不可用</h1>
            <p>请返回结果页重新选择部门。</p>
          </div>
        </div>
      </main>
    )
  }

  const relatedDepartments = department.related
    .map((departmentId) => departments.find(({ id }) => id === departmentId))
    .filter((related): related is Department => related !== undefined)

  return (
    <main
      className="department-details-view"
      style={{ '--department-accent': department.accent } as CSSProperties}
    >
      <article className="department-details-shell view-transition">
        {!selected && (
          <p className="department-fallback" role="status">
            所选部门信息不可用，已显示默认部门。
          </p>
        )}

        <DepartmentHero department={department} headingRef={headingRef} onBack={onBack} />

        <div className="department-brand-rail">
          <CenterSignalMark />
          <p><span>中心现场坐标</span>{department.mission}</p>
          <div className="department-brand-rail__readout">
            <span>FIELD / {department.id.toUpperCase()}</span>
            <strong>{department.keywords.slice(0, 2).join(' / ')}</strong>
            <div aria-hidden="true" className="department-brand-rail__meter">
              {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
            </div>
          </div>
          <div aria-hidden="true" className="department-brand-rail__signal">
            {Array.from({ length: 14 }, (_, index) => <i key={index} />)}
          </div>
        </div>

        <nav className="department-signal-nav" aria-label={`${department.name}页面目录`}>
          <span>ARCHIVE INDEX</span>
          <a href="#department-work">工作</a>
          <a href="#department-workflow">流程</a>
          <a href="#department-field">现场</a>
          <a href="#department-growth">成长</a>
        </nav>

        <div className="department-details-content">
          <section className="department-section department-responsibilities" data-section="01" id="department-work" aria-labelledby="responsibilities-title">
            <p className="section-kicker">WHAT YOU WILL DO</p>
            <h2 id="responsibilities-title">你会参与的工作</h2>
            <ul>
              {department.responsibilities.map((responsibility, index) => (
                <li key={responsibility}>
                  <div className="responsibility-card__meta">
                    <span>NODE / {String(index + 1).padStart(2, '0')}</span>
                    <span aria-hidden="true" className="responsibility-card__signal" />
                  </div>
                  <p>{responsibility}</p>
                  <span aria-hidden="true" className="responsibility-card__track" />
                </li>
              ))}
            </ul>
          </section>

          <section className="department-section" data-section="02" id="department-workflow" aria-labelledby="workflow-title">
            <p className="section-kicker">WORKFLOW</p>
            <h2 id="workflow-title">一项任务如何推进</h2>
            <WorkflowTimeline steps={[...department.workflow]} />
          </section>

          <section className="department-section" data-section="03" id="department-field" aria-labelledby="evidence-title">
            <p className="section-kicker">FIELD NOTES</p>
            <h2 id="evidence-title">真实工作现场</h2>
            <EvidenceGallery images={[...department.gallery]} />
          </section>

          {department.stats.length > 0 ? (
            <section className="department-section" data-section="04" aria-labelledby="outcomes-title">
              <p className="section-kicker">VERIFIED OUTCOMES</p>
              <h2 id="outcomes-title">已经留下的记录</h2>
              <dl className="department-outcomes">
                {department.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}{stat.suffix}</dd>
                    <p>{stat.note}</p>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="department-section department-gains" data-section="05" id="department-growth" aria-labelledby="gains-title">
            <p className="section-kicker">WHAT YOU GAIN</p>
            <h2 id="gains-title">你会带走的能力</h2>
            <ol>
              {department.gains.map((gain, index) => (
                <li key={gain}><span>{String(index + 1).padStart(2, '0')}</span>{gain}</li>
              ))}
            </ol>
          </section>

          <section className="department-section department-fit" data-section="06" aria-labelledby="fit-title">
            <div>
              <p className="section-kicker">FIT SIGNAL</p>
              <h2 id="fit-title">什么样的你会在这里发光</h2>
              <p>{department.fitNarrative}</p>
            </div>
            <ul className="keyword-list">
              {department.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
            </ul>
          </section>

          <section className="department-section department-related" data-section="07" aria-labelledby="related-title">
            <p className="section-kicker">KEEP EXPLORING</p>
            <h2 id="related-title">继续了解关联部门</h2>
            <div>
              {relatedDepartments.map((related) => (
                <button
                  aria-label={`查看${related.name}详情`}
                  className="department-related__button"
                  key={related.id}
                  onClick={() => onOpenDepartment?.(related.id)}
                  type="button"
                >
                  <span><strong>{related.name}</strong>{related.mission}</span>
                  <ArrowRight aria-hidden="true" size={20} />
                </button>
              ))}
            </div>
          </section>

          <JoinPanel />

          <button className="button button--secondary button--with-icon department-bottom-back" onClick={onBack} type="button">
            <ArrowLeft aria-hidden="true" size={18} />
            返回测评结果
          </button>
        </div>
      </article>
    </main>
  )
}
