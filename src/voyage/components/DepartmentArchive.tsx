import { ArrowLeft, ArrowRight, QrCode } from 'lucide-react'
import { useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import type {
  DepartmentArchiveRecord,
  DepartmentId,
} from '../content/types'
import { MediaWithFallback } from './MediaWithFallback'

interface DepartmentArchiveProps {
  department: DepartmentArchiveRecord
  departments: DepartmentArchiveRecord[]
  onBack: () => void
  onBackToAtlas?: () => void
  onOpenDepartment: (departmentId: DepartmentId) => void
}

export function DepartmentArchive({
  department,
  departments,
  onBack,
  onBackToAtlas,
  onOpenDepartment,
}: DepartmentArchiveProps) {
  const [activeResponsibility, setActiveResponsibility] = useState(0)
  const [activeWorkflow, setActiveWorkflow] = useState(0)
  const related = department.related
    .map((id) => departments.find((item) => item.id === id))
    .filter((item): item is DepartmentArchiveRecord => Boolean(item))
  const currentIndex = departments.findIndex(({ id }) => id === department.id)
  const archiveNumber = String(currentIndex + 1).padStart(2, '0')
  const previousDepartment = departments[
    (currentIndex - 1 + departments.length) % departments.length
  ]
  const nextDepartment = departments[(currentIndex + 1) % departments.length]

  const activateOnKeyboard = (
    event: KeyboardEvent<HTMLElement>,
    activate: () => void,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    activate()
  }

  return (
    <main
      className="department-archive"
      style={{ '--archive-accent': department.accent } as CSSProperties}
    >
      <header className="department-archive__nav">
        <button
          aria-label={onBackToAtlas ? '返回部门总览' : '返回试航报告'}
          onClick={onBackToAtlas ?? onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          <span>{onBackToAtlas ? '返回部门总览' : '返回试航报告'}</span>
        </button>
        <p>CYIS / DEPARTMENT ARCHIVE</p>
        <span>ARCHIVE {archiveNumber}</span>
      </header>

      <nav aria-label="部门档案翻页" className="department-archive__deck">
        <button
          aria-label="上一个部门"
          onClick={() => onOpenDepartment(previousDepartment.id)}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={18} />
        </button>
        <div>
          <span>ARCHIVE {archiveNumber} / {String(departments.length).padStart(2, '0')}</span>
          <i aria-hidden="true">
            <b style={{ width: `${((currentIndex + 1) / departments.length) * 100}%` }} />
          </i>
        </div>
        <button
          aria-label="下一个部门"
          onClick={() => onOpenDepartment(nextDepartment.id)}
          type="button"
        >
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </nav>

      <section className="department-archive__hero">
        <div className="department-archive__hero-media">
          <MediaWithFallback
            archiveCode={`ARCHIVE ${archiveNumber}`}
            eager
            media={department.hero}
            title={department.name}
          />
          <span aria-hidden="true" />
        </div>
        <div className="department-archive__hero-copy">
          <p>ARCHIVE {archiveNumber} / OPEN FILE</p>
          <h1 tabIndex={-1}>{department.name}</h1>
          <strong>{department.mission}</strong>
          <p>{department.summary}</p>
          <div className="department-archive__hero-signal">
            <div aria-hidden="true" className="department-archive__hero-radar">
              <i />
              <i />
              <i />
              <b>CYIS</b>
            </div>
            <div className="department-archive__hero-status">
              <span>FIELD UNIT ONLINE</span>
              <strong>档案信号已接入</strong>
              <div aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="archive-work" aria-labelledby="archive-work-title">
        <div className="archive-section-index">
          <span>01</span>
          <p>REAL WORK</p>
        </div>
        <div>
          <h2 id="archive-work-title">你会参与的工作</h2>
          <div className="archive-work__track" role="group" aria-label="部门工作轨道">
            {department.responsibilities.map((responsibility, index) => (
              <button
                aria-pressed={activeResponsibility === index}
                className={activeResponsibility === index ? 'is-active' : ''}
                data-testid="responsibility-track-item"
                key={responsibility}
                onClick={() => setActiveResponsibility(index)}
                type="button"
              >
                <span>WORK / {String(index + 1).padStart(2, '0')}</span>
                <strong>{responsibility}</strong>
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="archive-work__focus" aria-live="polite">
            <span>{String(activeResponsibility + 1).padStart(2, '0')}</span>
            <p>{department.responsibilities[activeResponsibility]}</p>
            <i aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="archive-workflow" aria-labelledby="archive-workflow-title">
        <div className="archive-section-index">
          <span>02</span>
          <p>TASK TRACE</p>
        </div>
        <div>
          <h2 id="archive-workflow-title">一项任务如何推进</h2>
          <ol>
            {department.workflow.map((step, index) => (
              <li
                data-active={activeWorkflow === index ? 'true' : 'false'}
                data-testid="workflow-step"
                key={step.title}
                onClick={() => setActiveWorkflow(index)}
                onFocus={() => setActiveWorkflow(index)}
                onKeyDown={(event) =>
                  activateOnKeyboard(event, () => setActiveWorkflow(index))
                }
                role="button"
                tabIndex={0}
              >
                <span>0{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {department.stats.length > 0 ? (
        <section className="archive-outcomes" aria-labelledby="archive-outcomes-title">
          <div className="archive-outcomes__heading">
            <p>FIELD NOTES / VERIFIED</p>
            <h2 id="archive-outcomes-title">这些成果来自真实工作</h2>
          </div>
          <div className="archive-outcomes__list">
            {department.stats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}{stat.suffix}</strong>
                <span>{stat.label}</span>
                <p>{stat.note}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="archive-field-notes" aria-labelledby="archive-field-title">
        <div className="archive-section-index">
          <span>03</span>
          <p>FIELD IMAGES</p>
        </div>
        <div>
          <h2 id="archive-field-title">真实现场，不只是一张合照</h2>
          <div className="archive-field-notes__gallery">
            {department.gallery.map((media, index) => (
              <figure key={media.src}>
                <MediaWithFallback
                  archiveCode={`FIELD ${String(index + 1).padStart(2, '0')}`}
                  media={media}
                  title={department.name}
                />
                <figcaption>{media.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="archive-starter">
        <p>FIRST ACTION / TODAY</p>
        <h2>可以先试这一件小事</h2>
        <strong>{department.starterAction}</strong>
        <div className="archive-starter__gains">
          {department.gains.map((gain) => <span key={gain}>{gain}</span>)}
        </div>
      </section>

      <section className="archive-related" aria-labelledby="archive-related-title">
        <div>
          <p>CONTINUE EXPLORING</p>
          <h2 id="archive-related-title">继续翻阅相邻档案</h2>
        </div>
        <div>
          {related.map((item) => (
            <button
              aria-label={`打开${item.name}档案`}
              key={item.id}
              onClick={() => onOpenDepartment(item.id)}
              type="button"
            >
              <span>{item.name}</span>
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          ))}
        </div>
      </section>

      <footer className="archive-join">
        <div>
          <QrCode aria-hidden="true" size={24} />
          <div>
            <p>想继续了解招新安排，可以打开科创招新交流群。</p>
            <strong>QQ群：723526608</strong>
          </div>
        </div>
        <img
          alt="科创招新交流群二维码"
          loading="lazy"
          src={`${import.meta.env.BASE_URL}recruitment-qq-qr.png`}
        />
      </footer>
    </main>
  )
}
