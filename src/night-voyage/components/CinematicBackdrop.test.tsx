import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CinematicBackdrop } from './CinematicBackdrop'

afterEach(cleanup)

describe('CinematicBackdrop', () => {
  it('renders a local looping video with a poster', () => {
    const { container } = render(
      <CinematicBackdrop
        alt="真实地球正在缓慢转动"
        desktopVideoSrc="/media/night-voyage/intro-earth-desktop.mp4"
        mobileVideoSrc="/media/night-voyage/intro-earth-mobile.mp4"
        posterSrc="/media/night-voyage/intro-earth.webp"
      />,
    )

    const video = container.querySelector('video')
    expect(video).toHaveAttribute('src', '/media/night-voyage/intro-earth-desktop.mp4')
    expect(video).toHaveAttribute('poster', '/media/night-voyage/intro-earth.webp')
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('uses the poster when motion is reduced', () => {
    const { container } = render(
      <CinematicBackdrop
        alt="真实地球正在缓慢转动"
        posterSrc="/media/night-voyage/intro-earth.webp"
        reducedMotion
        videoSrc="/media/night-voyage/intro-earth.mp4"
      />,
    )

    expect(container.querySelector('video')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAccessibleName('真实地球正在缓慢转动')
  })
})
