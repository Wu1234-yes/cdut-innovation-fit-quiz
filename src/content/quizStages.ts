export const quizStages = [
  {
    id: 'observe',
    label: '观察',
    range: [0, 5],
    signal: '读取你的判断方式',
  },
  {
    id: 'collaborate',
    label: '协作',
    range: [6, 11],
    signal: '识别你的合作偏好',
  },
  {
    id: 'execute',
    label: '执行',
    range: [12, 17],
    signal: '记录你的推进节奏',
  },
  {
    id: 'express',
    label: '表达',
    range: [18, 24],
    signal: '完成你的科创画像',
  },
] as const

export const quizStageForQuestion = (questionIndex: number) =>
  quizStages.find(
    ({ range }) => questionIndex >= range[0] && questionIndex <= range[1],
  ) ?? quizStages[quizStages.length - 1]
