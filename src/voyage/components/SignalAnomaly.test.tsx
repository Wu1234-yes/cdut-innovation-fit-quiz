import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SignalAnomaly } from './SignalAnomaly'

describe('SignalAnomaly', () => {
  it('names the return destination as the voyage report', () => {
    render(<SignalAnomaly onBack={vi.fn()} />)

    expect(screen.getAllByRole('button', { name: '回到试航报告' })[0]).toBeInTheDocument()
  })

  it('reveals a hidden signal without changing the return path', () => {
    render(<SignalAnomaly onBack={vi.fn()} />)

    fireEvent.click(screen.getAllByRole('button', { name: '解码隐藏信号1' })[0])
    expect(screen.getByText('问题会回来')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '回到试航报告' })[0]).toBeInTheDocument()
  })
})
