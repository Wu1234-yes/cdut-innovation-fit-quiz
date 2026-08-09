import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cinematicAssets } from './cinematicAssets'

describe('cinematicAssets', () => {
  it.each(Object.entries(cinematicAssets))('%s has desktop, mobile and poster files', (_, asset) => {
    for (const source of [asset.desktopVideo, asset.mobileVideo, asset.poster]) {
      expect(existsSync(resolve('public', source.replace(/^\//, '')))).toBe(true)
    }
  })

  it('uses a different reference scene for every major journey view', () => {
    const desktopVideos = Object.values(cinematicAssets).map((asset) => asset.desktopVideo)

    expect(new Set(desktopVideos).size).toBe(desktopVideos.length)
    expect(desktopVideos.every((source) => source.includes('/reference-'))).toBe(true)
  })
})
