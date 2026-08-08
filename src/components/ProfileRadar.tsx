import type { ScoreMap } from '../content/types'
import { buildProfileFacets } from '../scoring/profileFacets'

interface ProfileRadarProps {
  scores: ScoreMap
}

const center = 240
const radius = 148
const labelRadius = 202

const pointAt = (index: number, value = 100) => {
  const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2
  const distance = radius * (value / 100)
  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance,
  }
}

const polygonPoints = (value: number) =>
  Array.from({ length: 8 }, (_, index) => {
    const point = pointAt(index, value)
    return `${point.x},${point.y}`
  }).join(' ')

export function ProfileRadar({ scores }: ProfileRadarProps) {
  const facets = buildProfileFacets(scores)
  const dataPoints = facets
    .map((facet, index) => {
      const point = pointAt(index, facet.value)
      return `${point.x},${point.y}`
    })
    .join(' ')

  return (
    <section className="profile-radar" data-testid="profile-radar">
      <svg
        aria-label="八维科创画像雷达图"
        className="profile-radar__chart"
        role="img"
        viewBox="0 0 480 480"
      >
        <g className="profile-radar__grid">
          {[25, 50, 75, 100].map((value) => (
            <polygon key={value} points={polygonPoints(value)} />
          ))}
          {facets.map((facet, index) => {
            const point = pointAt(index)
            return (
              <line
                key={facet.id}
                x1={center}
                x2={point.x}
                y1={center}
                y2={point.y}
              />
            )
          })}
        </g>
        <polygon className="profile-radar__shape" points={dataPoints} />
        {facets.map((facet, index) => {
          const point = pointAt(index, (labelRadius / radius) * 100)
          const anchor = point.x < center - 8 ? 'end' : point.x > center + 8 ? 'start' : 'middle'
          return (
            <text
              className="profile-radar__label"
              key={facet.id}
              textAnchor={anchor}
              x={point.x}
              y={point.y}
            >
              {facet.label}
            </text>
          )
        })}
      </svg>

      <dl className="profile-radar__summary">
        {facets.map((facet) => (
          <div key={facet.id}>
            <dt>{facet.label}</dt>
            <dd>{facet.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
