import type {
  DepartmentId,
  DepartmentPoints,
  DimensionId,
  DimensionPoints,
  PreferenceQuestionOption,
  Question,
  ScenarioQuestionOption,
} from './types'

const dimensionPoints = (dimension: DimensionId): DimensionPoints => ({
  expression: dimension === 'expression' ? 2 : 0,
  analysis: dimension === 'analysis' ? 2 : 0,
  execution: dimension === 'execution' ? 2 : 0,
  adaptation: dimension === 'adaptation' ? 2 : 0,
})

const departmentPoints = (
  primary: DepartmentId,
  related: DepartmentId,
): DepartmentPoints => ({
  office: primary === 'office' ? 2 : related === 'office' ? 1 : 0,
  project: primary === 'project' ? 2 : related === 'project' ? 1 : 0,
  competition:
    primary === 'competition' ? 2 : related === 'competition' ? 1 : 0,
  training: primary === 'training' ? 2 : related === 'training' ? 1 : 0,
  science: primary === 'science' ? 2 : related === 'science' ? 1 : 0,
  publicity:
    primary === 'publicity' ? 2 : related === 'publicity' ? 1 : 0,
  language: primary === 'language' ? 2 : related === 'language' ? 1 : 0,
})

const preferenceOption = (
  id: string,
  label: string,
  dimension: DimensionId,
): PreferenceQuestionOption => ({
  id,
  label,
  dimension,
  points: dimensionPoints(dimension),
})

const scenarioOption = (
  id: string,
  label: string,
  primary: DepartmentId,
  related: DepartmentId,
): ScenarioQuestionOption => ({
  id,
  label,
  primary,
  related,
  points: departmentPoints(primary, related),
})

