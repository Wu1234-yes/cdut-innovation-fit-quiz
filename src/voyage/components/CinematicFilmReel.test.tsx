import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ProjectRecord } from '../content/types'
import { CinematicFilmReel } from './CinematicFilmReel'

const projects: ProjectRecord[] = [
  {
    id: 'first',
    archiveCode: 'FILM 01',
    title: 'First project',
    description: 'First description',
    departmentId: 'project',
    screeningPriority: 0,
    media: { src: '/first-640.webp', alt: 'First image', objectPosition: '50% 50%' },
  },
  {
    id: 'second',
    archiveCode: 'FILM 02',
    title: 'Second project',
    description: 'Second description',
    departmentId: 'publicity',
    screeningPriority: 1,
    media: { src: '/second-640.webp', alt: 'Second image', objectPosition: '50% 50%' },
  },
]

interface PendingImage {
  image: {
    onload: (() => void) | null
  }
  resolveDecode: () => void
}

describe('CinematicFilmReel', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the current projection visible until the next image is decoded', async () => {
    const pendingImages: PendingImage[] = []

    class PreloadImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ''
      srcset = ''
      resolveDecode = () => undefined

      constructor() {
        pendingImages.push({
          image: this,
          resolveDecode: () => this.resolveDecode(),
        })
      }

      decode() {
        return new Promise<void>((resolve) => {
          this.resolveDecode = resolve
        })
      }
    }

    vi.stubGlobal('Image', PreloadImage)

    const view = render(
      <CinematicFilmReel
        activeIndex={0}
        onActiveChange={vi.fn()}
        projects={projects}
        reducedMotion
      />,
    )

    const centerImage = () => view.container.querySelector<HTMLImageElement>('.cinematic-film-reel__panel.is-2 img')
    expect(centerImage()).toHaveAttribute('src', '/first-640.webp')

    view.rerender(
      <CinematicFilmReel
        activeIndex={1}
        onActiveChange={vi.fn()}
        projects={projects}
        reducedMotion
      />,
    )

    expect(centerImage()).toHaveAttribute('src', '/first-640.webp')
    expect(pendingImages).toHaveLength(1)

    await act(async () => {
      pendingImages[0].image.onload?.()
      await Promise.resolve()
    })
    expect(centerImage()).toHaveAttribute('src', '/first-640.webp')

    await act(async () => {
      pendingImages[0].resolveDecode()
      await Promise.resolve()
    })
    expect(centerImage()).toHaveAttribute('src', '/second-640.webp')
  })
})
