import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { departments } from '../content/departments'
import { ResultPoster } from './ResultPoster'

const props = {
  department: departments[0],
  dimensions: { expression: 80, analysis: 60, execution: 90, adaptation: 70 } as const,
  profile: '行动统筹者',
  score: 86,
}

describe('ResultPoster', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('downloads a department-specific PNG', async () => {
    const generator = vi.fn().mockResolvedValue(new Blob(['poster'], { type: 'image/png' }))
    const createObjectURL = vi.fn().mockReturnValue('blob:poster')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(<ResultPoster {...props} generator={generator} />)
    await userEvent.click(screen.getByRole('button', { name: '生成结果海报' }))

    expect(generator).toHaveBeenCalledWith(props)
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:poster')
  })

  it('shows a retry message when generation fails', async () => {
    render(
      <ResultPoster
        {...props}
        generator={vi.fn().mockRejectedValue(new Error('failed'))}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: '生成结果海报' }))
    expect(screen.getByText('海报生成失败，请重试')).toBeInTheDocument()
  })
})
