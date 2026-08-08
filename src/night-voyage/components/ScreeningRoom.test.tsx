import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { departmentArchives } from '../content/departmentArchives'
import { projects } from '../content/projects'
import { ScreeningRoom } from './ScreeningRoom'

afterEach(cleanup)

describe('ScreeningRoom', () => {
  it('shows one action film without revealing its department first', () => {
    render(
      <ScreeningRoom
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenAtlas={vi.fn()}
        onOpenDepartment={vi.fn()}
        projects={projects}
      />,
    )

    expect(screen.getByRole('heading', { name: '科创放映舱' })).toBeVisible()
    expect(screen.getByTestId('film-reel')).toBeVisible()
    expect(screen.getByText('FILM 01 / CONSULT')).toBeVisible()
    expect(screen.getByRole('heading', { name: '从一次交流找到选题方向' })).toBeVisible()
    expect(screen.getByRole('img', { name: /创新创业交流活动现场/ })).toHaveAttribute(
      'loading',
      'lazy',
    )
    expect(screen.getAllByTestId('projection-panel')).toHaveLength(3)
    expect(screen.queryByText('项目部')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '查看全部部门' })).toBeEnabled()
  })

  it('moves through the reel and discloses a department only after explicit action', async () => {
    const user = userEvent.setup()
    const onOpenDepartment = vi.fn()
    render(
      <ScreeningRoom
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenAtlas={vi.fn()}
        onOpenDepartment={onOpenDepartment}
        projects={projects}
      />,
    )

    await user.click(screen.getByRole('button', { name: '下一卷胶片' }))
    expect(screen.getByText('FILM 02 / RECORD')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '继续看看' }))

    expect(screen.getByText('宣传部')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '打开宣传部档案' }))
    expect(onOpenDepartment).toHaveBeenCalledWith('publicity')
  })

  it('falls back to a readable archive frame when an image fails', () => {
    render(
      <ScreeningRoom
        departments={departmentArchives}
        onBack={vi.fn()}
        onOpenAtlas={vi.fn()}
        onOpenDepartment={vi.fn()}
        projects={projects}
      />,
    )

    fireEvent.error(screen.getByRole('img', { name: /创新创业交流活动现场/ }))
    expect(screen.getByText('影像暂未载入')).toBeVisible()
    expect(
      screen.getByRole('img', { name: '从一次交流找到选题方向的影像暂未载入' }),
    ).toBeVisible()
    expect(screen.getByRole('heading', { name: '从一次交流找到选题方向' })).toBeVisible()
  })
})
