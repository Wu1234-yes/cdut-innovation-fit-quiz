import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationShell } from './StationShell'

afterEach(() => {
  vi.useRealTimers()
})

describe('StationShell', () => {
  it('clears the locked state when the flow advances to another station', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const view = render(
      <StationShell key="observation"
        answers={{}}
        onBack={vi.fn()}
        onComplete={onComplete}
        onReport={vi.fn()}
        stationId="observation"
      />,
    )
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('data-signal-state', 'selected')
    fireEvent.click(screen.getByRole('button', { name: '接入这条信号' }))
    act(() => vi.advanceTimersByTime(500))
    expect(onComplete).toHaveBeenCalledTimes(1)

    view.rerender(
      <StationShell key="experiment"
        answers={{ observation: onComplete.mock.calls[0][0] }}
        onBack={vi.fn()}
        onComplete={onComplete}
        onReport={vi.fn()}
        stationId="experiment"
      />,
    )

    expect(screen.queryByRole('button', { name: '信号已记录' })).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByRole('button', { name: '接入这条信号' })).toBeEnabled()
  })
})
