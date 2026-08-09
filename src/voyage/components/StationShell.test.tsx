import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationShell } from './StationShell'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('StationShell', () => {
  it('prefetches only the next station background', () => {
    const view = render(
      <StationShell
        answers={{}}
        onBack={vi.fn()}
        onComplete={vi.fn()}
        onReport={vi.fn()}
        stationId="experiment"
      />,
    )

    const prefetches = document.head.querySelectorAll<HTMLLinkElement>('link[data-voyage-prefetch="next-station"]')
    expect(prefetches).toHaveLength(1)
    expect(prefetches[0].href).toContain('/media/night-voyage/reference-fluid-motion-desktop.mp4')

    view.rerender(
      <StationShell
        answers={{}}
        onBack={vi.fn()}
        onComplete={vi.fn()}
        onReport={vi.fn()}
        stationId="expression"
      />,
    )

    expect(document.head.querySelector('link[data-voyage-prefetch="next-station"]')).not.toBeInTheDocument()
  })

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
