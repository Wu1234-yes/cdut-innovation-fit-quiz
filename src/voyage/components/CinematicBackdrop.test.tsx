import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CinematicBackdrop } from './CinematicBackdrop'

describe('CinematicBackdrop', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps the poster visible while a background video is loading', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => new Promise(() => {}))
    const { container } = render(
      <CinematicBackdrop
        alt="测试背景"
        desktopVideoSrc="/background.mp4"
        mobileVideoSrc="/background-mobile.mp4"
        posterSrc="/background.jpg"
      />,
    )

    expect(container.querySelector('img[src="/background.jpg"]')).toBeInTheDocument()
    expect(container.querySelector('video')).toBeInTheDocument()
  })

  it('does not permanently remove the video after a transient play rejection', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new DOMException('temporary', 'AbortError'))
    const { container } = render(
      <CinematicBackdrop
        alt="测试背景"
        desktopVideoSrc="/background.mp4"
        mobileVideoSrc="/background-mobile.mp4"
        posterSrc="/background.jpg"
      />,
    )

    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled())
    expect(container.querySelector('video')).toBeInTheDocument()
    expect(container.querySelector('.cinematic-backdrop')).not.toHaveClass('is-poster')
  })

  it('keeps an already playing frame visible during a transient stall', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    const { container } = render(
      <CinematicBackdrop
        alt="测试背景"
        desktopVideoSrc="/background.mp4"
        mobileVideoSrc="/background-mobile.mp4"
        posterSrc="/background.jpg"
      />,
    )
    const video = container.querySelector('video') as HTMLVideoElement
    const backdrop = container.querySelector('.cinematic-backdrop')

    fireEvent.playing(video)
    expect(backdrop).toHaveClass('is-ready')

    fireEvent.stalled(video)
    expect(backdrop).toHaveClass('is-ready')
  })
})
