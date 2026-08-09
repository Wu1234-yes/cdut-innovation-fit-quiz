import type { ProjectRecord } from './types'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`.replace(/\/+/g, '/')

export const projects: ProjectRecord[] = [
  {
    id: 'project-line',
    archiveCode: 'FILM 08 / TRACK',
    title: '完成科技立项结题回访',
    description: '整理结题材料、回访项目进展，并从中筛选值得继续培育的项目。',
    media: {
      src: asset('departments/project/gallery-1-640.webp'),
      alt: '项目部完成科技立项结题工作后与参与同学合影',
      objectPosition: '50% 48%',
    },
    departmentId: 'project',
    screeningPriority: 7,
  },
  {
    id: 'event-record',
    archiveCode: 'FILM 02 / RECORD',
    title: '记录省级赛事现场',
    description: '随队收集赛事照片和现场信息，整理成后续宣传所需的真实素材。',
    media: {
      src: asset('departments/publicity/gallery-1-640.webp'),
      alt: '宣传部参与挑战杯四川省决赛相关宣传工作并在现场合影',
      objectPosition: '50% 50%',
    },
    departmentId: 'publicity',
    screeningPriority: 1,
  },
  {
    id: 'material-check',
    archiveCode: 'FILM 03 / VERIFY',
    title: '开展省赛阶段审核',
    description: '核对项目材料与专利信息，把评审反馈及时送回参赛团队。',
    media: {
      src: asset('departments/competition/gallery-3-640.webp'),
      alt: '挑战杯省赛阶段的项目展示与材料审核现场',
      objectPosition: '50% 45%',
    },
    departmentId: 'competition',
    screeningPriority: 2,
  },
  {
    id: 'selection-consultation',
    archiveCode: 'FILM 04 / REHEARSE',
    title: '推进大挑选题咨询',
    description: '围绕选题咨询和项目跟踪开展研讨，汇总团队问题与下一步安排。',
    media: {
      src: asset('departments/training/gallery-3-640.webp'),
      alt: '赛训部汇报材料中的科创引领与项目培养工作研讨现场',
      objectPosition: '50% 50%',
    },
    departmentId: 'training',
    screeningPriority: 3,
  },
  {
    id: 'paper-competition',
    archiveCode: 'FILM 05 / METHOD',
    title: '组织科技论文大赛征集',
    description: '完成前期宣传与作品收集，为后续评审和能力训练做好准备。',
    media: {
      src: asset('departments/science/gallery-1-640.webp'),
      alt: '科素部开展科技论文大赛前期宣传和作品征集',
      objectPosition: '50% 42%',
    },
    departmentId: 'science',
    screeningPriority: 4,
  },
  {
    id: 'welcome-exchange',
    archiveCode: 'FILM 06 / SPEAK',
    title: '搭建新生交流场景',
    description: '通过迎新交流帮助新成员熟悉彼此，感受部门氛围并融入集体。',
    media: {
      src: asset('departments/language/gallery-3-640.webp'),
      alt: '语培部开展迎新交流活动后与新成员合影',
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
      src: asset('departments/office/gallery-2-640.webp'),
      alt: '办公室在室外活动点位承担咨询接待和现场保障工作',
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
