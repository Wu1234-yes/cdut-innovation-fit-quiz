import type { ActionDimension, StationAnswer, StationId } from '../app/voyageReducer'

export interface StationChoice {
  id: string
  label: string
  detail: string
  feedback: string
  weights: Partial<Record<ActionDimension, number>>
}

export interface StationDefinition {
  id: StationId
  number: string
  eyebrow: string
  title: string
  prompt: string
  instruction: string
  video: string
  mobileVideo: string
  poster: string
  accent: string
  choices: StationChoice[]
}

const media = (name: string) => `/media/night-voyage/${name}`

export const stations: StationDefinition[] = [
  {
    id: 'observation',
    number: '01',
    eyebrow: 'OBSERVE / 拆解台',
    title: '先找出，事情真正卡在哪里。',
    prompt: '一张活动现场照片里信息很多，你第一眼会追哪条线索？',
    instruction: '点亮一条你最想继续看的线索。',
    video: media('reference-motion13-desktop.mp4'),
    mobileVideo: media('reference-motion13-mobile.mp4'),
    poster: media('reference-motion13.jpg'),
    accent: '#79e4d0',
    choices: [
      { id: 'pattern', label: '找重复出现的细节', detail: '人、物、动作里藏着问题', feedback: '你先抓住了现场里反复出现的信号。', weights: { observation: 3, progress: 1 } },
      { id: 'people', label: '看谁正在做什么', detail: '角色和分工会说话', feedback: '你先从参与者的动作里读出了线索。', weights: { observation: 2, collaboration: 2 } },
      { id: 'place', label: '看环境哪里不对', detail: '场景往往暴露真实限制', feedback: '你先注意到环境给行动带来的限制。', weights: { observation: 3, handsOn: 1 } },
    ],
  },
  {
    id: 'experiment',
    number: '02',
    eyebrow: 'TRY / 试错舱',
    title: '别等完美方案，先让它动起来。',
    prompt: '你有三个想法，但时间只够做一个小尝试。',
    instruction: '把你愿意先试的模块送入实验舱。',
    video: media('reference-background5-desktop.mp4'),
    mobileVideo: media('reference-background5-mobile.mp4'),
    poster: media('reference-background5.jpg'),
    accent: '#b9ef74',
    choices: [
      { id: 'prototype', label: '先做一个最小版本', detail: '哪怕只能验证一个环节', feedback: '你选择先让想法获得一次真实反馈。', weights: { handsOn: 3, observation: 1 } },
      { id: 'compare', label: '先列出方案差异', detail: '知道为什么选它', feedback: '你先把选择依据摆在了桌面上。', weights: { observation: 2, progress: 2 } },
      { id: 'ask', label: '先找人一起试', detail: '边做边交换视角', feedback: '你把一次试错变成了共同实验。', weights: { collaboration: 3, handsOn: 1 } },
    ],
  },
  {
    id: 'collaboration',
    number: '03',
    eyebrow: 'CONNECT / 协作站',
    title: '一个人想得快，一群人走得远。',
    prompt: '队友带来三种不同的说法，你会先回应哪一句？',
    instruction: '接通一条能让问题更清楚的信号。',
    video: media('reference-fluid-motion-desktop.mp4'),
    mobileVideo: media('reference-fluid-motion-mobile.mp4'),
    poster: media('reference-fluid-motion.jpg'),
    accent: '#f4bf68',
    choices: [
      { id: 'clarify', label: '我们先把问题说准', detail: '同一件事先用同一句话描述', feedback: '你会先搭一座让大家都能站上去的桥。', weights: { collaboration: 3, expression: 1 } },
      { id: 'invite', label: '把不同意见都留下', detail: '差异可能带来新方向', feedback: '你给不同声音留出了继续生长的位置。', weights: { collaboration: 3, observation: 1 } },
      { id: 'divide', label: '先把任务分开', detail: '每个人先认领一小步', feedback: '你会把协作变成可以马上行动的分工。', weights: { collaboration: 2, progress: 2 } },
    ],
  },
  {
    id: 'progress',
    number: '04',
    eyebrow: 'MOVE / 推进轨道',
    title: '把“想做”变成下一步。',
    prompt: '项目进入最容易拖延的阶段，你会先安排什么？',
    instruction: '把节点拖到一条能走通的短航线。',
    video: media('reference-neon-pulse-desktop.mp4'),
    mobileVideo: media('reference-neon-pulse-mobile.mp4'),
    poster: media('reference-neon-pulse.jpg'),
    accent: '#ff8d7a',
    choices: [
      { id: 'milestone', label: '写下今天能交付的东西', detail: '小到一页记录也算', feedback: '你把远方目标拉回了今天的轨道。', weights: { progress: 3, observation: 1 } },
      { id: 'calendar', label: '先排清时间和负责人', detail: '让每个节点有落点', feedback: '你会先让计划拥有清晰的时间坐标。', weights: { progress: 3, collaboration: 1 } },
      { id: 'blocker', label: '先解决最大的卡点', detail: '不绕开真正的问题', feedback: '你会优先处理最影响后续的那颗障碍。', weights: { progress: 2, handsOn: 2 } },
    ],
  },
  {
    id: 'expression',
    number: '05',
    eyebrow: 'SHOW / 放映舱',
    title: '让别人一眼看懂，你做的事有何意义。',
    prompt: '同一个成果要面对不同的人，你会先换哪种呈现方式？',
    instruction: '选择一束能把成果照亮的光。',
    video: media('reference-dark-matter-desktop.mp4'),
    mobileVideo: media('reference-dark-matter-mobile.mp4'),
    poster: media('reference-dark-matter.jpg'),
    accent: '#80b8ff',
    choices: [
      { id: 'story', label: '用三句话讲清来龙去脉', detail: '问题、行动、结果', feedback: '你知道好表达要给听众一条清楚的路。', weights: { expression: 3, observation: 1 } },
      { id: 'visual', label: '先让一张图说话', detail: '把复杂关系变得可见', feedback: '你会用视觉把复杂关系压缩成一眼可读。', weights: { expression: 3, handsOn: 1 } },
      { id: 'live', label: '带大家现场体验一下', detail: '让成果被亲自感受到', feedback: '你愿意把成果变成一次有参与感的现场。', weights: { expression: 2, collaboration: 2 } },
    ],
  },
]

export const toStationAnswer = (station: StationDefinition, choice: StationChoice): StationAnswer => ({
  stationId: station.id,
  choiceId: choice.id,
  weights: choice.weights,
})
