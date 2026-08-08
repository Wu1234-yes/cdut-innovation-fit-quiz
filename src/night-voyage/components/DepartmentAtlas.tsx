import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import type {
  DepartmentArchiveRecord,
  DepartmentId,
} from '../content/types'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { CosmicSceneStage } from './CosmicSceneStage'
import { MediaWithFallback } from './MediaWithFallback'

interface DepartmentAtlasProps {
  departments: DepartmentArchiveRecord[]
  onBack: () => void
  onOpenDepartment: (departmentId: DepartmentId) => void
}

export function DepartmentAtlas({
  departments,
  onBack,
  onOpenDepartment,
}: DepartmentAtlasProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { reducedMotion } = useMotionPreference()
  const department = departments[activeIndex]

  const move = (direction: number) => {
    setActiveIndex(
      (current) => (current + direction + departments.length) % departments.length,
    )
  }

  return (
    <CosmicSceneStage
      as="main"
      className="department-atlas"
      reducedMotion={reducedMotion}
      style={{ '--atlas-accent': department.accent } as CSSProperties}
      visualId="atlas"
    >
      <header className="department-atlas__header">
        <button aria-label="返回行动地图" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <div>
          <p>CYIS / DEPARTMENT ATLAS</p>
          <h1>七部门探索图鉴</h1>
        </div>
        <span>{String(activeIndex + 1).padStart(2, '0')} / {String(departments.length).padStart(2, '0')}</span>
      </header>

      <section className="department-atlas__stage" aria-label="部门总览">
        <nav aria-label="七部门索引" className="department-atlas__index">
          {departments.map((item, index) => (
            <button
              aria-label={`查看${item.name}档案`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? 'is-active' : ''}
              key={item.id}
              onClick={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.name}</strong>
              <i aria-hidden="true" />
            </button>
          ))}
        </nav>

        <article className="department-atlas__feature">
          <div className="department-atlas__media">
            <MediaWithFallback
              archiveCode={`DEPT ${String(activeIndex + 1).padStart(2, '0')}`}
              media={department.hero}
              title={department.name}
            />
            <span aria-hidden="true">{String(activeIndex + 1).padStart(2, '0')}</span>
          </div>
          <div className="department-atlas__copy">
            <p>DEPARTMENT SIGNAL</p>
            <h2>{department.name}</h2>
            <strong>{department.mission}</strong>
            <p>{department.summary}</p>
            <button
              className="voyage-control voyage-control--primary"
              onClick={() => onOpenDepartment(department.id)}
              type="button"
            >
              <FolderOpen aria-hidden="true" size={18} />
              <span>打开{department.name}完整档案</span>
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </article>

        <div className="department-atlas__deck-controls">
          <button aria-label="上一个部门" onClick={() => move(-1)} type="button">
            <ChevronLeft aria-hidden="true" size={22} />
          </button>
          <span aria-hidden="true">
            <i style={{ width: `${((activeIndex + 1) / departments.length) * 100}%` }} />
          </span>
          <button aria-label="下一个部门" onClick={() => move(1)} type="button">
            <ChevronRight aria-hidden="true" size={22} />
          </button>
        </div>
      </section>

      <aside className="department-atlas__join">
        <div>
          <p>RECRUITMENT SIGNAL / 2026</p>
          <h2>先认识，再决定从哪件小事开始</h2>
          <strong>QQ群：723526608</strong>
        </div>
        <img
          alt="青年科技创新服务中心招新QQ群二维码"
          decoding="async"
          src={`${import.meta.env.BASE_URL}recruitment-qq-qr.png`.replace(/\/+/g, '/')}
        />
      </aside>
    </CosmicSceneStage>
  )
}
