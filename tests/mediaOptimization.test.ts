import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const mediaDir = join(process.cwd(), 'public', 'media', 'night-voyage')
const videoFiles = readdirSync(mediaDir).filter((name) => /-(desktop|mobile)\.mp4$/.test(name))
const mebibyte = 1024 * 1024

describe('background video delivery', () => {
  it('keeps responsive background videos within practical transfer budgets', () => {
    for (const name of videoFiles) {
      const limit = name.endsWith('-mobile.mp4') ? 1.5 * mebibyte : 4 * mebibyte
      expect(statSync(join(mediaDir, name)).size, name).toBeLessThanOrEqual(limit)
    }
  })

  it('places MP4 metadata before media data for progressive playback', () => {
    for (const name of videoFiles) {
      const bytes = readFileSync(join(mediaDir, name))
      const moov = bytes.indexOf(Buffer.from('moov'))
      const mdat = bytes.indexOf(Buffer.from('mdat'))
      expect(moov, `${name} is missing moov metadata`).toBeGreaterThan(0)
      expect(moov, `${name} does not use faststart`).toBeLessThan(mdat)
    }
  })
})
