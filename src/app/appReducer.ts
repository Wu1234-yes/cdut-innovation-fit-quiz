import { departments } from '../content/departments'
import { questions } from '../content/questions'
import type { Answers, DepartmentId } from '../content/types'

export type View =
  | 'welcome'
  | 'quiz'
  | 'analyzing'
  | 'result'
  | 'departmentDetails'

export interface AppState {
  view: View
  questionIndex: number
  answers: Answers
  selectedDepartmentId?: DepartmentId
}

export type AppAction =
  | { type: 'START' }
  | { type: 'ANSWER'; questionId: string; optionId: string }
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'FINISH' }
  | { type: 'SHOW_RESULT' }
  | { type: 'OPEN_DEPARTMENT'; departmentId: DepartmentId }
  | { type: 'RESET' }

export const LAST_QUESTION_INDEX = questions.length - 1

export const createInitialState = (): AppState => ({
  view: 'welcome',
  questionIndex: 0,
  answers: {},
})

export const initialState: AppState = createInitialState()

const departmentIds = new Set(departments.map(({ id }) => id))
const questionsById = new Map(questions.map((question) => [question.id, question]))
const withoutSelectedDepartment = ({
  answers,
  questionIndex,
  view,
}: AppState): AppState => ({ answers, questionIndex, view })

const hasValidAnswer = (answers: Answers, questionIndex: number) => {
  const question = questions[questionIndex]
  const optionId = question && answers[question.id]

  return question?.options.some((option) => option.id === optionId) === true
}

export const hasCompleteAnswers = (answers: Answers) =>
  questions.every((_question, questionIndex) =>
    hasValidAnswer(answers, questionIndex),
  )

export const hasAnsweredQuestionsBefore = (
  answers: Answers,
  questionIndex: number,
) =>
  questions
    .slice(0, questionIndex)
    .every((_question, index) => hasValidAnswer(answers, index))

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'START':
      if (state.view !== 'welcome') {
        return state
      }

      return { ...withoutSelectedDepartment(state), view: 'quiz' }
    case 'ANSWER': {
      if (state.view !== 'quiz') {
        return state
      }

      const question = questionsById.get(action.questionId)

      if (!question?.options.some(({ id }) => id === action.optionId)) {
        return state
      }

      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
      }
    }
    case 'NEXT':
      if (
        state.view !== 'quiz' ||
        state.questionIndex >= LAST_QUESTION_INDEX ||
        !hasValidAnswer(state.answers, state.questionIndex)
      ) {
        return state
      }

      return {
        ...state,
        questionIndex: state.questionIndex + 1,
      }
    case 'PREVIOUS':
      if (state.view !== 'quiz' || state.questionIndex <= 0) {
        return state
      }

      return {
        ...state,
        questionIndex: state.questionIndex - 1,
      }
    case 'FINISH':
      if (
        state.view !== 'quiz' ||
        state.questionIndex !== LAST_QUESTION_INDEX ||
        !hasCompleteAnswers(state.answers)
      ) {
        return state
      }

      return { ...withoutSelectedDepartment(state), view: 'analyzing' }
    case 'SHOW_RESULT':
      if (
        (state.view !== 'analyzing' && state.view !== 'departmentDetails') ||
        !hasCompleteAnswers(state.answers)
      ) {
        return state
      }

      return { ...withoutSelectedDepartment(state), view: 'result' }
    case 'OPEN_DEPARTMENT':
      if (
        state.view !== 'result' ||
        !hasCompleteAnswers(state.answers) ||
        !departmentIds.has(action.departmentId)
      ) {
        return state
      }

      return {
        ...state,
        view: 'departmentDetails',
        selectedDepartmentId: action.departmentId,
      }
    case 'RESET':
      return createInitialState()
    default:
      return state
  }
}
