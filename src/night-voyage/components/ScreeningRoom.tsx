import { ArrowLeft, ChevronLeft, ChevronRight, FolderOpen, LayoutGrid } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import type {
  DepartmentArchiveRecord,
  DepartmentId,
  ProjectRecord,
} from '../content/types'
import { useMotionPreference } from '../hooks/useMotionPreference'
import { CinematicFilmReel } from './CinematicFilmReel'
import { VoyageMascot } from './VoyageMascot'

interface ScreeningRoomProps {
  projects: ProjectRecord[]
  departments: DepartmentArchiveRecord[]
  onOpenAtlas: () => void
  onOpenDepartment: (departmentId: DepartmentId) => void
  onBack: () => void
}

export function ScreeningRoom({
  projects,
  departments,
  onOpenAtlas,
  onOpenDepartment,
  onBack,
}: ScreeningRoomProps) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const { reducedMotion } = useMotionPreference()
  const presentationProjects = useMemo(
    () => [...projects].sort(
      (left, right) => left.screeningPriority - right.screeningPriority,
    ),
    [projects],
  )
  const project = presentationProjects[index]
  const department = departments.find(({ id }) => id === project.departmentId)!

  const moveTo = (nextIndex: number) => {
    setIndex((nextIndex + presentationProjects.length) % presentationProjects.length)
    setExpanded(false)
  }

  return (
    <main className="screening-room">
      <header className="screening-room__header">
        <button aria-label="返回行动地图" onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <div>
          <p>PROJECTOR ARCHIVE / {String(index + 1).padStart(2, '0')}</p>
          <h1>科创放映舱</h1>
        </div>
        <div className="screening-room__header-tools">
          <p>{String(index + 1).padStart(2, '0')} / {String(presentationProjects.length).padStart(2, '0')}</p>
          <button onClick={onOpenAtlas} type="button">
            <LayoutGrid aria-hidden="true" size={17} />
            <span>查看全部部门</span>
          </button>
        </div>
      </header>

      <section className="screening-room__stage">
        <div className="screening-room__projection-side" aria-hidden="true">
          <span>CYIS / PROJECTOR ONLINE</span>
          <i />
          <VoyageMascot decorative state="projector" />
        </div>

        <CinematicFilmReel
          activeIndex={index}
          onActiveChange={moveTo}
          projects={presentationProjects}
          reducedMotion={reducedMotion}
        />

        <motion.article
          animate={{ opacity: 1, y: 0 }}
          className="screening-caption"
          initial={false}
          key={project.id}
        >
          <p>{project.archiveCode}</p>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          {!expanded ? (
            <button
              className="voyage-button voyage-button--quiet voyage-control voyage-control--quiet"
              onClick={() => setExpanded(true)}
              type="button"
            >
              <span>继续看看</span>
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          ) : (
            <div className="screening-caption__disclosure">
              <span>这卷胶片来自</span>
              <strong>{department.name}</strong>
              <p>{department.summary}</p>
              <button
                className="voyage-button voyage-button--primary voyage-control voyage-control--primary"
                onClick={() => onOpenDepartment(department.id)}
                type="button"
              >
                <FolderOpen aria-hidden="true" size={18} />
                <span>打开{department.name}档案</span>
              </button>
            </div>
          )}
        </motion.article>
      </section>

      <nav aria-label="放映胶片导航" className="screening-room__controls">
        <button aria-label="上一卷胶片" onClick={() => moveTo(index - 1)} type="button">
          <ChevronLeft aria-hidden="true" size={22} />
        </button>
        <div aria-hidden="true">
          {presentationProjects.map((item, itemIndex) => (
            <i className={itemIndex === index ? 'is-active' : ''} key={item.id} />
          ))}
        </div>
        <button aria-label="下一卷胶片" onClick={() => moveTo(index + 1)} type="button">
          <ChevronRight aria-hidden="true" size={22} />
        </button>
      </nav>
    </main>
  )
}
