import { describe, expect, it } from 'vitest'
import { departments } from '../../src/content/departments'
import { questions } from '../../src/content/questions'
import type {
  Answers,
  DepartmentId,
  ScoreMap,
} from '../../src/content/types'
import {
  cosineFit,
  normalizeDimensions,
  normalizeScenarioScores,
  profileName,
  rankDepartments,
  scoreQuiz,
} from '../../src/scoring/scoreQuiz'

const dimensions = (
  expression: number,
  analysis: number,
  execution: number,
  adaptation: number,
): ScoreMap => ({ expression, analysis, execution, adaptation })

const departmentIds = departments.map(({ id }) => id)

const scenarioScores = (
  overrides: Partial<Record<DepartmentId, number>> = {},
): Record<DepartmentId, number> =>
  Object.fromEntries(
    departmentIds.map((departmentId) => [
      departmentId,
      overrides[departmentId] ?? 0,
    ]),
  ) as Record<DepartmentId, number>

const firstPreferenceAnswers: Answers = {
  p01: 'p01-a',
  p02: 'p02-a',
  p03: 'p03-a',
  p04: 'p04-a',
  p05: 'p05-a',
  p06: 'p06-a',
  p07: 'p07-a',
  p08: 'p08-a',
  p09: 'p09-a',
  p10: 'p10-a',
  p11: 'p11-a',
  p12: 'p12-a',
  p13: 'p13-a',
  p14: 'p14-a',
  p15: 'p15-a',
  p16: 'p16-a',
  p17: 'p17-a',
}

const completeAnswerFixtures: Record<DepartmentId, Answers> = {
  office: {
    ...firstPreferenceAnswers,
    s01: 's01-a',
    s02: 's02-a',
    s03: 's03-a',
    s04: 's04-d',
    s05: 's05-a',
    s06: 's06-a',
    s07: 's07-b',
    s08: 's08-a',
  },
  project: {
    ...firstPreferenceAnswers,
    s01: 's01-b',
    s02: 's02-c',
    s03: 's03-a',
    s04: 's04-a',
    s05: 's05-a',
    s06: 's06-b',
    s07: 's07-a',
    s08: 's08-b',
  },
  competition: {
    ...firstPreferenceAnswers,
    s01: 's01-a',
    s02: 's02-c',
    s03: 's03-a',
    s04: 's04-b',
    s05: 's05-c',
    s06: 's06-c',
    s07: 's07-b',
    s08: 's08-a',
  },
  training: {
    ...firstPreferenceAnswers,
    s01: 's01-c',
    s02: 's02-d',
    s03: 's03-d',
    s04: 's04-c',
    s05: 's05-d',
    s06: 's06-d',
    s07: 's07-a',
    s08: 's08-c',
  },
  science: {
    ...firstPreferenceAnswers,
    s01: 's01-b',
    s02: 's02-b',
    s03: 's03-d',
    s04: 's04-a',
    s05: 's05-b',
    s06: 's06-b',
    s07: 's07-a',
    s08: 's08-d',
  },
  publicity: {
    ...firstPreferenceAnswers,
    s01: 's01-d',
    s02: 's02-c',
    s03: 's03-b',
    s04: 's04-b',
    s05: 's05-d',
    s06: 's06-b',
    s07: 's07-c',
    s08: 's08-d',
  },
  language: {
    ...firstPreferenceAnswers,
    s01: 's01-c',
    s02: 's02-d',
    s03: 's03-c',
    s04: 's04-c',
    s05: 's05-d',
    s06: 's06-d',
    s07: 's07-d',
    s08: 's08-a',
  },
}

describe('cosineFit', () => {
  it('returns the cosine boundaries without rounding', () => {
    expect(cosineFit(dimensions(1, 0, 0, 0), dimensions(3, 0, 0, 0))).toBe(1)
    expect(cosineFit(dimensions(1, 0, 0, 0), dimensions(0, 1, 0, 0))).toBe(0)
    expect(cosineFit(dimensions(0, 0, 0, 0), dimensions(1, 1, 1, 1))).toBe(0)
    expect(cosineFit(dimensions(1, 1, 0, 0), dimensions(1, 0, 0, 0))).toBeCloseTo(
      1 / Math.sqrt(2),
      12,
    )
  })
})

