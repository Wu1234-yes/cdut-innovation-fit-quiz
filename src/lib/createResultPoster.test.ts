import { afterEach, describe, expect, it, vi } from 'vitest'
import { departments } from '../content/departments'
import { createResultPoster } from './createResultPoster'

const context = {
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 100 }),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  fillStyle: '',
  font: '',
  globalAlpha: 1,
  textBaseline: 'alphabetic',
}

describe('createResultPoster', () => {
  afterEach(() => vi.restoreAllMocks())

  it('encodes a 1080 by 1440 PNG poster', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['poster'], { type: 'image/png' }))
    })
    vi.stubGlobal(
      'Image',
      class {
        width = 1200
        height = 800
        set src(_value: string) {
          queueMicrotask(() => this.onload?.(new Event('load')))
        }
        onload?: (event: Event) => void
        onerror?: () => void
      },
    )

    const blob = await createResultPoster({
      department: departments[0],
      dimensions: { expression: 80, analysis: 60, execution: 90, adaptation: 70 },
      profile: '行动统筹者',
      score: 86,
    })

    expect(blob.type).toBe('image/png')
    expect(context.drawImage).toHaveBeenCalled()
    const canvas = vi.mocked(HTMLCanvasElement.prototype.toBlob).mock
      .instances[0] as HTMLCanvasElement
    expect(canvas.width).toBe(1080)
    expect(canvas.height).toBe(1440)
  })

  it('rejects when the browser cannot encode the poster', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(null))
    vi.stubGlobal(
      'Image',
      class {
        width = 1200
        height = 800
        set src(_value: string) {
          queueMicrotask(() => this.onload?.(new Event('load')))
        }
        onload?: (event: Event) => void
        onerror?: () => void
      },
    )

    await expect(
      createResultPoster({
        department: departments[0],
        dimensions: { expression: 80, analysis: 60, execution: 90, adaptation: 70 },
        profile: '行动统筹者',
        score: 86,
      }),
    ).rejects.toThrow('Unable to encode result poster')
  })
})
