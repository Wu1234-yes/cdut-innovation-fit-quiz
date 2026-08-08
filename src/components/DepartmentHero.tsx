import { ArrowLeft } from 'lucide-react'
import { useRef, useState, type PointerEvent, type Ref } from 'react'
import type { Department } from '../content/types'
import { SignalMascot, type MascotVariant } from './SignalMascot'

interface DepartmentHeroProps {
  department: Department
  headingRef: Ref<HTMLHeadingElement>
  onBack: () => void
}

const mascotByDepartment: Record<Department['id'], MascotVariant> = {
  office: 'focus',
  project: 'launch',
  competition: 'cheer',
  training: 'cheer',
  science: 'research',
  publicity: 'launch',
  language: 'cheer',
}

export function DepartmentHero({ department, headingRef, onBack }: DepartmentHeroProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  const updateSpotlight = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !heroRef.current) return
    const bounds = heroRef.current.getBoundingClientRect()
    heroRef.current.style.setProperty('--spot-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`)
    heroRef.current.style.setProperty('--spot-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`)
  }

  return (
    <header
      className="department-hero"
      data-image-state={imageFailed ? 'failed' : 'ready'}
      data-testid="department-hero"
      onPointerMove={updateSpotlight}
      ref={heroRef}
    >
      {!imageFailed ? (
        <picture className="department-hero__media">
          <source sizes="100vw" srcSet={department.hero.srcSet} type="image/webp" />
          <img
            alt={department.hero.alt}
            onError={() => setImageFailed(true)}
            src={department.hero.fallback}
            style={{ objectPosition: department.hero.objectPosition }}
          />
        </picture>
      ) : null}
      <div aria-hidden="true" className="department-hero__shade" />
      <div aria-hidden="true" className="department-hero__spotlight" />
      <div aria-hidden="true" className="department-hero__scanline" />
      <div aria-hidden="true" className="department-hero__hud">
        <span>FIELD ARCHIVE / {department.id.toUpperCase()}</span>
        <span>LIVE SIGNAL</span>
      </div>
      <button
        className="button button--secondary button--with-icon department-back"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft aria-hidden="true" size={18} />
        返回结果
      </button>
      <div className="department-hero__copy">
        <p className="section-kicker">部门现场档案</p>
        <h1 ref={headingRef} tabIndex={-1}>{department.name}</h1>
        <p className="department-hero__mission">{department.mission}</p>
        <p>{department.summary}</p>
        {department.stats.length > 0 ? (
          <dl className="department-hero__stats">
            {department.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}{stat.suffix}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="department-hero__no-stats">本页仅展示已核实的职责、流程与现场记录。</p>
        )}
      </div>
      <div className="department-hero__mascot" aria-label="部门信号 IP">
        <SignalMascot variant={mascotByDepartment[department.id]} />
        <span>{department.keywords.slice(0, 2).join(' / ')}</span>
      </div>
    </header>
  )
}