describe('normalization', () => {
  it('normalizes each preference dimension by its available maximum', () => {
    const answers: Answers = Object.fromEntries(
      questions
        .filter((question) => question.type === 'preference')
        .map((question) => [question.id, question.options[0].id]),
    )

    expect(normalizeDimensions(answers)).toEqual({
      expression: (4 / 9) * 100,
      analysis: (5 / 9) * 100,
      execution: 50,
      adaptation: 50,
    })
  })

  it('returns public scenario fits as department numbers', () => {
    const scores: Record<DepartmentId, number> = normalizeScenarioScores({})

    expect(Object.keys(scores)).toEqual(departmentIds)
    expect(Object.values(scores).every((score) => score === 0)).toBe(true)
  })

  it('locks the chance-corrected scenario formula exactly', () => {
    const scenarioQuestions = questions.filter(
      (question) => question.type === 'scenario',
    )
    const answers = Object.fromEntries(
      scenarioQuestions.map((question) => [question.id, question.options[1].id]),
    )
    const departmentId: DepartmentId = 'office'
    const raw = scenarioQuestions.reduce(
      (total, question) =>
        total +
        question.options.find((option) => option.id === answers[question.id])!
          .points[departmentId],
      0,
    )
    const randomBaseline = scenarioQuestions.reduce(
      (total, question) =>
        total +
        question.options.reduce(
          (sum, option) => sum + option.points[departmentId],
          0,
        ) /
          question.options.length,
      0,
    )
    const theoreticalMax = scenarioQuestions.reduce(
      (total, question) =>
        total +
        Math.max(...question.options.map((option) => option.points[departmentId])),
      0,
    )
    const expected =
      Math.max(
        0,
        (raw - randomBaseline) / (theoreticalMax - randomBaseline),
      ) * 100

    expect(normalizeScenarioScores(answers)[departmentId]).toBe(expected)
    expect(normalizeScenarioScores(answers)[departmentId]).not.toBe(
      (raw / theoreticalMax) * 100,
    )
  })

  it('gives a random-baseline response zero rather than a systematic high score', () => {
    const answers = Object.fromEntries(
      questions
        .filter((question) => question.type === 'scenario')
        .map((question) => [question.id, question.options[0].id]),
    )

    expect(normalizeScenarioScores(answers).science).toBe(0)
  })
})

describe('rankDepartments', () => {
  const rankingWithTargetScores = (
    targetScores: Partial<Record<DepartmentId, number>>,
  ) => {
    const normalizedDimensions = departments.find(
      ({ id }) => id === 'publicity',
    )!.target
    const scores = scenarioScores()

    for (const [departmentId, targetScore] of Object.entries(targetScores) as [
      DepartmentId,
      number,
    ][]) {
      const department = departments.find(({ id }) => id === departmentId)!
      const dimensionFit =
        cosineFit(normalizedDimensions, department.target) * 100
      scores[departmentId] = (targetScore - 0.55 * dimensionFit) / 0.45

      for (let iteration = 0; iteration < 5; iteration += 1) {
        scores[departmentId] +=
          (targetScore -
            (0.55 * dimensionFit + 0.45 * scores[departmentId])) /
          0.45
      }
    }

    return rankDepartments(normalizedDimensions, scores)
  }

  const pairRanking = (finalGap: number) => {
    const normalizedDimensions = departments.find(
      ({ id }) => id === 'publicity',
    )!.target
    const publicityDimensionFit =
      cosineFit(
        normalizedDimensions,
        departments.find(({ id }) => id === 'publicity')!.target,
      ) * 100
    const scienceDimensionFit =
      cosineFit(
        normalizedDimensions,
        departments.find(({ id }) => id === 'science')!.target,
      ) * 100
    const scienceTargetScore = 80
    const publicityTargetScore = scienceTargetScore + finalGap
    let scienceScenarioFit =
      (scienceTargetScore - 0.55 * scienceDimensionFit) / 0.45
    let publicityScenarioFit =
      (publicityTargetScore - 0.55 * publicityDimensionFit) / 0.45

    for (let iteration = 0; iteration < 5; iteration += 1) {
      scienceScenarioFit +=
        (scienceTargetScore -
          (0.55 * scienceDimensionFit + 0.45 * scienceScenarioFit)) /
        0.45
      publicityScenarioFit +=
        (publicityTargetScore -
          (0.55 * publicityDimensionFit + 0.45 * publicityScenarioFit)) /
        0.45
    }
    const ranking = rankDepartments(
      normalizedDimensions,
      scenarioScores({
        publicity: publicityScenarioFit,
        science: scienceScenarioFit,
      }),
    )

    return {
      ranking,
      publicity: ranking.find(({ id }) => id === 'publicity')!,
      science: ranking.find(({ id }) => id === 'science')!,
    }
  }

  it('uses scenarioFit first when final scores are within 1.5', () => {
    const { ranking, publicity, science } = pairRanking(1)

    expect(publicity.score - science.score).toBeCloseTo(1, 12)
    expect(science.scenarioFit).toBeGreaterThan(publicity.scenarioFit)
    expect(ranking.indexOf(science)).toBeLessThan(ranking.indexOf(publicity))
  })

  it('uses dimensionFit after equal scenarioFit inside the tie band', () => {
    const ranking = rankDepartments(
      dimensions(100, 100, 100, 100),
      scenarioScores(),
    )
    const science = ranking.find(({ id }) => id === 'science')!
    const publicity = ranking.find(({ id }) => id === 'publicity')!

    expect(science.scenarioFit).toBe(publicity.scenarioFit)
    expect(Math.abs(science.score - publicity.score)).toBeLessThanOrEqual(1.5)
    expect(science.dimensionFit).toBeGreaterThan(publicity.dimensionFit)
    expect(ranking.indexOf(science)).toBeLessThan(ranking.indexOf(publicity))
  })

  it('treats an exact 1.5 final-score difference as a tie', () => {
    const { ranking, publicity, science } = pairRanking(1.5)

    expect(publicity.score - science.score).toBe(1.5)
    expect(ranking.indexOf(science)).toBeLessThan(ranking.indexOf(publicity))
  })

  it('uses final score when the difference exceeds 1.5', () => {
    const { ranking, publicity, science } = pairRanking(1.6)

    expect(publicity.score - science.score).toBeCloseTo(1.6, 12)
    expect(ranking.indexOf(publicity)).toBeLessThan(ranking.indexOf(science))
  })

  it('uses final score for the smallest tested increment above 1.5', () => {
    const { ranking, publicity, science } = pairRanking(1.500_000_000_000_5)
    const actualGap = publicity.score - science.score

    expect(actualGap).toBeGreaterThan(1.5)
    expect(actualGap).toBeLessThan(1.500_000_000_001)
    expect(ranking.indexOf(publicity)).toBeLessThan(ranking.indexOf(science))
  })

  it('uses the fixed approved order when all values are identical', () => {
    const ranking = rankDepartments(dimensions(0, 0, 0, 0), scenarioScores())

    expect(ranking.map(({ id }) => id)).toEqual(departmentIds)
  })

  it('resolves a three-department comparator cycle with fixed group boundaries', () => {
    const expectedOrder: DepartmentId[] = ['office', 'competition', 'project']
    const getRelevantOrder = () =>
      rankingWithTargetScores({ competition: 82, office: 81, project: 80 })
        .filter(({ id }) => expectedOrder.includes(id))
        .map(({ id }) => id)

    expect(getRelevantOrder()).toEqual(expectedOrder)
    expect(getRelevantOrder()).toEqual(expectedOrder)

    const ranking = rankingWithTargetScores({
      competition: 82,
      office: 81,
      project: 80,
    })
    const competition = ranking.find(({ id }) => id === 'competition')!
    const office = ranking.find(({ id }) => id === 'office')!
    const project = ranking.find(({ id }) => id === 'project')!

    expect(project.scenarioFit).toBeGreaterThan(office.scenarioFit)
    expect(office.scenarioFit).toBeGreaterThan(competition.scenarioFit)
    expect(competition.score - project.score).toBe(2)
  })

  it('computes score from the exact weighted formula', () => {
    const ranking = rankDepartments(
      dimensions(83.25, 41.5, 67.75, 92.125),
      scenarioScores({ office: 36.375 }),
    )
    const office = ranking.find(({ id }) => id === 'office')!

    expect(office.score).toBe(
      0.55 * office.dimensionFit + 0.45 * office.scenarioFit,
    )
    expect(Number.isInteger(office.score)).toBe(false)
  })
})

