import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { departmentArchives } from '../content/departmentArchives'
import { DepartmentArchive } from './DepartmentArchive'

describe('DepartmentArchive', () => {
  it('labels the report return path clearly when opened from a recommendation', () => {
    render(
      <DepartmentArchive
        department={departmentArchives[0]}
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenDepartment={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '返回试航报告' })).toBeInTheDocument()
  })
})
