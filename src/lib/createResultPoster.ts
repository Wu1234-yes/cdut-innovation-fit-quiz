import type { Department, DimensionId, ScoreMap } from '../content/types'

export interface ResultPosterData {
  department: Department
  dimensions: ScoreMap
  profile: string
  score: number
}

const dimensions: ReadonlyArray<{ id: DimensionId; label: string }> = [
  { id: 'expression', label: '表达转化' },
  { id: 'analysis', label: '分析研究' },
  { id: 'execution', label: '执行推进' },
  { id: 'adaptation', label: '协作应变' },
]

const sanitize = (value: number) =>
  Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value))) : 0

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load department image'))
    image.src = src
  })

const drawCover = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  const sourceRatio = image.width / image.height
  const targetRatio = width / height
  const sourceWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width
  const sourceHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio
  const sourceX = (image.width - sourceWidth) / 2
  const sourceY = (image.height - sourceHeight) / 2
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  )
}

export async function createResultPoster(data: ResultPosterData): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1440
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context unavailable')
  }

  const image = await loadImage(data.department.hero.fallback)
  context.fillStyle = '#050b13'
  context.fillRect(0, 0, canvas.width, canvas.height)
  drawCover(context, image, 0, 0, canvas.width, 690)

  context.globalAlpha = 0.56
  context.fillStyle = '#050b13'
  context.fillRect(0, 0, canvas.width, 690)
  context.globalAlpha = 1

  context.fillStyle = '#31c7e8'
  context.fillRect(72, 68, 104, 6)
  context.fillStyle = '#f7fafc'
  context.font = '700 30px "Microsoft YaHei", sans-serif'
  context.fillText('成都理工大学青年科技创新服务中心', 72, 128)

  context.fillStyle = '#9ce8f4'
  context.font = '700 26px "Microsoft YaHei", sans-serif'
  context.fillText('你的科创画像', 72, 402)
  context.fillStyle = '#ffffff'
  context.font = '800 92px "Microsoft YaHei", sans-serif'
  context.fillText(data.profile, 72, 510)
  context.fillStyle = '#f2c14e'
  context.font = '800 44px "Microsoft YaHei", sans-serif'
  context.fillText(`${data.department.name}  ${sanitize(data.score)} 适配指数`, 72, 586)

  context.fillStyle = '#edf3f6'
  context.font = '700 34px "Microsoft YaHei", sans-serif'
  context.fillText('四维协作坐标', 72, 780)

  dimensions.forEach(({ id, label }, index) => {
    const x = 72 + (index % 2) * 480
    const y = 862 + Math.floor(index / 2) * 150
    const value = sanitize(data.dimensions[id])
    context.fillStyle = '#b8c7d8'
    context.font = '600 25px "Microsoft YaHei", sans-serif'
    context.fillText(label, x, y)
    context.fillStyle = '#f7fafc'
    context.font = '800 54px "Microsoft YaHei", sans-serif'
    context.fillText(String(value), x, y + 62)
    context.fillStyle = data.department.accent
    context.fillRect(x + 92, y + 30, 280 * (value / 100), 8)
  })

  context.fillStyle = '#b8c7d8'
  context.font = '500 24px "Microsoft YaHei", sans-serif'
  context.fillText('结果用于了解协作偏好，不代表能力或录取概率。', 72, 1312)
  context.fillStyle = '#31c7e8'
  context.font = '700 22px "Microsoft YaHei", sans-serif'
  context.fillText('CDUT YOUTH INNOVATION · 2026', 72, 1362)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Unable to encode result poster'))
      }
    }, 'image/png')
  })
}
