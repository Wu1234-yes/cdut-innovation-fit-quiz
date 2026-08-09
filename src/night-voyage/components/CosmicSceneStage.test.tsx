import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { sceneVisuals } from '../content/sceneVisuals'
import { CosmicSceneStage } from './CosmicSceneStage'

afterEach(cleanup)

describe('CosmicSceneStage', () => {
  it('renders a local cinematic backdrop with readable foreground content', () => {
    const { container } = render(
      <CosmicSceneStage visualId="observation">
        <button type="button">扫描</button>
      </CosmicSceneStage>,
    )

    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      sceneVisuals.observation.desktopVideoSrc,
    )
    expect(screen.getByRole('img', { name: sceneVisuals.observation.alt })).toBeVisible()
    expect(screen.getByRole('button', { name: '扫描' })).toBeEnabled()
    expect(screen.getByTestId('cosmic-scene-stage')).toHaveAttribute(
      'data-world',
      'observation',
    )
  })

  it('turns off parallax when reduced motion is requested', () => {
    const { container } = render(<CosmicSceneStage visualId="hub" reducedMotion />)
    expect(screen.getByTestId('cosmic-scene-stage')).toHaveClass('is-reduced')
    expect(container.querySelector('video')).not.toBeInTheDocument()
  })
})
