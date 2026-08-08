import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { departments } from '../content/departments'
import { ResultReveal } from './ResultReveal'

describe('ResultReveal', () => {
  it('reveals the profile over the primary department documentary image', () => {
    const department = departments[1]

    render(
      <ResultReveal
        department={department}
        headingRef={createRef<HTMLHeadingElement>()}
        profile="深研推进者"
        score={86}
      />,
    )

    expect(screen.getByRole('img', { name: department.hero.alt })).toHaveAttribute(
      'src',
      department.hero.fallback,
    )
    expect(screen.getByRole('heading', { level: 1, name: '深研推进者' })).toBeInTheDocument()
    expect(screen.getByText(department.name)).toBeInTheDocument()
    expect(screen.getByText('86')).toBeInTheDocument()
    expect(screen.getByText('适配指数')).toBeInTheDocument()
  })
})
