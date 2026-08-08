import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileRadar } from './ProfileRadar'

describe('ProfileRadar', () => {
  it('renders an eight-point visual with an equivalent text summary', () => {
    render(
      <ProfileRadar
        scores={{
          expression: 80,
          analysis: 60,
          execution: 90,
          adaptation: 70,
        }}
      />,
    )

    const radar = screen.getByTestId('profile-radar')
    expect(within(radar).getByRole('img', { name: '八维科创画像雷达图' })).toBeInTheDocument()
    expect(within(radar).getAllByRole('term')).toHaveLength(8)
    expect(within(radar).getAllByRole('definition')).toHaveLength(8)
    expect(within(radar).getAllByText('表达清晰')).toHaveLength(2)
    expect(within(radar).getByText('80')).toBeInTheDocument()
  })
})
