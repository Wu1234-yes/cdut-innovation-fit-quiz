import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TriptychVideo } from './TriptychVideo'

afterEach(cleanup)

describe('TriptychVideo', () => {
  it('uses three synchronized windows from the real reference video', () => {
    render(
      <TriptychVideo
        alt="晨光越过群山"
        desktopVideoSrc="/media/night-voyage/expression-triptych-desktop.mp4"
        mobileVideoSrc="/media/night-voyage/expression-triptych-mobile.mp4"
        posterSrc="/media/night-voyage/expression-triptych.webp"
      />,
    )

    expect(screen.getByRole('img', { name: '晨光越过群山' })).toBeVisible()
    expect(screen.getAllByTestId('triptych-video-panel')).toHaveLength(3)
    expect(document.querySelectorAll('video')).toHaveLength(1)
    expect(document.querySelector('source[media="(min-width: 681px)"]')).toHaveAttribute(
      'src',
      '/media/night-voyage/expression-triptych-desktop.mp4',
    )
    expect(document.querySelector('source:not([media])')).toHaveAttribute(
      'src',
      '/media/night-voyage/expression-triptych-mobile.mp4',
    )
  })
})
