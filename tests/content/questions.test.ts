import { describe, expect, it } from 'vitest'
import { questions } from '../../src/content/questions'

const dimensionIds = [
  'expression',
  'analysis',
  'execution',
  'adaptation',
] as const

const departmentIds = [
  'office',
  'project',
  'competition',
  'training',
  'science',
  'publicity',
  'language',
] as const

describe('questions', () => {
  const preferenceQuestions = questions.filter(
    (question) => question.type === 'preference',
  )
  const scenarioQuestions = questions.filter(
    (question) => question.type === 'scenario',
  )

  it('contains 20 questions split into 12 preference and 8 scenario questions', () => {
    expect(questions).toHaveLength(20)
    expect(preferenceQuestions).toHaveLength(12)
    expect(scenarioQuestions).toHaveLength(8)
  })

  it('keeps question and option IDs globally unique', () => {
    const questionIds = questions.map((question) => question.id)
    const optionIds = questions.flatMap((question) =>
      question.options.map((option) => option.id),
    )
    const allIds = [...questionIds, ...optionIds]

    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('provides two options per preference question and four per scenario question', () => {
    for (const question of preferenceQuestions) {
      expect(question.options).toHaveLength(2)
    }

    for (const question of scenarioQuestions) {
      expect(question.options).toHaveLength(4)
    }
  })

  it('uses every preference dimension pairing exactly twice', () => {
    expect(
      preferenceQuestions.map((question) =>
        question.options.map((option) => option.dimension).join('-'),
      ),
    ).toEqual([
      'expression-analysis',
      'expression-execution',
      'expression-adaptation',
      'analysis-execution',
      'analysis-adaptation',
      'execution-adaptation',
      'analysis-expression',
      'execution-expression',
      'adaptation-expression',
      'execution-analysis',
      'adaptation-analysis',
      'adaptation-execution',
    ])

    for (const question of preferenceQuestions) {
      for (const option of question.options) {
        for (const dimensionId of dimensionIds) {
          expect(option.points[dimensionId]).toBe(
            dimensionId === option.dimension ? 2 : 0,
          )
        }
      }
    }
  })

  it('balances every preference dimension across A and B positions', () => {
    const positions = Object.fromEntries(
      dimensionIds.map((dimensionId) => [dimensionId, { A: 0, B: 0 }]),
    ) as Record<(typeof dimensionIds)[number], { A: number; B: number }>

    for (const question of preferenceQuestions) {
      positions[question.options[0].dimension].A += 1
      positions[question.options[1].dimension].B += 1
    }

    expect(positions).toEqual({
      expression: { A: 3, B: 3 },
      analysis: { A: 3, B: 3 },
      execution: { A: 3, B: 3 },
      adaptation: { A: 3, B: 3 },
    })
  })

  it('uses the approved primary and related departments for every scenario', () => {
    expect(
      scenarioQuestions.map((question) =>
        question.options.map(({ primary, related }) => [primary, related]),
      ),
    ).toEqual([
      [
        ['training', 'language'],
        ['project', 'science'],
        ['office', 'competition'],
        ['publicity', 'language'],
      ],
      [
        ['project', 'competition'],
        ['office', 'project'],
        ['language', 'training'],
        ['science', 'project'],
      ],
      [
        ['competition', 'office'],
        ['language', 'training'],
        ['publicity', 'competition'],
        ['training', 'science'],
      ],
      [
        ['publicity', 'language'],
        ['language', 'training'],
        ['science', 'project'],
        ['office', 'project'],
      ],
      [
        ['language', 'publicity'],
        ['science', 'project'],
        ['project', 'office'],
        ['competition', 'office'],
      ],
      [
        ['project', 'science'],
        ['office', 'competition'],
        ['training', 'language'],
        ['competition', 'office'],
      ],
      [
        ['science', 'training'],
        ['publicity', 'competition'],
        ['competition', 'office'],
        ['language', 'training'],
      ],
      [
        ['office', 'publicity'],
        ['training', 'publicity'],
        ['publicity', 'science'],
        ['project', 'publicity'],
      ],
    ])

    for (const question of scenarioQuestions) {
      for (const option of question.options) {
        for (const departmentId of departmentIds) {
          const expectedScore =
            departmentId === option.primary
              ? 2
              : departmentId === option.related
                ? 1
                : 0

          expect(option.points[departmentId]).toBe(expectedScore)
        }
      }
    }
  })

  it('uses the fixed balanced scenario option order', () => {
    expect(
      scenarioQuestions.map((question) =>
        question.options.map((option) => option.id),
      ),
    ).toEqual([
      ['s01-c', 's01-b', 's01-a', 's01-d'],
      ['s02-c', 's02-a', 's02-d', 's02-b'],
      ['s03-a', 's03-c', 's03-b', 's03-d'],
      ['s04-b', 's04-c', 's04-a', 's04-d'],
      ['s05-d', 's05-b', 's05-a', 's05-c'],
      ['s06-b', 's06-a', 's06-d', 's06-c'],
      ['s07-a', 's07-c', 's07-b', 's07-d'],
      ['s08-a', 's08-c', 's08-d', 's08-b'],
    ])
  })

  it('balances department points across scenario option positions', () => {
    const positionNames = ['A', 'B', 'C', 'D'] as const
    const positionPoints = Object.fromEntries(
      positionNames.map((positionName) => [
        positionName,
        Object.fromEntries(
          departmentIds.map((departmentId) => [departmentId, 0]),
        ),
      ]),
    ) as Record<
      (typeof positionNames)[number],
      Record<(typeof departmentIds)[number], number>
    >

    for (const question of scenarioQuestions) {
      question.options.forEach((option, positionIndex) => {
        const positionName = positionNames[positionIndex]

        for (const departmentId of departmentIds) {
          positionPoints[positionName][departmentId] +=
            option.points[departmentId]
        }
      })
    }

    expect(positionPoints).toEqual({
      A: {
        office: 3,
        project: 4,
        competition: 3,
        training: 3,
        science: 3,
        publicity: 4,
        language: 4,
      },
      B: {
        office: 4,
        project: 4,
        competition: 2,
        training: 4,
        science: 3,
        publicity: 3,
        language: 4,
      },
      C: {
        office: 4,
        project: 3,
        competition: 4,
        training: 3,
        science: 3,
        publicity: 4,
        language: 3,
      },
      D: {
        office: 4,
        project: 4,
        competition: 4,
        training: 3,
        science: 3,
        publicity: 3,
        language: 3,
      },
    })

    for (const positionName of positionNames) {
      expect(
        Object.values(positionPoints[positionName]).reduce(
          (total, points) => total + points,
          0,
        ),
      ).toBe(24)
    }

    for (const departmentId of departmentIds) {
      const pointsByPosition = positionNames.map(
        (positionName) => positionPoints[positionName][departmentId],
      )

      expect(Math.max(...pointsByPosition) - Math.min(...pointsByPosition)).toBeLessThanOrEqual(2)
    }

    expect(Math.max(...Object.values(positionPoints.A))).toBeLessThanOrEqual(4)
    expect(Math.max(...Object.values(positionPoints.D))).toBeLessThanOrEqual(4)
  })

  it('balances scenario primary assignments within one occurrence', () => {
    const primaryCounts = Object.fromEntries(
      departmentIds.map((departmentId) => [departmentId, 0]),
    ) as Record<(typeof departmentIds)[number], number>

    for (const question of scenarioQuestions) {
      for (const option of question.options) {
        primaryCounts[option.primary] += 1
      }
    }

    const counts = Object.values(primaryCounts)

    expect(Math.min(...counts)).toBe(4)
    expect(Math.max(...counts)).toBe(5)
  })

  it('includes every department in scenario scoring', () => {
    const usedDepartmentIds = new Set(
      scenarioQuestions.flatMap((question) =>
        question.options.flatMap((option) => [option.primary, option.related]),
      ),
    )

    expect(usedDepartmentIds).toEqual(new Set(departmentIds))
  })

  it('locks each department total scenario exposure', () => {
    const exposure = Object.fromEntries(
      departmentIds.map((departmentId) => [departmentId, 0]),
    ) as Record<(typeof departmentIds)[number], number>

    for (const question of scenarioQuestions) {
      for (const option of question.options) {
        for (const departmentId of departmentIds) {
          exposure[departmentId] += option.points[departmentId]
        }
      }
    }

    expect(exposure).toEqual({
      office: 15,
      project: 15,
      competition: 13,
      training: 13,
      science: 12,
      publicity: 14,
      language: 14,
    })
  })

  it('locks scenario random baselines and theoretical maximums', () => {
    const metrics = Object.fromEntries(
      departmentIds.map((departmentId) => [
        departmentId,
        { randomBaseline: 0, theoreticalMax: 0 },
      ]),
    ) as Record<
      (typeof departmentIds)[number],
      { randomBaseline: number; theoreticalMax: number }
    >

    for (const question of scenarioQuestions) {
      for (const departmentId of departmentIds) {
        const optionPoints = question.options.map(
          (option) => option.points[departmentId],
        )

        metrics[departmentId].randomBaseline +=
          optionPoints.reduce((total, points) => total + points, 0) /
          optionPoints.length
        metrics[departmentId].theoreticalMax += Math.max(...optionPoints)
      }
    }

    // Task4 采用 chance-corrected：max(0, (raw - baseline) / (max - baseline)) * 100，不再使用 raw / max。
    expect(metrics).toEqual({
      office: { randomBaseline: 3.75, theoreticalMax: 13 },
      project: { randomBaseline: 3.75, theoreticalMax: 11 },
      competition: { randomBaseline: 3.25, theoreticalMax: 10 },
      training: { randomBaseline: 3.25, theoreticalMax: 11 },
      science: { randomBaseline: 3, theoreticalMax: 12 },
      publicity: { randomBaseline: 3.5, theoreticalMax: 11 },
      language: { randomBaseline: 3.5, theoreticalMax: 12 },
    })
  })

  it('provides non-empty prompts and option labels', () => {
    for (const question of questions) {
      expect(question.prompt.trim()).not.toBe('')

      for (const option of question.options) {
        expect(option.label.trim()).not.toBe('')
      }
    }
  })

  it('does not mention department names or unique abbreviations', () => {
    const forbiddenNames = [
      '办公室',
      '项目部',
      '竞赛部',
      '赛训部',
      '科素部',
      '宣传部',
      '语培部',
      '语培',
      '赛训',
      '科素',
    ]
    const visibleText = questions
      .flatMap((question) => [
        question.prompt,
        ...question.options.map((option) => option.label),
      ])
      .join('\n')

    for (const forbiddenName of forbiddenNames) {
      expect(visibleText).not.toContain(forbiddenName)
    }
  })
})
