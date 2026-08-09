import type { ProjectRecord } from './types'
import type { DepartmentId } from './types'

export interface ScreeningFrame {
  id: string
  act: 'ACT 01' | 'ACT 02' | 'ACT 03'
  departmentId: DepartmentId
  departmentName: string
  sceneLabel: string
  action: string
  startHere: string
  project: ProjectRecord
}

export const screeningFrames = (projects: ProjectRecord[]): ScreeningFrame[] => {
  const byId = (id: string) => projects.find((project) => project.id === id) ?? projects[0]
  return [
    {
      id: 'project-action', act: 'ACT 01', departmentId: 'project', departmentName: '项目部', sceneLabel: '结题回访',
      action: '整理科技立项结题材料，回访项目进展，并筛选值得继续培育的项目。',
      startHere: '新生可以先整理一份周表，标出一个需要继续追问的卡点。', project: byId('project-line'),
    },
    {
      id: 'science-action', act: 'ACT 01', departmentId: 'science', departmentName: '科素部', sceneLabel: '作品征集',
      action: '开展科技论文大赛前期宣传与作品收集，为后续评审做好准备。',
      startHere: '新生可以先学会核对一份作品信息和提交要求。', project: byId('paper-competition'),
    },
    {
      id: 'office-action', act: 'ACT 02', departmentId: 'office', departmentName: '办公室', sceneLabel: '活动保障',
      action: '核对人员、物资和时间节点，让活动按计划落地。',
      startHere: '新生可以跟着一次活动，把清单逐项核对一遍。', project: byId('event-support'),
    },
    {
      id: 'competition-action', act: 'ACT 02', departmentId: 'competition', departmentName: '竞赛部', sceneLabel: '省赛审核',
      action: '核对项目材料、专利信息和评审反馈，为参赛团队提供现场支持。',
      startHere: '新生可以先学会按赛道整理一份材料清单。', project: byId('material-check'),
    },
    {
      id: 'training-action', act: 'ACT 02', departmentId: 'training', departmentName: '赛训部', sceneLabel: '选题研讨',
      action: '围绕“大挑”选题咨询和项目跟踪开展研讨，汇总团队问题与下一步安排。',
      startHere: '新生可以先整理一次讨论中的问题和待办事项。', project: byId('selection-consultation'),
    },
    {
      id: 'publicity-action', act: 'ACT 03', departmentId: 'publicity', departmentName: '宣传部', sceneLabel: '现场记录',
      action: '拍摄活动现场并整理图文素材，让真实行动被看见。',
      startHere: '新生可以用三张照片和三句话记录一次活动。', project: byId('event-record'),
    },
    {
      id: 'language-action', act: 'ACT 03', departmentId: 'language', departmentName: '语培部', sceneLabel: '迎新交流',
      action: '搭建轻松的交流场景，帮助新成员熟悉彼此并融入部门。',
      startHere: '新生可以先参加一次交流活动，认识一位新伙伴。', project: byId('welcome-exchange'),
    },
  ]
}
