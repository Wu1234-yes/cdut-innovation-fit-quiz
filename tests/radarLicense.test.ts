import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const radarSource = readFileSync('src/components/RadarHero.tsx', 'utf8')
const viteConfig = readFileSync('vite.config.ts', 'utf8')
const licenseComment = radarSource.match(/^\/\*![\s\S]*?\*\//)?.[0] ?? ''

describe('RadarHero distributed license', () => {
  it('keeps the complete license in the source comment', () => {
    expect(licenseComment).toContain('Permission is hereby granted')
    expect(licenseComment).toContain('Commons Clause Restriction')
    expect(licenseComment).toContain(
      'do not sell, sublicense, or redistribute',
    )
    expect(licenseComment).toContain('THE SOFTWARE IS PROVIDED "AS IS"')
    expect(licenseComment).toContain('Copyright (c) 2026 David Haz')
    expect(licenseComment).toContain(
      'https://github.com/DavidHDev/react-bits/blob/3ba27d8037a1e51e93864a7609eb48b623bcdf30/src/ts-default/Backgrounds/Radar/Radar.tsx',
    )
  })

  it('extracts the build notice from RadarHero source instead of duplicating it', () => {
    expect(viteConfig).toContain("readFileSync(radarHeroSourceUrl, 'utf8')")
    expect(viteConfig).toContain("'./src/components/RadarHero.tsx'")
    expect(viteConfig).not.toContain('Full license text retained')
  })
})
