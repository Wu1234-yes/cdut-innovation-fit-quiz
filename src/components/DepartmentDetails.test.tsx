import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { departments } from '../content/departments'
import { DepartmentDetails } from './DepartmentDetails'

describe('DepartmentDetails documentary view', () => {
  afterEach(cleanup)

  it.each(departments)('shows verified content and field images for $name', (department) => {
    render(
      <DepartmentDetails
        onBack={vi.fn()}
        onOpenDepartment={vi.fn()}
        selectedDepartmentId={department.id}
      />,
    )

    const hero = screen.getByTestId('department-hero')
    expect(within(hero).getByRole('img', { name: department.hero.alt })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: department.name })).toHaveFocus()

    for (const responsibility of department.responsibilities) {
      expect(screen.getByText(responsibility)).toBeInTheDocument()
    }
    for (const step of department.workflow) {
      expect(screen.getByText(step.title)).toBeInTheDocument()
    }
    for (const gain of department.gains) {
      expect(screen.getByText(gain)).toBeInTheDocument()
    }
    for (const stat of department.stats) {
      expect(screen.getAllByText(`${stat.value}${stat.suffix}`).length).toBeGreaterThan(0)
    }

    expect(screen.getAllByTestId('evidence-image')).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /查看.+详情/ })).toHaveLength(2)
  })

  it('opens a related department without returning to the result page', async () => {
    const onOpenDepartment = vi.fn()
    const department = departments[0]
    render(
      <DepartmentDetails
        onBack={vi.fn()}
        onOpenDepartment={onOpenDepartment}
        selectedDepartmentId={department.id}
      />,
    )

    const related = departments.find(({ id }) => id === department.related[0])!
    await userEvent.click(screen.getByRole('button', { name: `查看${related.name}详情` }))
    expect(onOpenDepartment).toHaveBeenCalledWith(related.id)
  })
})
