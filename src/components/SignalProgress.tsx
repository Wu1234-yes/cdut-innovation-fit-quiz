import { motion } from 'motion/react'
import { quizStages, quizStageForQuestion } from '../content/quizStages'
import { useAppReducedMotion } from '../hooks/useAppReducedMotion'

interface SignalProgressProps {
  questionIndex: number
  totalQuestions: number
}

export function SignalProgress({
  questionIndex,
  totalQuestions,
}: SignalProgressProps) {
  const reducedMotion = useAppReducedMotion()
  const currentStage = quizStageForQuestion(questionIndex)
  const progress = Math.min(1, (questionIndex + 1) / totalQuestions)

  return (
    <aside className="signal-progress" data-testid="signal-progress">
      <div className="signal-progress__heading">
        <p>FIT SIGNAL</p>
        <div className="signal-progress__counter">
          <strong>{String(questionIndex + 1).padStart(2, '0')}</strong>
          <p aria-live="polite" className="signal-progress__count">
            {questionIndex + 1} / {totalQuestions}
          </p>
        </div>
      </div>

      <div className="signal-progress__meter" aria-hidden="true">
        <motion.span
          animate={{ scaleX: progress }}
          initial={false}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.28 }}
        />
      </div>

      <ol aria-label="测评阶段" className="signal-progress__stages">
        {quizStages.map((stage, index) => {
          const isCurrent = stage.id === currentStage.id
          const isComplete = questionIndex > stage.range[1]
          return (
            <li
              aria-current={isCurrent ? 'step' : undefined}
              className={isComplete ? 'is-complete' : undefined}
              key={stage.id}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{stage.label}</strong>
                <small>{stage.signal}</small>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="signal-progress__privacy">LOCAL SESSION / NO UPLOAD</p>
    </aside>
  )
}
