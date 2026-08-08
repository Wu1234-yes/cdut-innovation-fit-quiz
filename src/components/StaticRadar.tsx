import type { CSSProperties } from 'react'

type RadarPoint = {
  level: 1 | 2 | 3
  x: number
  y: number
}

const radarPoints: RadarPoint[] = [
  { x: 51, y: 14, level: 2 },
  { x: 67, y: 20, level: 1 },
  { x: 79, y: 31, level: 3 },
  { x: 86, y: 47, level: 1 },
  { x: 76, y: 63, level: 2 },
  { x: 64, y: 77, level: 1 },
  { x: 47, y: 84, level: 3 },
  { x: 31, y: 77, level: 1 },
  { x: 19, y: 65, level: 2 },
  { x: 13, y: 48, level: 1 },
  { x: 23, y: 32, level: 3 },
  { x: 36, y: 22, level: 1 },
  { x: 58, y: 39, level: 2 },
  { x: 39, y: 58, level: 1 },
]

type PointStyle = CSSProperties & {
  '--point-x': string
  '--point-y': string
}

export function RadarPoints() {
  return (
    <div className="radar-points" aria-hidden="true">
      {radarPoints.map((point, index) => (
        <span
          className="radar-point"
          data-level={point.level}
          data-radar-point=""
          key={`${point.x}-${point.y}`}
          style={
            {
              '--point-x': `${point.x}%`,
              '--point-y': `${point.y}%`,
            } as PointStyle
          }
        >
          <span className="sr-only">扫描点 {index + 1}</span>
        </span>
      ))}
    </div>
  )
}

export function StaticRadar() {
  return (
    <div
      aria-label="静态科创雷达，显示十四个协作坐标点"
      className="radar-visual radar-visual--static"
      role="img"
    >
      <div className="static-radar__ring static-radar__ring--outer" />
      <div className="static-radar__ring static-radar__ring--middle" />
      <div className="static-radar__ring static-radar__ring--inner" />
      <div className="static-radar__ring static-radar__ring--core" />
      <div className="static-radar__spoke static-radar__spoke--horizontal" />
      <div className="static-radar__spoke static-radar__spoke--vertical" />
      <div className="static-radar__spoke static-radar__spoke--diagonal-a" />
      <div className="static-radar__spoke static-radar__spoke--diagonal-b" />
      <div className="static-radar__reverse-orbit" />
      <div className="static-radar__sweep-sector" />
      <div className="static-radar__sweep-line" />
      <div className="static-radar__pulse" />
      <RadarPoints />
    </div>
  )
}
