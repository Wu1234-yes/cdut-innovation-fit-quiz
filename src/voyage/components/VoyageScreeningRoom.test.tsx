import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { projects } from '../content/projects'
import { VoyageScreeningRoom } from './VoyageScreeningRoom'

describe('VoyageScreeningRoom', () => {
  it('presents one concrete action frame for every department', () => {
    render(
      <VoyageScreeningRoom
        onBack={vi.fn()}
        onContinue={vi.fn()}
        projects={projects}
      />,
    )

    expect(screen.getAllByRole('button', { name: /查看.+镜头/ })).toHaveLength(7)

    fireEvent.click(screen.getByRole('button', { name: '查看宣传部镜头' }))
    expect(screen.getByRole('heading', { name: '宣传部 / 现场记录' })).toBeInTheDocument()
    expect(screen.getByText(/拍摄活动现场并整理图文素材/)).toBeInTheDocument()
  })
})
