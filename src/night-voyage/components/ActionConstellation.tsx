import type { ActionProfile as ActionProfileData } from '../content/types'

interface ActionConstellationProps {
  profile: ActionProfileData
}

const hashText = (value: string) => {
  let hash = 17
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 9973
  }
  return hash
}

export function ActionConstellation({ profile }: ActionConstellationProps) {
  const evidence = [
    profile.traits.map(({ id }) => id).join('|'),
    profile.researchScenes.map(({ id }) => id).join('|'),
    profile.starterTasks.map(({ id }) => id).join('|'),
    profile.traits.map(({ title }) => title).join('|'),
    profile.researchScenes.map(({ title }) => title).join('|'),
  ]
  const points = evidence.map((value, index) => {
    const angle = ((-90 + index * 72) * Math.PI) / 180
    const radius = 92 + (hashText(value) % 34)
    return {
      x: 210 + Math.cos(angle) * radius,
      y: 164 + Math.sin(angle) * radius,
    }
  })
  const path = `${points.map(({ x, y }) => `${x},${y}`).join(' ')} ${points[0].x},${points[0].y}`

  return (
    <svg
      aria-label="本次夜航形成的个人行动星象"
      className="action-constellation"
      role="img"
      viewBox="0 0 420 340"
    >
      <title>本次夜航形成的个人行动星象</title>
      <desc>这张图只回放五个行动节点，不给出固定结论。</desc>
      <defs>
        <radialGradient id="constellation-glow">
          <stop offset="0" stopColor="#d9ffff" />
          <stop offset="0.38" stopColor="#66e7eb" />
          <stop offset="1" stopColor="#167785" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="action-constellation__observatory" aria-hidden="true">
        <circle cx="210" cy="164" r="132" />
        <circle cx="210" cy="164" r="94" />
        <path d="M42 164h336M210 24v280" />
      </g>
      <polyline
        aria-hidden="true"
        className="action-constellation__path"
        points={path}
      />
      <circle
        aria-hidden="true"
        className="action-constellation__core"
        cx="210"
        cy="164"
        fill="url(#constellation-glow)"
        r="38"
      />
      {points.map(({ x, y }, index) => (
        <g data-constellation-node key={evidence[index]}>
          <line
            aria-hidden="true"
            className="action-constellation__spoke"
            x1="210"
            x2={x}
            y1="164"
            y2={y}
          />
          <circle
            aria-hidden="true"
            className="action-constellation__node-halo"
            cx={x}
            cy={y}
            r="12"
          />
          <circle
            aria-hidden="true"
            className="action-constellation__node"
            cx={x}
            cy={y}
            r="4.5"
          />
        </g>
      ))}
      {profile.traits.slice(0, 3).map((trait, index) => (
        <text
          aria-hidden="true"
          className="action-constellation__label"
          key={trait.id}
          textAnchor={points[index].x > 210 ? 'start' : 'end'}
          x={points[index].x + (points[index].x > 210 ? 16 : -16)}
          y={points[index].y + 4}
        >
          {trait.title}
        </text>
      ))}
    </svg>
  )
}
