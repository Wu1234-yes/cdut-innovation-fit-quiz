import type {
  ActionProfile,
  JourneySignals,
  ProfileTrait,
  ResearchScene,
  StarterTask,
} from '../content/types'

interface ProfileCandidates {
  traits: ProfileTrait[]
  researchScenes: ResearchScene[]
  starterTasks: StarterTask[]
}

const traits: Record<string, ProfileTrait> = {
  'notices-details': {
    id: 'notices-details',
    title: '会留意容易被忽略的细节',
    evidence: '你在夜航开始时先注意到了现场的细节。',
  },
  'cares-about-people': {
    id: 'cares-about-people',
    title: '愿意从人的需要出发',
    evidence: '你把目光放在了现场的人和他们的反应上。',
  },
  'reads-the-scene': {
    id: 'reads-the-scene',
    title: '习惯先看清现场再行动',
    evidence: '你先观察了事情发生的地点和环境。',
  },
  'asks-before-acting': {
    id: 'asks-before-acting',
    title: '愿意先问清楚再动手',
    evidence: '你选择通过对话补齐自己还不知道的信息。',
  },
  'moves-with-others': {
    id: 'moves-with-others',
    title: '能把想法放进协作里推进',
    evidence: '你为这次行动选择了同伴或团队。',
  },
  'turns-ideas-visible': {
    id: 'turns-ideas-visible',
    title: '愿意把过程讲给别人看',
    evidence: '你为发现选择了一种清楚的表达方式。',
  },
}

const researchScenes: Record<string, ResearchScene> = {
  'field-research': {
    id: 'field-research',
    title: '去现场弄清一个真实问题',
    description: '观察、记录，再和当事人聊一聊，让零散现象逐渐变得清楚。',
  },
  'project-tracking': {
    id: 'project-tracking',
    title: '把项目进展整理成一条线',
    description: '汇总资料、标记节点，让团队知道已经做到哪里、下一步做什么。',
  },
  'team-experiment': {
    id: 'team-experiment',
    title: '和伙伴完成一次小尝试',
    description: '从能做的小步骤开始，边试边记录，再一起调整方案。',
  },
  'project-expression': {
    id: 'project-expression',
    title: '把一个项目说清楚',
    description: '梳理重点，用图、文字或短片让更多人看懂项目在解决什么问题。',
  },
}

const starterTasks: Record<string, StarterTask> = {
  'organize-clues': {
    id: 'organize-clues',
    title: '整理一页线索',
    description: '把看到的现象、照片和问题按顺序放在一页纸上。',
  },
  'record-an-event': {
    id: 'record-an-event',
    title: '记录一次现场',
    description: '用三张照片和三句话记下发生了什么、谁在参与、下一步是什么。',
  },
  'ask-one-question': {
    id: 'ask-one-question',
    title: '问清一个问题',
    description: '找一位参与者，问清他正在做什么、为什么做以及遇到了什么困难。',
  },
  'make-a-small-map': {
    id: 'make-a-small-map',
    title: '画一张行动小地图',
    description: '写下时间、伙伴和第一步，把一个模糊想法变成可开始的安排。',
  },
  'share-one-finding': {
    id: 'share-one-finding',
    title: '讲清一个发现',
    description: '选一种顺手的方式，把今天发现的问题讲给一位同学听。',
  },
}

const fallbackTraits = [
  traits['reads-the-scene'],
  traits['asks-before-acting'],
  traits['turns-ideas-visible'],
]

const fallbackScenes = [researchScenes['field-research'], researchScenes['team-experiment']]

const fallbackTasks = [
  starterTasks['record-an-event'],
  starterTasks['ask-one-question'],
  starterTasks['make-a-small-map'],
]

function takeUnique<T extends { id: string }>(
  candidates: T[],
  count: number,
  fallbacks: T[],
): T[] {
  const unique = new Map<string, T>()

  for (const item of [...candidates, ...fallbacks]) {
    unique.set(item.id, item)
    if (unique.size === count) break
  }

  return [...unique.values()]
}

function collectProfileCandidates(signals: JourneySignals): ProfileCandidates {
  const candidates: ProfileCandidates = {
    traits: [],
    researchScenes: [],
    starterTasks: [],
  }

  if (signals.observation.includes('detail')) {
    candidates.traits.push(traits['notices-details'])
  }
  if (signals.observation.includes('people')) {
    candidates.traits.push(traits['cares-about-people'])
  }
  if (signals.observation.includes('place')) {
    candidates.traits.push(traits['reads-the-scene'])
  }

  if (signals.clues.includes('event-image')) {
    candidates.researchScenes.push(researchScenes['field-research'])
    candidates.starterTasks.push(starterTasks['record-an-event'])
  }
  if (signals.clues.includes('project-record')) {
    candidates.researchScenes.push(researchScenes['project-tracking'])
    candidates.starterTasks.push(starterTasks['organize-clues'])
  }
  if (signals.clues.includes('beginner-note')) {
    candidates.starterTasks.push(starterTasks['ask-one-question'])
  }

  if (signals.dialogue) {
    candidates.traits.push(traits['asks-before-acting'])
  }
  if (signals.route.partner === 'peer' || signals.route.partner === 'team') {
    candidates.traits.push(traits['moves-with-others'])
    candidates.researchScenes.push(researchScenes['team-experiment'])
  }
  if (signals.route.approach === 'research-first') {
    candidates.researchScenes.push(researchScenes['field-research'])
  }
  if (signals.route.time && signals.route.partner && signals.route.approach) {
    candidates.starterTasks.push(starterTasks['make-a-small-map'])
  }
  if (signals.expression) {
    candidates.traits.push(traits['turns-ideas-visible'])
    candidates.researchScenes.push(researchScenes['project-expression'])
    candidates.starterTasks.push(starterTasks['share-one-finding'])
  }

  return candidates
}

export function buildActionProfile(signals: JourneySignals): ActionProfile {
  const candidates = collectProfileCandidates(signals)

  return {
    traits: takeUnique(candidates.traits, 3, fallbackTraits),
    researchScenes: takeUnique(candidates.researchScenes, 2, fallbackScenes),
    starterTasks: takeUnique(candidates.starterTasks, 3, fallbackTasks),
  }
}
