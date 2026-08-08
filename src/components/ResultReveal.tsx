import { useRef, type PointerEvent, type Ref } from 'react'
import { motion } from 'motion/react'
import type { Department } from '../content/types'
import { useAppReducedMotion } from '../hooks/useAppReducedMotion'
import { SignalMascot } from './SignalMascot'

interface ResultRevealProps {
  department: Department
  headingRef: Ref<HTMLHeadingElement>
  profile: string
  score: number
}

const sanitizeScore = (score: number) =>
  Number.isFinite(score) ? Math.round(Math.min(100, Math.max(0, score))) : 0

export function ResultReveal({
  department,
  headingRef,
  profile,
  score,
}: ResultRevealProps) {
  const reducedMotion = useAppReducedMotion()
  const displayScore = sanitizeScore(score)
  const revealRef = useRef<HTMLElement>(null)

  const updateSpotlight = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !revealRef.current) return
    const bounds = revealRef.current.getBoundingClientRect()
    revealRef.current.style.setProperty('--spot-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`)
    revealRef.current.style.setProperty('--spot-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`)
  }

  return (
    <header className="result-reveal" onPointerMove={updateSpotlight} ref={revealRef}>
      <picture className="result-reveal__media">
        <source sizes="100vw" srcSet={department.hero.srcSet} type="image/webp" />
        <img
          alt={department.hero.alt}
          src={department.hero.fallback}
          style={{ objectPosition: department.hero.objectPosition }}
        />
      </picture>
      <div aria-hidden="true" className="result-reveal__shade" />
      <div aria-hidden="true" className="result-reveal__spotlight" />
      <div aria-hidden="true" className="result-reveal__grid" />
      <div aria-hidden="true" className="result-reveal__target">
        <span />
        <span />
      </div>
      <motion.div
        aria-hidden="true"
        animate={{ scaleX: 1 }}
        className="result-lock-line"
        initial={reducedMotion ? false : { scaleX: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.48, ease: 'easeOut' }}
      />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="result-reveal__copy"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.18, duration: 0.46 }}
      >
        <div className="result-reveal__status-row">
          <p className="status-label">科创坐标已锁定</p>
          <span aria-hidden="true" className="result-signal-wave">
            {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
          </span>
        </div>
        <p className="result-reveal__eyebrow">你的科创画像</p>
        <h1 ref={headingRef} tabIndex={-1}>{profile}</h1>
        <div className="result-reveal__match">
          <div>
            <span className="result-reveal__score">{displayScore}</span>
            <span>适配指数</span>
          </div>
          <div>
            <span>{department.name}</span>
            <span>首选部门</span>
          </div>
        </div>
      </motion.div>
      <motion.div
        animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
        className="result-reveal__mascot"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.82 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.72, duration: 0.42 }}
      >
        <SignalMascot variant="cheer" />
        <span>匹配完成</span>
      </motion.div>
    </header>
  )
}