describe('profileName', () => {
  it.each([
    [dimensions(100, 90, 20, 10), '科创转译者'],
    [dimensions(100, 20, 90, 10), '创意策动者'],
    [dimensions(100, 20, 10, 90), '现场连接者'],
    [dimensions(20, 100, 90, 10), '深研推进者'],
    [dimensions(20, 100, 10, 90), '洞察协调者'],
    [dimensions(20, 10, 100, 90), '行动统筹者'],
  ])('maps the two strongest dimensions to %s', (scores, expected) => {
    expect(profileName(scores)).toBe(expected)
  })
})

describe('scoreQuiz', () => {
  it('allows every real department to rank first from complete real answers', () => {
    for (const departmentId of departmentIds) {
      const answers = completeAnswerFixtures[departmentId]

      expect(Object.keys(answers)).toHaveLength(questions.length)
      expect(scoreQuiz(answers).ranking[0].id).toBe(departmentId)
    }
  })

  it('returns three distinct top results using the planned public shape', () => {
    const result = scoreQuiz(completeAnswerFixtures.competition)

    expect(Object.keys(result)).toEqual(['dimensions', 'ranking', 'profile'])
    expect(new Set(result.ranking.slice(0, 3).map(({ id }) => id)).size).toBe(3)
    expect(Object.keys(result.ranking[0])).toEqual([
      'id',
      'name',
      'dimensionFit',
      'scenarioFit',
      'score',
    ])
  })

  it('handles missing answers without crashing', () => {
    const result = scoreQuiz({})

    expect(result.dimensions).toEqual(dimensions(0, 0, 0, 0))
    expect(result.ranking).toHaveLength(7)
    expect(result.ranking.every(({ scenarioFit }) => scenarioFit === 0)).toBe(true)
  })

  it('throws explicit errors for unknown questions and options', () => {
    expect(() => scoreQuiz({ unknown: 'p01-a' })).toThrowError(
      'Unknown question ID: unknown',
    )
    expect(() => scoreQuiz({ p01: 'not-an-option' })).toThrowError(
      'Unknown option ID "not-an-option" for question "p01"',
    )
  })

  it('is deterministic for the same answers', () => {
    const answers = Object.fromEntries(
      questions.map((question) => [question.id, question.options[0].id]),
    )

    expect(scoreQuiz(answers)).toEqual(scoreQuiz(answers))
  })
})
