import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { explorerPoseSources } from '../content/sceneVisuals'
import { ExplorerCharacter } from './ExplorerCharacter'

afterEach(cleanup)

describe('ExplorerCharacter', () => {
  it('uses the local pose source and keeps an accessible name', () => {
    render(<ExplorerCharacter label="探索者正在观察信号" pose="observe" />)
    expect(screen.getByRole('img', { name: '探索者正在观察信号' })).toHaveAttribute(
      'src',
      explorerPoseSources.observe,
    )
  })

  it('uses the idle frame when a pose asset fails', () => {
    render(<ExplorerCharacter pose="communicate" />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img')).toHaveAttribute('src', explorerPoseSources.idle)
  })
})
