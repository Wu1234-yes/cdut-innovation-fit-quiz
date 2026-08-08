import { describe, expect, it } from 'vitest'
import { departments } from '../../src/content/departments'

describe('departments', () => {
  it('keeps the required department ID order', () => {
    expect(departments.map((department) => department.id)).toEqual([
      'office',
      'project',
      'competition',
      'training',
      'science',
      'publicity',
      'language',
    ])
  })

  it('keeps every department ID unique', () => {
    const ids = departments.map((department) => department.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps the required department name order', () => {
    expect(departments.map((department) => department.name)).toEqual([
      '办公室',
      '项目部',
      '竞赛部',
      '赛训部',
      '科素部',
      '宣传部',
      '语培部',
    ])
  })

  it('keeps every target score between 0 and 100', () => {
    for (const department of departments) {
      for (const score of Object.values(department.target)) {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      }
    }
  })

  it('provides a non-empty summary for every department', () => {
    for (const department of departments) {
      expect(department.summary.trim()).not.toBe('')
    }
  })

  it('provides the four approved keywords for every department', () => {
    expect(departments.map((department) => department.keywords)).toEqual([
      ['细致', '统筹', '执行', '协作'],
      ['分析', '流程', '项目管理', '推进'],
      ['组织', '执行', '应变', '协调'],
      ['理解', '辅导', '沟通', '协同'],
      ['研究', '规范', '分析', '教学'],
      ['创意', '表达', '内容', '视觉'],
      ['表达', '转化', '舞台', '应变'],
    ])

    for (const department of departments) {
      expect(department.keywords).toHaveLength(4)
    }
  })

  it('matches every approved target vector exactly', () => {
    expect(
      departments.map(({ target }) => [
        target.expression,
        target.analysis,
        target.execution,
        target.adaptation,
      ]),
    ).toEqual([
      [55, 50, 100, 85],
      [55, 85, 95, 70],
      [65, 60, 95, 95],
      [80, 85, 70, 85],
      [60, 100, 65, 55],
      [100, 45, 65, 75],
      [95, 55, 60, 100],
    ])
  })

  it('provides complete documentary content for every department', () => {
    for (const department of departments) {
      expect(department.mission.trim()).not.toBe('')
      expect(department.accent).toMatch(/^#[0-9a-f]{6}$/i)
      expect(department.hero.alt.trim()).not.toBe('')
      expect(department.gallery).toHaveLength(3)
      expect(department.responsibilities.length).toBeGreaterThanOrEqual(3)
      expect(department.workflow.length).toBeGreaterThanOrEqual(4)
      expect(department.gains.length).toBeGreaterThanOrEqual(3)
      expect(department.fitNarrative.trim()).not.toBe('')
      expect(department.related).toHaveLength(2)
      expect(department.related).not.toContain(department.id)
    }
  })

  it('keeps every related department reference valid', () => {
    const ids = new Set(departments.map(({ id }) => id))

    for (const department of departments) {
      for (const relatedId of department.related) {
        expect(ids.has(relatedId)).toBe(true)
      }
    }
  })
})
