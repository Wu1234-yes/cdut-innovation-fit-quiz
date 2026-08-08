import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { departmentArchives } from '../content/departmentArchives'
import { DepartmentAtlas } from './DepartmentAtlas'

afterEach(cleanup)

describe('DepartmentAtlas', () => {
  it('lists all seven departments and the recruitment group number', () => {
    render(
      <DepartmentAtlas
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenDepartment={vi.fn()}
      />,
    )

    expect(screen.getAllByRole('button', { name: /查看.*档案/ })).toHaveLength(7)
    expect(screen.getByTestId('cosmic-scene-stage')).toHaveAttribute('data-world', 'atlas')
    expect(screen.getByText('QQ群：723526608')).toBeVisible()
  })

  it('opens the selected department and supports keyboard focus', () => {
    const onOpenDepartment = vi.fn()
    render(
      <DepartmentAtlas
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenDepartment={onOpenDepartment}
      />,
    )

    const publicity = screen.getByRole('button', { name: '查看宣传部档案' })
    publicity.focus()
    expect(publicity).toHaveFocus()
    fireEvent.click(publicity)
    fireEvent.click(screen.getByRole('button', { name: '打开宣传部完整档案' }))
    expect(onOpenDepartment).toHaveBeenCalledWith('publicity')
  })
})
