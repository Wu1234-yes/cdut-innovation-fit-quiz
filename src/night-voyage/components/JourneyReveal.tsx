import { SkipForward } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'
import type { JourneySignals } from '../content/types'
import { useMotionPreference } from '../hooks/useMotionPreference'

interface JourneyRevealProps {
  signals: JourneySignals
  onComplete: () => void
  reducedMotion?: boolean
}

const nodes = [
  { id: 'observation', label: '留意变化', x: 110, y: 235 },
  { id: 'clues', label: '连接信息', x: 270, y: 92 },
  { id: 'dialogue', label: '发起询问', x: 470, y: 205 },
  { id: 'map', label: '组装行动', x: 650, y: 75 },
  { id: 'expression', label: '发送发现', x: 800, y: 230 },
] as const

export function JourneyReveal({
  signals,
  onComplete,
  reducedMotion: reducedMotionOverride,
}: JourneyRevealProps) {
  const preference = useMotionPreference()
  const reducedMotion = reducedMotionOverride ?? preference.reducedMotion
  const completedRef = useRef(false)
  const signalCount = [
    signals.observation.length > 0,
    signals.clues.length > 0,
    signals.dialogue !== null,
    Object.values(signals.route).every(Boolean),
    signals.expression !== null,
  ].filter(Boolean).length

  const complete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    const timeout = window.setTimeout(complete, reducedMotion ? 500 : 1_100)
    return () => window.clearTimeout(timeout)
  }, [complete, reducedMotion])

  return (
    <main className={`journey-reveal ${reducedMotion ? 'is-reduced' : ''}`}>
      <section className="journey-reveal__stage" aria-labelledby="reveal-title">
        <p className="journey-reveal__eyebrow">
          SIGNAL CONVERGENCE / {String(signalCount).padStart(2, '0')} NODES
        </p>
        <h1 id="reveal-title">五束信号正在连成行动星图</h1>
        <div className="journey-constellation">
          <svg aria-hidden="true" viewBox="0 0 900 320">
            <path
              className="journey-constellation__base"
              d="M110 235 L270 92 L470 205 L650 75 L800 230 L470 205 L110 235"
            />
            <motion.path
              animate={{ opacity: 1, pathLength: 1 }}
              className="journey-constellation__active"
              d="M110 235 L270 92 L470 205 L650 75 L800 230 L470 205 L110 235"
              initial={
                reducedMotion
                  ? { opacity: 1, pathLength: 1 }
                  : { opacity: 0.5, pathLength: 0 }
              }
              transition={{ duration: reducedMotion ? 0 : 0.72, ease: 'easeInOut' }}
            />
          </svg>
          <ol>
            {nodes.map((node, index) => (
              <motion.li
                animate={{ opacity: 1, scale: 1 }}
                data-testid="constellation-node"
                initial={
                  reducedMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.72 }
                }
                key={node.id}
                style={{ left: `${(node.x / 900) * 100}%`, top: `${(node.y / 320) * 100}%` }}
                transition={{ delay: reducedMotion ? 0 : index * 0.09, duration: 0.26 }}
              >
                <span>0{index + 1}</span>
                <strong>{node.label}</strong>
              </motion.li>
            ))}
          </ol>
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="journey-constellation__core"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.72 }}
            transition={{ delay: reducedMotion ? 0 : 0.68, duration: 0.3 }}
          >
            <span>CYIS</span>
            <strong>行动证据已汇聚</strong>
          </motion.div>
        </div>
        <motion.p
          animate={{ opacity: 1 }}
          className="journey-reveal__line"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: reducedMotion ? 0 : 0.72, duration: 0.28 }}
        >
          这不是人格结论，只是你刚才留下的行动证据。
        </motion.p>
      </section>
      <button className="journey-reveal__skip" onClick={complete} type="button">
        <SkipForward aria-hidden="true" size={17} />
        <span>跳过汇聚</span>
      </button>
    </main>
  )
}
