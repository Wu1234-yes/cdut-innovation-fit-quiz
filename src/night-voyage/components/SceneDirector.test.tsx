import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEmptySignals } from '../app/journeyReducer'
import { SceneDirector } from './SceneDirector'

afterEach(cleanup)

describe('SceneDirector', () => {
  it('keeps a return-to-hub action available', () => {
    const onReturn = vi.fn()
    render(
      <SceneDirector
        activeSceneId="observation"
        onComplete={vi.fn()}
        onReturn={onReturn}
        signals={createEmptySignals()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '返回夜航枢纽' }))
    expect(onReturn).toHaveBeenCalledTimes(1)
  })

  it('submits the active scene with a structured signal', () => {
    const onComplete = vi.fn()
    render(
      <SceneDirector
        activeSceneId="observation"
        onComplete={onComplete}
        onReturn={vi.fn()}
        signals={createEmptySignals()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /异常变化/ }))
    fireEvent.click(screen.getByRole('button', { name: '放大查看这处细节' }))
    fireEvent.click(screen.getByRole('button', { name: '带回这束信号' }))
    expect(onComplete).toHaveBeenCalledWith('observation', {
      observation: ['detail'],
    })
  })
})
