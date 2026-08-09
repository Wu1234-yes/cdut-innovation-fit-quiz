import { describe, expect, it } from 'vitest'
import { stations } from './journey'

describe('journey station backgrounds', () => {
  it('uses the approved legacy scenes for experiment, progress and expression', () => {
    const backgrounds = Object.fromEntries(
      stations.map((station) => [station.id, station.video]),
    )

    expect(backgrounds.experiment).toBe('/media/night-voyage/observation-forest-desktop.mp4')
    expect(backgrounds.progress).toBe('/media/night-voyage/map-black-hole-desktop.mp4')
    expect(backgrounds.expression).toBe('/media/night-voyage/expression-triptych-desktop.mp4')
  })

  it('keeps observation and collaboration on their current scenes', () => {
    const backgrounds = Object.fromEntries(
      stations.map((station) => [station.id, station.video]),
    )

    expect(backgrounds.observation).toBe('/media/night-voyage/reference-motion13-desktop.mp4')
    expect(backgrounds.collaboration).toBe('/media/night-voyage/reference-fluid-motion-desktop.mp4')
  })
})
