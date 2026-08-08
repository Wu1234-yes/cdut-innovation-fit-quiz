import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CosmicCoreScene } from './CosmicCoreScene'

afterEach(cleanup)

describe('CosmicCoreScene', () => {
  it('keeps a readable fallback before WebGL is ready', () => {
    render(<CosmicCoreScene reducedMotion={false} saveData={false} />)

    expect(screen.getByTestId('cosmic-core-fallback')).toBeVisible()
  })

  it('does not request WebGL in reduced-motion mode', () => {
    render(<CosmicCoreScene reducedMotion saveData={false} />)

    expect(screen.queryByTestId('cosmic-core-canvas')).not.toBeInTheDocument()
    expect(screen.getByTestId('cosmic-core-fallback')).toBeVisible()
  })
})
