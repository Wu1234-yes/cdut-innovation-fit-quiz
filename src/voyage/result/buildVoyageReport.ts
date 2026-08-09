import type { DepartmentId } from '../content/types'
import type { ActionDimension, StationAnswer } from '../app/voyageReducer'

export interface VoyageDimensionScore {
  id: ActionDimension
  label: string
  score: number | null
  evidence: string
}

export interface VoyageDirection {
  departmentId: DepartmentId
  reason: string
}

export interface VoyageReport {
  title: string
  subtitle: string
  dimensions: VoyageDimensionScore[]
  coreStrength: string
  nextStep: string
  directions: VoyageDirection[]
}

const dimensionMeta: Record<ActionDimension, { label: string; evidence: string }> = {
  observation: { label: '观察', evidence: '你会先从细节和现场里找出值得追问的地方。' },
  handsOn: { label: '动手', evidence: '你愿意先做一个小版本，让想法获得真实反馈。' },
  collaboration: { label: '协作', evidence: '你会主动把不同人的信息接起来，让问题变清楚。' },
  progress: { label: '推进', evidence: '你习惯把大目标拆成今天能完成的下一步。' },
  expression: { label: '表达', evidence: '你在意别人能不能快速看懂一件事的价值。' },
}

const directionByDimension: Record<ActionDimension, VoyageDirection[]> = {
  observation: [
    { departmentId: 'science', reason: '如果想继续练习从资料里发现问题，可以先看看科创素养方向。' },
    { departmentId: 'project', reason: '如果想把观察带进真实项目，可以看看项目从选题到推进的过程。' },
  ],
  handsOn: [
    { departmentId: 'training', reason: '如果想在现场和训练里继续动手，可以先看看赛训方向。' },
    { departmentId: 'project', reason: '如果想把小尝试变成持续项目，可以看看项目推进方向。' },
  ],
  collaboration: [
    { departmentId: 'office', reason: '如果喜欢把人、信息和安排接起来，可以先看看办公室的协作现场。' },
    { departmentId: 'language', reason: '如果想在团队里把想法说清楚，可以看看语培方向的训练方式。' },
  ],
  progress: [
    { departmentId: 'project', reason: '如果享受把想法拆成节点，可以先看看项目推进的真实任务。' },
    { departmentId: 'competition', reason: '如果想在明确节点里服务参赛团队，可以看看竞赛方向。' },
  ],
  expression: [
    { departmentId: 'publicity', reason: '如果喜欢用文字、画面和现场记录让成果被看见，可以看看宣传方向。' },
    { departmentId: 'language', reason: '如果想把专业内容讲得更清楚，可以看看语培方向的表达训练。' },
  ],
}

const answerEntries = (answers: Partial<Record<string, StationAnswer>>) => Object.values(answers).filter(Boolean) as StationAnswer[]

export const buildVoyageReport = (
  answers: Partial<Record<string, StationAnswer>>,
): VoyageReport => {
  const entries = answerEntries(answers)
  const dimensions = (Object.keys(dimensionMeta) as ActionDimension[]).map((id) => {
    const rawScore = entries.reduce((total, item) => total + (item.weights[id] ?? 0), 0)
    const score = entries.length === 0 || rawScore === 0
      ? null
      : rawScore
    return {
      id,
      label: dimensionMeta[id].label,
      score: score === null ? null : Math.min(100, Math.round((score / Math.max(entries.length * 3, 3)) * 100)),
      evidence: dimensionMeta[id].evidence,
    }
  })

  const observed = dimensions.filter((item): item is VoyageDimensionScore & { score: number } => item.score !== null)
  const ranked = [...observed].sort((left, right) => (right.score - left.score) || left.id.localeCompare(right.id))
  const lead = ranked[0] ?? dimensions[0]
  const directions = directionByDimension[lead.id].slice(0, 2)

  return {
    title: lead.score === null ? '一束待显影的行动信号' : `${lead.label}信号正在靠近`,
    subtitle: entries.length === 5
      ? '这不是结论，是你刚才几次选择留下的航迹。'
      : entries.length === 0
        ? '你还没有留下选择，这里先保留一张等待出发的空白航图。'
        : '你只试了一站，这份报告先记录已经出现的信号。',
    dimensions,
    coreStrength: lead.score === null ? '从一件小事开始，信号才会出现。' : `${dimensionMeta[lead.id].label}：${dimensionMeta[lead.id].evidence}`,
    nextStep: entries.length === 0
      ? '回到第一站，随手选一种你当下最想尝试的做法。'
      : entries.length < 5
        ? '还可以回到下一站，继续看看另一种做法。'
        : '沿着一个你感兴趣的方向，再看一段真实任务。',
    directions,
  }
}
