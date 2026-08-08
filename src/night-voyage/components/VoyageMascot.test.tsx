import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { VoyageMascot } from './VoyageMascot'

afterEach(cleanup)

describe('VoyageMascot', () => {
  it('renders an active guide with a local dialogue bubble', () => {
    render(
      <VoyageMascot
        dialogue="这条信号在等你。"
        side="right"
        state="guide"
      />,
    )

    expect(screen.getByText('这条信号在等你。')).toBeVisible()
    expect(screen.getByRole('img')).toHaveAttribute('data-mascot-state', 'guide')
    expect(screen.getByTestId('voyage-mascot')).toHaveClass('is-right')
  })

  it('keeps decorative mascots out of the accessibility tree', () => {
    render(<VoyageMascot decorative state="projector" />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('voyage-mascot')).toHaveClass('is-projector')
  })

  it('changes official IP artwork when the compact guide state changes', () => {
    const { rerender } = render(<VoyageMascot compact state="guide" />)

    expect(screen.getByTestId('voyage-mascot')).toHaveClass('is-compact')
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('launch.png'),
    )

    rerender(<VoyageMascot compact state="celebrate" />)

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('cheer.png'),
    )
  })
})