export const questions: ReadonlyArray<Question> = [
  {
    id: 'p01',
    type: 'preference',
    prompt: '接触一份完全陌生的材料时，你更倾向先做什么？',
    options: [
      preferenceOption('p01-a', '先用自己的话概括内容，确认能把核心意思讲清楚。', 'expression'),
      preferenceOption('p01-b', '先拆解材料结构，找出关键概念和它们之间的关系。', 'analysis'),
    ],
  },
  {
    id: 'p02',
    type: 'preference',
    prompt: '参与一项活动筹备时，你通常会先从哪一步开始？',
    options: [
      preferenceOption('p02-a', '先向伙伴说明目标和重点，让大家形成一致理解。', 'expression'),
      preferenceOption('p02-b', '先列出任务清单和时间节点，马上推动具体事项。', 'execution'),
    ],
  },
  {
    id: 'p03',
    type: 'preference',
    prompt: '团队讨论持续推进时，哪种表现更接近你？',
    options: [
      preferenceOption('p03-a', '主动归纳各方观点，并清楚表达自己的判断。', 'expression'),
      preferenceOption('p03-b', '观察现场反应，随时调整参与方式和讨论节奏。', 'adaptation'),
    ],
  },
  {
    id: 'p04',
    type: 'preference',
    prompt: '面对一批待处理材料时，你更可能怎么做？',
    options: [
      preferenceOption('p04-a', '先判断材料之间的关联和优先级，再安排处理顺序。', 'analysis'),
      preferenceOption('p04-b', '先从要求明确的部分着手，边完成边更新进度。', 'execution'),
    ],
  },
  {
    id: 'p05',
    type: 'preference',
    prompt: '工作中突然出现意外情况时，你的第一反应更接近哪一种？',
    options: [
      preferenceOption('p05-a', '快速判断影响范围，找出导致问题的关键因素。', 'analysis'),
      preferenceOption('p05-b', '先稳住当前局面，再根据新情况灵活调整安排。', 'adaptation'),
    ],
  },
  {
    id: 'p06',
    type: 'preference',
    prompt: '临近截止时间但仍有多项任务时，你会优先怎么处理？',
    options: [
      preferenceOption('p06-a', '按既定优先级集中完成关键任务，确保按时交付。', 'execution'),
      preferenceOption('p06-b', '根据剩余时间和资源变化，及时重排任务方案。', 'adaptation'),
    ],
  },
  {
    id: 'p07',
    type: 'preference',
    prompt: '学习一个复杂知识点时，哪种方式对你更有效？',
    options: [
      preferenceOption('p07-a', '画出概念层级和逻辑链条，逐步定位理解难点。', 'analysis'),
      preferenceOption('p07-b', '尝试把它讲给别人听，用表达检验自己是否真正理解。', 'expression'),
    ],
  },
  {
    id: 'p08',
    type: 'preference',
    prompt: '准备展示一项任务成果时，你最先关注什么？',
    options: [
      preferenceOption('p08-a', '逐项核对完成情况和交付要求，补齐尚未落实的内容。', 'execution'),
      preferenceOption('p08-b', '梳理成果亮点和叙述顺序，让信息更容易被理解。', 'expression'),
    ],
  },
  {
    id: 'p09',
    type: 'preference',
    prompt: '参与多人合作任务时，你更自然的做法是哪一种？',
    options: [
      preferenceOption('p09-a', '根据伙伴状态及时补位，在变化中保持整体协作。', 'adaptation'),
      preferenceOption('p09-b', '主动说明分工衔接和当前进展，减少信息偏差。', 'expression'),
    ],
  },
  {
    id: 'p10',
    type: 'preference',
    prompt: '收到一份结构混乱的文件时，你更愿意先做什么？',
    options: [
      preferenceOption('p10-a', '立即整理命名、格式和目录，使文件可以继续使用。', 'execution'),
      preferenceOption('p10-b', '识别信息类别和逻辑关系，重新搭建清晰框架。', 'analysis'),
    ],
  },
  {
    id: 'p11',
    type: 'preference',
    prompt: '讨论陷入僵局时，你通常会怎样推动进展？',
    options: [
      preferenceOption('p11-a', '换一种讨论方式或切入角度，帮助大家重新找到共识。', 'adaptation'),
      preferenceOption('p11-b', '找出分歧背后的前提和证据，判断真正卡点。', 'analysis'),
    ],
  },
  {
    id: 'p12',
    type: 'preference',
    prompt: '任务条件在执行中发生变化时，你更可能如何应对？',
    options: [
      preferenceOption('p12-a', '重新评估资源和限制，选择更适合当前条件的路径。', 'adaptation'),
      preferenceOption('p12-b', '迅速更新行动清单，按新要求继续推进具体事项。', 'execution'),
    ],
  },
  {
    id: 's01',
    type: 'scenario',
    prompt: '一场大型活动即将启动筹备，你最想承担哪类工作？',
    options: [
      scenarioOption('s01-c', '围绕岗位分工组织演练，训练讲解、接待和临场应答。', 'training', 'language'),
      scenarioOption('s01-b', '把目标拆成里程碑，审核关键方案与技术材料，持续跟进各环节进度。', 'project', 'science'),
      scenarioOption('s01-a', '建立总台账，统筹人员、物资、场地和时间节点，并跟进现场衔接。', 'office', 'competition'),
      scenarioOption('s01-d', '提炼活动主线，规划预热、现场记录与后续报道，并统一表达口径。', 'publicity', 'language'),
    ],
  },
  {
    id: 's02',
    type: 'scenario',
    prompt: '重要材料即将截止提交，你最愿意负责哪一部分？',
    options: [
      scenarioOption('s02-c', '安排内部审核与修改节点，对照申报要求推进最终提交。', 'project', 'competition'),
      scenarioOption('s02-a', '汇总最新版本，建立提交清单和归档规则，并逐项确认责任人与状态。', 'office', 'project'),
      scenarioOption('s02-d', '组织提交前模拟陈述，帮助成员打磨讲解并处理追问。', 'language', 'training'),
      scenarioOption('s02-b', '核查论证、数据来源和书写规范，确保关键内容准确完整。', 'science', 'project'),
    ],
  },
  {
    id: 's03',
    type: 'scenario',
    prompt: '活动当天需要多人协同，你更想站在哪个位置？',
    options: [
      scenarioOption('s03-a', '按流程调度签到、候场和现场环节，同时协调物资与人员信息。', 'competition', 'office'),
      scenarioOption('s03-c', '陪同展示人员完成讲解和互动，遇到临场问题及时提示调整。', 'language', 'training'),
      scenarioOption('s03-b', '跟随现场节奏采集图文素材，及时记录亮点并配合重要环节。', 'publicity', 'competition'),
      scenarioOption('s03-d', '为参与成员提供现场辅导，快速判断展示中的技术问题并给出建议。', 'training', 'science'),
    ],
  },
  {
    id: 's04',
    type: 'scenario',
    prompt: '需要向同学介绍一项科创内容，你更想采用哪种准备方式？',
    options: [
      scenarioOption('s04-b', '提炼易懂的传播主线，用图文或短视频把专业内容讲得有吸引力。', 'publicity', 'language'),
      scenarioOption('s04-c', '设计口头讲解与互动环节，并带领主讲人反复演练表达。', 'language', 'training'),
      scenarioOption('s04-a', '查证背景资料和关键原理，按问题脉络组织严谨的内容框架。', 'science', 'project'),
      scenarioOption('s04-d', '整理来源文件、联系信息和推进节点，保证准备过程有序衔接。', 'office', 'project'),
    ],
  },
  {
    id: 's05',
    type: 'scenario',
    prompt: '团队对下一步方案产生分歧时，你更愿意如何介入？',
    options: [
      scenarioOption('s05-d', '先复述各方观点，调整沟通方式并提炼大家都能接受的表达。', 'language', 'publicity'),
      scenarioOption('s05-b', '回到数据、文献和技术条件，用证据比较不同方案的可行性。', 'science', 'project'),
      scenarioOption('s05-a', '重新明确目标、交付物和分工边界，形成可跟进的行动计划。', 'project', 'office'),
      scenarioOption('s05-c', '对照实际流程和时间限制评估方案，推动形成可执行的统一安排。', 'competition', 'office'),
    ],
  },
  {
    id: 's06',
    type: 'scenario',
    prompt: '一项工作结束后需要整理成果，你最想完成哪类产出？',
    options: [
      scenarioOption('s06-b', '对照目标复盘成效，分析方法与证据，沉淀可复用的推进经验。', 'project', 'science'),
      scenarioOption('s06-a', '汇总数据、名单和过程材料，建立清晰档案并完成结果报送。', 'office', 'competition'),
      scenarioOption('s06-d', '把典型经验转化为案例课程，设计讲解和练习供伙伴学习。', 'training', 'language'),
      scenarioOption('s06-c', '梳理关键流程、执行节点和现场反馈，形成后续优化清单。', 'competition', 'office'),
    ],
  },
  {
    id: 's07',
    type: 'scenario',
    prompt: '准备一次内部培训时，你最愿意主讲哪个方向？',
    options: [
      scenarioOption('s07-a', '讲解研究方法、资料检索和技术规范，并安排针对性练习。', 'science', 'training'),
      scenarioOption('s07-c', '讲解素材采集、内容策划和活动报道，并结合真实流程演示。', 'publicity', 'competition'),
      scenarioOption('s07-b', '讲解活动流程、岗位协同和现场处置，并示范台账使用。', 'competition', 'office'),
      scenarioOption('s07-d', '讲解演示结构、口头表达和问答技巧，并组织模拟训练。', 'language', 'training'),
    ],
  },
  {
    id: 's08',
    type: 'scenario',
    prompt: '突然获得两小时自由工作时间，你更想主动做什么？',
    options: [
      scenarioOption('s08-a', '梳理近期文件和待办，更新共享信息，整理近期进展并补充记录。', 'office', 'publicity'),
      scenarioOption('s08-c', '制作一份可复用的学习资料，把实践经验整理成清晰教程。', 'training', 'publicity'),
      scenarioOption('s08-d', '围绕近期成果策划一篇科创内容，核实信息后完成图文初稿。', 'publicity', 'science'),
      scenarioOption('s08-b', '梳理后续任务与里程碑，把近期进展整理成便于协作的简报。', 'project', 'publicity'),
    ],
  },
]
