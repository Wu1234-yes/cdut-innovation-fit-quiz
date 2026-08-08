import type { ScoreMap } from '../content/types'

export interface ProfileFacet {
  id: string
  label: string
  value: number
}

const sanitize = (value: number) =>
  Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value))) : 0

const mix = (primary: number, secondary: number) =>
  Math.round(primary * 0.7 + secondary * 0.3)

export function buildProfileFacets(scores: ScoreMap): ProfileFacet[] {
  const expression = sanitize(scores.expression)
  const analysis = sanitize(scores.analysis)
  const execution = sanitize(scores.execution)
  const adaptation = sanitize(scores.adaptation)

  return [
    { id: 'clarity', label: '表达清晰', value: expression },
    {
      id: 'translation',
      label: '内容转化',
      value: mix(expression, analysis),
    },
    { id: 'decomposition', label: '分析拆解', value: analysis },
    {
      id: 'judgement',
      label: '方案判断',
      value: mix(analysis, adaptation),
    },
    { id: 'momentum', label: '执行推进', value: execution },
    {
      id: 'milestones',
      label: '节点管理',
      value: mix(execution, analysis),
    },
    { id: 'adaptability', label: '协作应变', value: adaptation },
    {
      id: 'communication',
      label: '现场沟通',
      value: mix(adaptation, expression),
    },
  ]
}
