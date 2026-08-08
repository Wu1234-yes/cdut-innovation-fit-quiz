import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OpenWorldHub } from './OpenWorldHub'

afterEach(cleanup)

describe('OpenWorldHub', () => {
  it('reveals an optional zero-gravity signal after two destinations', () => {
    render(
      <OpenWorldHub
        completedSceneIds={['observation', 'clues']}
        onBeginReveal={vi.fn()}
        onEnterScene={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '发现一束异常信号' }))
    expect(screen.getByRole('dialog', { name: '失重信号舱' })).toBeVisible()
    expect(screen.getByRole('button', { name: '先做一小步' })).toBeVisible()
    expect(screen.getByRole('button', { name: '找一个同行者' })).toBeVisible()
    expect(screen.getByRole('button', { name: '把问题说清楚' })).toBeVisible()
    expect(screen.getByRole('button', { name: '接收这封回信' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '找一个同行者' }))
    expect(screen.getByRole('button', { name: '接收这封回信' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: '接收这封回信' }))
    expect(screen.getByText(/真正的航行很少独自发生/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '让回信形成星轨' }))
    expect(screen.getByRole('button', { name: '星轨已经形成' })).toBeVisible()
    expect(screen.getByRole('dialog', { name: '失重信号舱' })).toHaveAttribute('data-signal', 'companion')
    fireEvent.click(screen.getByRole('button', { name: '返回夜航枢纽' }))
    expect(screen.queryByRole('dialog', { name: '失重信号舱' })).not.toBeInTheDocument()
  })

  it('renders five destinations without department labels', () => {
    render(
      <OpenWorldHub
        completedSceneIds={[]}
        onBeginReveal={vi.fn()}
        onEnterScene={vi.fn()}
      />,
    )

    expect(screen.getAllByTestId('hub-destination')).toHaveLength(5)
    expect(screen.getByTestId('hub-world')).toHaveAttribute('data-world', 'hub')
    expect(screen.getByRole('button', { name: '探索镜，15 秒' })).toBeEnabled()
    expect(screen.getByTestId('hub-flightline')).toBeVisible()
    expect(document.querySelector('.voyage-hub__rings')).not.toBeInTheDocument()
    expect(document.querySelector('.voyage-hub__explorer')).not.toBeInTheDocument()
    expect(screen.queryByText(/项目部|宣传部|办公室/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '汇聚行动星图' })).toBeDisabled()
  })

  it('keeps every destination keyboard reachable', () => {
    render(
      <OpenWorldHub
        completedSceneIds={[]}
        onBeginReveal={vi.fn()}
        onEnterScene={vi.fn()}
      />,
    )

    const destinations = screen.getAllByTestId('hub-destination')
    destinations[0].focus()

    expect(destinations).toHaveLength(5)
    expect(destinations[0]).toHaveFocus()
  })

  it('previews a destination and opens its scene', () => {
    const onEnterScene = vi.fn()
    render(
      <OpenWorldHub
        completedSceneIds={[]}
        onBeginReveal={vi.fn()}
        onEnterScene={onEnterScene}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /信号接力/ }))
    expect(screen.getByRole('heading', { name: '信号接力' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '进入信号接力' }))
    expect(onEnterScene).toHaveBeenCalledWith('dialogue')
  })

  it('marks completed destinations and unlocks reveal after all five', () => {
    const onBeginReveal = vi.fn()
    render(
      <OpenWorldHub
        completedSceneIds={[
          'observation',
          'clues',
          'dialogue',
          'map',
          'expression',
        ]}
        onBeginReveal={onBeginReveal}
        onEnterScene={vi.fn()}
      />,
    )

    expect(screen.getAllByText('信号已回收')).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: '汇聚行动星图' }))
    expect(onBeginReveal).toHaveBeenCalledTimes(1)
  })
})
