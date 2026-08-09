import { useEffect, useRef, useState } from 'react'
import type { ProjectRecord } from '../content/types'
import { MediaWithFallback } from './MediaWithFallback'

interface CinematicFilmReelProps {
  projects: ProjectRecord[]
  activeIndex: number
  onActiveChange: (index: number) => void
  reducedMotion?: boolean
}

const normalizeIndex = (index: number, length: number) =>
  (index + length) % length

const thumbnailMedia = (project: ProjectRecord) => ({
  ...project.media,
  src: project.media.src.replace(/-640\.webp$/, '-320.webp'),
  srcSet: undefined,
})

export function CinematicFilmReel({
  projects,
  activeIndex,
  onActiveChange,
  reducedMotion = false,
}: CinematicFilmReelProps) {
  const [paused, setPaused] = useState(false)
  const [displayIndex, setDisplayIndex] = useState(activeIndex)
  const pointerStartRef = useRef<number | null>(null)
  const resumeTimerRef = useRef<number | null>(null)
  const project = projects[displayIndex] ?? projects[activeIndex]
  const railProjects = [...projects, ...projects]

  useEffect(() => {
    if (activeIndex === displayIndex) return
    const target = projects[activeIndex]
    if (!target) return

    let cancelled = false
    const preload = new Image()
    preload.decoding = 'async'
    preload.fetchPriority = 'high'
    preload.sizes = '(max-width: 720px) 100vw, 900px'
    if (target.media.srcSet) preload.srcset = target.media.srcSet

    const promote = async () => {
      try {
        await preload.decode()
      } catch {
        // A completed load is still usable when decode() is unsupported.
      }
      if (!cancelled) setDisplayIndex(activeIndex)
    }

    preload.onload = () => void promote()
    preload.onerror = () => {
      if (!cancelled) setDisplayIndex(activeIndex)
    }
    preload.src = target.media.src
    if (preload.complete && preload.naturalWidth > 0) void promote()

    return () => {
      cancelled = true
      preload.onload = null
      preload.onerror = null
    }
  }, [activeIndex, displayIndex, project.media.src, projects])

  useEffect(() => {
    if (paused || reducedMotion || projects.length < 2) return
    const interval = window.setInterval(() => {
      onActiveChange(normalizeIndex(activeIndex + 1, projects.length))
    }, 3_200)
    return () => window.clearInterval(interval)
  }, [activeIndex, onActiveChange, paused, projects.length, reducedMotion])

  useEffect(() => {
    const pauseForVisibility = () => {
      if (document.hidden) {
        if (resumeTimerRef.current !== null) {
          window.clearTimeout(resumeTimerRef.current)
          resumeTimerRef.current = null
        }
        setPaused(true)
      } else if (pointerStartRef.current === null) {
        resumeTimerRef.current = window.setTimeout(
          () => setPaused(false),
          reducedMotion ? 0 : 900,
        )
      }
    }

    document.addEventListener('visibilitychange', pauseForVisibility)
    return () => {
      document.removeEventListener('visibilitychange', pauseForVisibility)
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current)
      }
    }
  }, [reducedMotion])

  const pauseMovement = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
    setPaused(true)
  }

  const scheduleResume = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current)
    }
    resumeTimerRef.current = window.setTimeout(() => {
      if (pointerStartRef.current === null && !document.hidden) {
        setPaused(false)
      }
      resumeTimerRef.current = null
    }, reducedMotion ? 0 : 900)
  }

  const releasePointer = (clientX: number) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (start !== null && Math.abs(clientX - start) > 48) {
      const direction = clientX < start ? 1 : -1
      onActiveChange(normalizeIndex(activeIndex + direction, projects.length))
    }
    scheduleResume()
  }

  return (
    <div
      className={`cinematic-film-reel ${paused ? 'is-paused' : ''} ${reducedMotion ? 'is-reduced' : ''}`.trim()}
      data-testid="film-reel"
      onPointerDown={(event) => {
        pointerStartRef.current = event.clientX
        pauseMovement()
      }}
      onPointerCancel={() => {
        pointerStartRef.current = null
        scheduleResume()
      }}
      onPointerUp={(event) => releasePointer(event.clientX)}
    >
      <div className="cinematic-film-reel__rail cinematic-film-reel__rail--top" aria-hidden="true">
        <div>
          {railProjects.map((item, index) => (
            <figure key={`${item.id}-top-${index}`}>
              <MediaWithFallback
                archiveCode={item.archiveCode}
                eager={index < 4}
                media={{ ...thumbnailMedia(item), alt: '' }}
                title={item.title}
              />
            </figure>
          ))}
        </div>
      </div>

      <div className="cinematic-film-reel__projection">
        <span className="cinematic-film-reel__beam" aria-hidden="true" />
        <div className="cinematic-film-reel__frame">
          {[0, 1, 2].map((panel) => (
            <div className={`cinematic-film-reel__panel is-${panel + 1}`} data-testid="projection-panel" key={panel}>
              <MediaWithFallback
                archiveCode={project.archiveCode}
                eager
                fetchPriority={panel === 1 ? 'high' : 'auto'}
                media={{ ...project.media, alt: panel === 1 ? project.media.alt : '' }}
                title={project.title}
              />
            </div>
          ))}
          <i aria-hidden="true" />
        </div>
      </div>

      <div className="cinematic-film-reel__rail cinematic-film-reel__rail--bottom" aria-hidden="true">
        <div>
          {railProjects.map((item, index) => (
            <figure key={`${item.id}-bottom-${index}`}>
              <MediaWithFallback
                archiveCode={item.archiveCode}
                media={{ ...thumbnailMedia(item), alt: '' }}
                title={item.title}
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
