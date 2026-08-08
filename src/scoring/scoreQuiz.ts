import { departments } from '../content/departments'
import { questions } from '../content/questions'
import type {
  Answers,
  DepartmentId,
  DimensionId,
  Question,
  ScoreMap,
} from '../content/types'

const dimensionIds: ReadonlyArray<DimensionId> = [
  'expression',
  'analysis',
  'execution',
  'adaptation',
]

const profileNames: Record<string, string> = {
  'expression-analysis': '科创转译者',
  'expression-execution': '创意策动者',
  'expression-adaptation': '现场连接者',
  'analysis-execution': '深研推进者',
  'analysis-adaptation': '洞察协调者',
  'execution-adaptation': '行动统筹者',
}

interface ScenarioScore {
  raw: number
  randomBaseline: number
  theoreticalMax: number
  scenarioFit: number
}

type ScenarioScores = Record<DepartmentId, ScenarioScore>

export interface RankedDepartment {
  id: DepartmentId
  name: string
  dimensionFit: number
  scenarioFit: number
  score: number
}

const emptyDimensionScores = (): ScoreMap => ({
  expression: 0,
  analysis: 0,
  execution: 0,
  adaptation: 0,
})

const validateAnswers = (
  answers: Answers,
  sourceQuestions: ReadonlyArray<Question>,
) => {
  const questionsById = new Map(
    sourceQuestions.map((question) => [question.id, question]),
  )

  for (const [questionId, optionId] of Object.entries(answers)) {
    const question = questionsById.get(questionId)

    if (!question) {
      throw new Error(`Unknown question ID: ${questionId}`)
    }

    if (!question.options.some((option) => option.id === optionId)) {
      throw new Error(
        `Unknown option ID "${optionId}" for question "${questionId}"`,
      )
    }
  }
}

export const cosineFit = (left: ScoreMap, right: ScoreMap): number => {
  const dotProduct = dimensionIds.reduce(
    (total, dimensionId) => total + left[dimensionId] * right[dimensionId],
    0,
  )
  const leftMagnitude = Math.sqrt(
    dimensionIds.reduce(
      (total, dimensionId) => total + left[dimensionId] ** 2,
      0,
    ),
  )
  const rightMagnitude = Math.sqrt(
    dimensionIds.reduce(
      (total, dimensionId) => total + right[dimensionId] ** 2,
      0,
    ),
  )

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0
  }

  return Math.max(0, Math.min(1, dotProduct / (leftMagnitude * rightMagnitude)))
}

export const normalizeDimensions = (
  answers: Answers,
): ScoreMap => {
  validateAnswers(answers, questions)

  const rawScores = emptyDimensionScores()
  const maximumScores = emptyDimensionScores()

  for (const question of questions) {
    if (question.type !== 'preference') {
      continue
    }

    for (const dimensionId of dimensionIds) {
      maximumScores[dimensionId] += Math.max(
        ...question.options.map((option) => option.points[dimensionId]),
      )
    }

    const selectedOptionId = answers[question.id]
    if (selectedOptionId === undefined) {
      continue
    }

    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    )!

    for (const dimensionId of dimensionIds) {
      rawScores[dimensionId] += selectedOption.points[dimensionId]
    }
  }

  return Object.fromEntries(
    dimensionIds.map((dimensionId) => [
      dimensionId,
      maximumScores[dimensionId] === 0
        ? 0
        : (rawScores[dimensionId] / maximumScores[dimensionId]) * 100,
    ]),
  ) as ScoreMap
}

