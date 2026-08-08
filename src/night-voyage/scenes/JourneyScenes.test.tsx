import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ClueScene } from './ClueScene'
import { DialogueScene } from './DialogueScene'
import { ExpressionScene } from './ExpressionScene'
import { MapScene } from './MapScene'
import { ObservationScene } from './ObservationScene'

afterEach(cleanup)

describe('night voyage action scenes', () => {
  it('keeps a quick exit for every scene without blocking the journey', () => {
    const onComplete = vi.fn()
    render(<ClueScene onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('button', { name: '跳过这站' }))
    expect(onComplete).toHaveBeenCalledWith(['beginner-note', 'project-record'])
  })

  it('completes the exploration lens after revealing one signal', () => {
    const onComplete = vi.fn()
    render(<ObservationScene onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /异常变化/ }))
    expect(screen.getByText('信号已显影')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '放大查看这处细节' }))
    expect(screen.getByRole('region', { name: '放大观察：异常变化' })).toBeVisible()
    expect(screen.getByText(/连续改变方向不是一个静止标签/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '带回这束信号' }))
    expect(onComplete).toHaveBeenCalledWith(['detail'])
  })

  it('docks exactly two fragments into the magnetic orbit', () => {
    const onComplete = vi.fn()
    render(<ClueScene onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /新手留言/ }))
    fireEvent.click(screen.getByRole('button', { name: /项目记录/ }))
    expect(screen.getAllByText('已进入轨道')).toHaveLength(2)
    expect(screen.getByRole('complementary', { name: '组合解释' })).toBeVisible()
    expect(screen.getByText(/参与才有落点/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '锁定这条星图' }))
    expect(onComplete).toHaveBeenCalledWith(['beginner-note', 'project-record'])
  })

  it('completes one relay dialogue without a correct-answer state', () => {
    const onComplete = vi.fn()
    render(<DialogueScene onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /项目参与者/ }))
    fireEvent.click(screen.getByRole('button', { name: '先问现在最卡住哪一步' }))
    expect(screen.queryByText(/正确|错误|得分/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '追问：谁能补上这一步？' }))
    expect(screen.getByText(/把三个人的记录放到同一条时间线上/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '收下这次回应' }))
    expect(onComplete).toHaveBeenCalledWith('participant')
  })

  it('starts an energy route after choosing three node groups', () => {
    const onComplete = vi.fn()
    render(<MapScene onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: '课后半小时' }))
    fireEvent.click(screen.getByRole('button', { name: '找一位同伴' }))
    fireEvent.click(screen.getByRole('button', { name: '先做一次' }))
    fireEvent.click(screen.getByRole('button', { name: '启动能量路线' }))
    expect(screen.getByText('航路已穿越')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '带回这条路线' }))

    expect(onComplete).toHaveBeenCalledWith({
      time: 'short',
      partner: 'peer',
      approach: 'try-first',
    })
  })

  it('sends a broadcast after medium and frequency are set', () => {
    const onComplete = vi.fn()
    render(<ExpressionScene onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: /海报/ }))
    fireEvent.change(screen.getByRole('slider', { name: '广播频率' }), {
      target: { value: '72' },
    })
    fireEvent.click(screen.getByRole('button', { name: '发送这束广播' }))

    expect(onComplete).toHaveBeenCalledWith({ expression: 'poster', tuning: 72 })
  })
})
