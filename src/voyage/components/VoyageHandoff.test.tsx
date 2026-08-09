import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VoyageHandoff } from './VoyageHandoff'

describe('VoyageHandoff', () => {
  it('keeps the transition focused on entering the five stations', () => {
    const onBegin = vi.fn()
    render(<VoyageHandoff onBegin={onBegin} />)

    fireEvent.click(screen.getByRole('button', { name: '试试就试试' }))
    expect(onBegin).toHaveBeenCalledTimes(1)
  })
})
