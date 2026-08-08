import type { ProjectRecord } from './types'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`.replace(/\/+/g, '/')

export const projects: ProjectRecord[] = [
  {
    id: 'project-line',
    archiveCode: 'FILM 08 / TRACK',
    title: '把项目进展整理成一条线',
    description: '从周表和问题清单里找到卡点，再联系团队确认下一步。',
    media: {
      src: asset('departments/project/gallery-3-640.webp'),
      alt: '项目团队的微信沟通截图，记录阶段任务完成与评审文件回传',
      objectPosition: '50% 28%',
    },
    departmentId: 'project',
    screeningPriority: 7,
  },
  {
    id: 'event-record',
    archiveCode: 'FILM 02 / RECORD',
    title: '把一次现场变成完整记录',
    description: '拍下关键人物与过程，再把照片、信息和文字整理成稿。',
    media: {
      src: asset('departments/publicity/gallery-1-640.webp'),
      alt: '同学在课堂活动现场拍摄讲台和参与者并记录内容',
      objectPosition: '50% 45%',
    },
    departmentId: 'publicity',
    screeningPriority: 1,
  },
  {
    id: 'material-check',
    archiveCode: 'FILM 03 / VERIFY',
    title: '让一套参赛材料准确可查',
    description: '按赛道分类、核对信息，再把专家反馈逐项送回团队。',
    media: {
      src: asset('departments/competition/gallery-3-640.webp'),
      alt: '培训现场的屏幕展示赛事材料要求，参与者正在听讲',
      objectPosition: '50% 45%',
    },
    departmentId: 'competition',
    screeningPriority: 2,
  },
  {
    id: 'roadshow-training',
    archiveCode: 'FILM 04 / REHEARSE',
    title: '陪团队完成一次模拟路演',
    description: '记录表达和节奏问题，调整后再练一轮，直到现场更稳。',
    media: {
      src: asset('departments/training/gallery-3-640.webp'),
      alt: '科创交流活动中学生团队围绕项目展示和训练进行讨论',
      objectPosition: '50% 50%',
    },
    departmentId: 'training',
    screeningPriority: 3,
  },
  {
    id: 'method-workshop',
    archiveCode: 'FILM 05 / METHOD',
    title: '把复杂方法拆成一堂训练',
    description: '从真实问题出发，把写作、制图或工具用法拆成可练的小步。',
    media: {
      src: asset('departments/science/gallery-1-640.webp'),
      alt: '教室里正在开展科研方法与技能训练，讲台和学生清晰可见',
      objectPosition: '50% 42%',
    },
    departmentId: 'science',
    screeningPriority: 4,
  },
  {
    id: 'expression-polish',
    archiveCode: 'FILM 06 / SPEAK',
    title: '把一个项目讲得更清楚',
    description: '先看懂项目，再梳理话术，通过限时问答找出表达断点。',
    media: {
      src: asset('departments/language/gallery-3-640.webp'),
      alt: '课堂内的学生围坐交流，正在进行表达训练和模拟问答',
      objectPosition: '50% 52%',
    },
    departmentId: 'language',
    screeningPriority: 5,
  },
  {
    id: 'event-support',
    archiveCode: 'FILM 07 / SUPPORT',
    title: '让一场活动按计划落地',
    description: '提前核对人员、物资和节点，现场补位，结束后完成归档。',
    media: {
      src: asset('departments/office/gallery-1-640.webp'),
      alt: '室外活动点位上学生成员承担咨询接待和现场保障工作',
      objectPosition: '50% 50%',
    },
    departmentId: 'office',
    screeningPriority: 6,
  },
  {
    id: 'team-consultation',
    archiveCode: 'FILM 01 / CONSULT',
    title: '从一次交流找到选题方向',
    description: '把现实问题、团队能力和可用资源放在一起，缩小选题范围。',
    media: {
      src: asset('departments/project/gallery-1-640.webp'),
      alt: '创新创业交流活动现场，多名学生围绕项目方向进行交流',
      objectPosition: '50% 48%',
    },
    departmentId: 'project',
    screeningPriority: 0,
  },
]