const scenarioScoreDetails = (
  answers: Answers,
  sourceQuestions: ReadonlyArray<Question> = questions,
): ScenarioScores => {
  validateAnswers(answers, sourceQuestions)

  const scores = Object.fromEntries(
    departments.map(({ id }) => [
      id,
      { raw: 0, randomBaseline: 0, theoreticalMax: 0, scenarioFit: 0 },
    ]),
  ) as ScenarioScores

  for (const question of sourceQuestions) {
    if (question.type !== 'scenario') {
      continue
    }

    const selectedOptionId = answers[question.id]
    const selectedOption =
      selectedOptionId === undefined
        ? undefined
        : question.options.find((option) => option.id === selectedOptionId)!

    for (const { id: departmentId } of departments) {
      const availablePoints = question.options.map(
        (option) => option.points[departmentId],
      )
      scores[departmentId].randomBaseline +=
        availablePoints.reduce((total, points) => total + points, 0) /
        availablePoints.length
      scores[departmentId].theoreticalMax += Math.max(...availablePoints)
      scores[departmentId].raw += selectedOption?.points[departmentId] ?? 0
    }
  }

  for (const score of Object.values(scores)) {
    const correctedMaximum = score.theoreticalMax - score.randomBaseline
    score.scenarioFit =
      correctedMaximum <= 0
        ? 0
        : Math.max(0, (score.raw - score.randomBaseline) / correctedMaximum) *
          100
  }

  return scores
}

export const normalizeScenarioScores = (
  answers: Answers,
): Record<DepartmentId, number> =>
  Object.fromEntries(
    Object.entries(scenarioScoreDetails(answers)).map(
      ([departmentId, score]) => [departmentId, score.scenarioFit],
    ),
  ) as Record<DepartmentId, number>

export const rankDepartments = (
  normalizedDimensions: ScoreMap,
  scenarioScores: Record<DepartmentId, number>,
): RankedDepartment[] => {
  const approvedOrder = new Map(
    departments.map((department, index) => [department.id, index]),
  )

  const baselineRanking = departments
    .map((department) => {
      const dimensionFit = cosineFit(
        normalizedDimensions,
        department.target,
      ) * 100
      const scenarioFit = scenarioScores[department.id]

      return {
        id: department.id,
        name: department.name,
        dimensionFit,
        scenarioFit,
        score: 0.55 * dimensionFit + 0.45 * scenarioFit,
      }
    })
    .sort((left, right) => {
      const finalDifference = right.score - left.score
      if (finalDifference !== 0) {
        return finalDifference
      }

      return approvedOrder.get(left.id)! - approvedOrder.get(right.id)!
    })
  const tieGroups: RankedDepartment[][] = []

  for (const candidate of baselineRanking) {
    const currentGroup = tieGroups.at(-1)

    if (!currentGroup || currentGroup[0].score - candidate.score > 1.5) {
      tieGroups.push([candidate])
    } else {
      currentGroup.push(candidate)
    }
  }

  return tieGroups.flatMap((group) =>
    group.sort((left, right) => {
      const scenarioDifference = right.scenarioFit - left.scenarioFit
      if (scenarioDifference !== 0) {
        return scenarioDifference
      }

      const dimensionDifference = right.dimensionFit - left.dimensionFit
      if (dimensionDifference !== 0) {
        return dimensionDifference
      }

      return (
        approvedOrder.get(left.id)! - approvedOrder.get(right.id)!
      )
    }),
  )
}

export const profileName = (normalizedDimensions: ScoreMap): string => {
  const strongestDimensions = [...dimensionIds]
    .sort((left, right) => {
      const scoreDifference =
        normalizedDimensions[right] - normalizedDimensions[left]
      return scoreDifference === 0
        ? dimensionIds.indexOf(left) - dimensionIds.indexOf(right)
        : scoreDifference
    })
    .slice(0, 2)
    .sort(
      (left, right) =>
        dimensionIds.indexOf(left) - dimensionIds.indexOf(right),
    )

  return profileNames[strongestDimensions.join('-')]
}

export const scoreQuiz = (answers: Answers) => {
  const normalizedDimensions = normalizeDimensions(answers)
  const scenarioScores = normalizeScenarioScores(answers)

  return {
    dimensions: normalizedDimensions,
    ranking: rankDepartments(normalizedDimensions, scenarioScores),
    profile: profileName(normalizedDimensions),
  }
}
