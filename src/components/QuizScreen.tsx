import { ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { quizStageForQuestion } from '../content/quizStages'
import type { Question } from '../content/types'
import { useAppReducedMotion } from '../hooks/useAppReducedMotion'
import { AnswerOption } from './AnswerOption'
import { SignalProgress } from './SignalProgress'
import { SignalMascot } from './SignalMascot'

interface QuizScreenProps {
  question: Question
  questionIndex: number
  totalQuestions: number
  selectedOptionId?: string
  onAnswer: (questionId: string, optionId: string) => void
  onPrevious: () => void
  onNext: () => void
}

export function QuizScreen({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onAnswer,
  onPrevious,
  onNext,
}: QuizScreenProps) {
  const questionHeadingRef = useRef<HTMLLegendElement>(null)
  const reducedMotion = useAppReducedMotion()
  const isFirstQuestion = questionIndex === 0
  const isLastQuestion = questionIndex === totalQuestions - 1
  const hasAnswer = selectedOptionId !== undefined
  const stage = quizStageForQuestion(questionIndex)

  useEffect(() => {
    questionHeadingRef.current?.focus()
  }, [questionIndex])

  return (
    <main className="app-view quiz-view">
      <header className="quiz-topbar">
        <p>成都理工大学青年科技创新服务中心</p>
        <span>{stage.label}阶段</span>
      </header>

      <div className="quiz-layout">
        <SignalProgress
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
        />

        <motion.form
          animate={{ opacity: 1, x: 0 }}
          className="quiz-form"
          initial={reducedMotion ? false : { opacity: 0, x: 18 }}
          key={question.id}
          onSubmit={(event) => event.preventDefault()}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.32 }}
        >
          <div aria-hidden="true" className="quiz-form__signal-frame">
            <span />
            <span />
            <span />
          </div>
          <div className="quiz-form__meta">
            <span>QUESTION {String(questionIndex + 1).padStart(2, '0')}</span>
            <span>{stage.signal}</span>
          </div>

          <fieldset className="question-fieldset">
            <legend ref={questionHeadingRef} tabIndex={-1}>
              {question.prompt}
            </legend>
            <div className="option-list">
              {question.options.map((option) => (
                <AnswerOption
                  checked={selectedOptionId === option.id}
                  groupName={question.id}
                  key={option.id}
                  label={option.label}
                  onSelect={() => onAnswer(question.id, option.id)}
                  optionId={option.id}
                />
              ))}
            </div>
          </fieldset>

          <p
            aria-live={hasAnswer ? 'polite' : undefined}
            className="question-hint"
          >
            {hasAnswer
              ? '信号已采集，协作画像正在形成。'
              : '请选择一个最符合你的选项。'}
          </p>

          <div className="quiz-mascot-status" aria-hidden="true">
            <SignalMascot variant={hasAnswer ? 'launch' : 'focus'} />
            <span>{hasAnswer ? 'SIGNAL CAPTURED' : 'AWAITING INPUT'}</span>
          </div>

          <div className="quiz-actions">
            <button
              className="button button--secondary button--with-icon"
              disabled={isFirstQuestion}
              onClick={onPrevious}
              type="button"
            >
              <ArrowLeft aria-hidden="true" size={18} />
              上一题
            </button>
            <button
              className="button button--primary button--with-icon"
              disabled={!hasAnswer}
              onClick={onNext}
              type="button"
            >
              {isLastQuestion ? '生成结果' : '下一题'}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </motion.form>
      </div>
    </main>
  )
}
