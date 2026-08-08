import { motion } from 'motion/react'
import { useAppReducedMotion } from '../hooks/useAppReducedMotion'

interface AnswerOptionProps {
  checked: boolean
  groupName: string
  optionId: string
  label: string
  onSelect: () => void
}

export function AnswerOption({
  checked,
  groupName,
  optionId,
  label,
  onSelect,
}: AnswerOptionProps) {
  const reducedMotion = useAppReducedMotion()

  return (
    <motion.label
      animate={reducedMotion ? undefined : checked ? { scale: [1, 0.985, 1] } : { scale: 1 }}
      className="quiz-option"
      transition={{ duration: 0.22 }}
      whileHover={reducedMotion ? undefined : { x: 4 }}
    >
      <input
        checked={checked}
        name={groupName}
        onChange={onSelect}
        type="radio"
        value={optionId}
      />
      <span className="quiz-option__marker" aria-hidden="true" />
      <span className="quiz-option__label">{label}</span>
      <motion.span
        animate={{ scaleX: checked ? 1 : 0 }}
        aria-hidden="true"
        className="quiz-option__signal"
        initial={false}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.24 }}
      />
    </motion.label>
  )
}
