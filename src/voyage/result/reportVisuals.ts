import type { VoyageDimensionScore } from './buildVoyageReport'

export const signalRadius = (score: number | null, innerRadius = 58, outerRadius = 132) => {
  if (score === null) return innerRadius
  const normalized = Math.max(0, Math.min(100, score)) / 100
  return innerRadius + (outerRadius - innerRadius) * normalized
}

export const signalPoints = (
  dimensions: VoyageDimensionScore[],
  center = 180,
  outerRadius = 132,
) => {
  const maximum = Math.max(...dimensions.map((item) => item.score ?? 0), 1)
  return dimensions.map((item, index) => {
  const angle = -Math.PI / 2 + index * ((Math.PI * 2) / dimensions.length)
  const relativeScore = item.score === null ? null : (item.score / maximum) * 100
  const radius = signalRadius(relativeScore, 58, outerRadius)
  return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`
  }).join(' ')
}
