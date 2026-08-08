import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ExplorerAvatar } from './ExplorerAvatar'

afterEach(cleanup)

describe('ExplorerAvatar', () => {
  it('renders the explorer as the user proxy without dialogue', () => {
    render(<ExplorerAvatar label="白色探索者正在观察信号" pose="observe" />)

    expect(
      screen.getByRole('img', { name: '白色探索者正在观察信号' }),
    ).toHaveAttribute('data-explorer-pose', 'observe')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders a decorative explorer without an accessible name', () => {
    render(<ExplorerAvatar decorative pose="walk" />)

    expect(screen.getByTestId('explorer-avatar')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
