import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { departmentArchives } from '../content/departmentArchives'
import { DepartmentArchive } from './DepartmentArchive'

afterEach(cleanup)

describe('DepartmentArchive', () => {
  it('shows real work, workflow, outcomes, field images, and a starter action', () => {
    const department = departmentArchives.find(({ id }) => id === 'publicity')!
    render(
      <DepartmentArchive
        department={department}
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenDepartment={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: '宣传部' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '你会参与的工作' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '一项任务如何推进' })).toBeVisible()
    expect(screen.getAllByTestId('responsibility-track-item')).toHaveLength(
      department.responsibilities.length,
    )
    expect(screen.getByText('FIELD UNIT ONLINE')).toBeVisible()
    expect(screen.getAllByTestId('workflow-step')).toHaveLength(5)
    expect(screen.getAllByRole('img', { name: /宣传部/ }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('用三张照片和三句话，记录一次正在发生的活动。')).toBeVisible()
    expect(screen.getByRole('img', { name: '科创招新交流群二维码' })).toHaveAttribute(
      'loading',
      'lazy',
    )
    expect(screen.getByText('QQ群：723526608')).toBeVisible()
    expect(screen.getByRole('button', { name: '上一个部门' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '下一个部门' })).toBeEnabled()
  })

  it('lets readers focus different work and workflow nodes', () => {
    const department = departmentArchives.find(({ id }) => id === 'project')!
    render(
      <DepartmentArchive
        department={department}
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenDepartment={vi.fn()}
      />,
    )

    const workItems = screen.getAllByTestId('responsibility-track-item')
    expect(workItems[0]).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(workItems[1])
    expect(workItems[1]).toHaveAttribute('aria-pressed', 'true')

    const workflow = screen.getAllByTestId('workflow-step')
    fireEvent.click(workflow[2])
    expect(workflow[2]).toHaveAttribute('data-active', 'true')
  })

  it('keeps archive language open and offers related archives', () => {
    const department = departmentArchives.find(({ id }) => id === 'science')!
    const { container } = render(
      <DepartmentArchive
        department={department}
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenDepartment={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '打开项目部档案' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '打开宣传部档案' })).toBeEnabled()
    expect(container.textContent).not.toMatch(/最适合|匹配度|部门排名|人格类型/)
  })

  it('uses the atlas-specific return control when opened from the atlas', () => {
    render(
      <DepartmentArchive
        department={departmentArchives[0]}
        departments={departmentArchives}
        onBack={vi.fn()}
        onBackToAtlas={vi.fn()}
        onOpenDepartment={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '返回部门总览' })).toBeEnabled()
  })
})
