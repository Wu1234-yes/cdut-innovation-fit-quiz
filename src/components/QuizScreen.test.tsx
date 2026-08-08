import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { questions } from '../content/questions'
import { QuizScreen } from './QuizScreen'

describe('QuizScreen', () => {
  it('shows the correct stage and keeps native radio behavior', () => {
    const onAnswer = vi.fn()
    const question = questions[6]

    render(
      <QuizScreen
        onAnswer={onAnswer}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        question={question}
        questionIndex={6}
        selectedOptionId={undefined}
        totalQuestions={questions.length}
      />,
    )

    expect(screen.getByText('协作阶段')).toBeVisible()
    expect(screen.getAllByText('识别你的合作偏好')).toHaveLength(2)

    const firstOption = screen.getAllByRole('radio')[0]
    fireEvent.click(firstOption)
    expect(onAnswer).toHaveBeenCalledWith(question.id, question.options[0].id)
  })

  it('announces that the collaboration profile is forming', () => {
    const question = questions[0]

    render(
      <QuizScreen
        onAnswer={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        question={question}
        questionIndex={0}
        selectedOptionId={question.options[0].id}
        totalQuestions={questions.length}
      />,
    )

    expect(screen.getByText('信号已采集，协作画像正在形成。')).toBeInTheDocument()
  })
})
