import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MediaWithFallback } from './MediaWithFallback'

describe('MediaWithFallback', () => {
  it('retries transient image failures before showing the final fallback', () => {
    render(
      <MediaWithFallback
        archiveCode="FILM 01"
        media={{ src: '/gallery.webp', alt: '活动照片', objectPosition: '50% 50%' }}
        title="活动记录"
      />,
    )

    fireEvent.error(screen.getByRole('img', { name: '活动照片' }))
    const retried = screen.getByRole('img', { name: '活动照片' })
    expect(retried).toHaveAttribute('src', expect.stringContaining('media_retry=1'))
    expect(screen.queryByText('影像暂未载入')).not.toBeInTheDocument()

    fireEvent.error(retried)
    fireEvent.error(screen.getByRole('img', { name: '活动照片' }))
    expect(screen.getByText('影像暂未载入')).toBeInTheDocument()
  })
})
