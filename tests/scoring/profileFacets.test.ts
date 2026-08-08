import { describe, expect, it } from 'vitest'
import { buildProfileFacets } from '../../src/scoring/profileFacets'

describe('buildProfileFacets', () => {
  it('builds eight bounded facets without changing source dimensions', () => {
    const source = {
      expression: 80,
      analysis: 60,
      execution: 90,
      adaptation: 70,
    }

    expect(buildProfileFacets(source).map((facet) => facet.value)).toEqual([
      80, 74, 60, 63, 90, 81, 70, 73,
    ])
    expect(source).toEqual({
      expression: 80,
      analysis: 60,
      execution: 90,
      adaptation: 70,
    })
  })

  it('clamps invalid and out-of-range source values', () => {
    expect(
      buildProfileFacets({
        expression: Number.NaN,
        analysis: -10,
        execution: 160,
        adaptation: Number.POSITIVE_INFINITY,
      }).map((facet) => facet.value),
    ).toEqual([0, 0, 0, 0, 100, 70, 0, 0])
  })
})
