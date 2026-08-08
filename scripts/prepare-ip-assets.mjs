import { mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = 'C:/Users/wjj123/AppData/Local/Temp/codex-clipboard-4cc89aed-074c-4ebb-bfcd-2612dee4cc43.png'
const outputRoot = path.join(projectRoot, 'public', 'ip')

const sprites = {
  cheer: { column: 4, row: 2 },
  research: { column: 1, row: 2 },
  focus: { column: 0, row: 1 },
  launch: { column: 0, row: 2 },
}

const removeWhiteBackground = async (buffer, width, height) => {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const visited = new Uint8Array(width * height)
  const queue = []
  const isWhite = (pixelIndex) =>
    data[pixelIndex] > 242 && data[pixelIndex + 1] > 242 && data[pixelIndex + 2] > 242
  const addEdgePixel = (x, y) => {
    const point = y * width + x
    if (!visited[point]) {
      visited[point] = 1
      queue.push(point)
    }
  }

  for (let x = 0; x < width; x += 1) {
    addEdgePixel(x, 0)
    addEdgePixel(x, height - 1)
  }
  for (let y = 1; y < height - 1; y += 1) {
    addEdgePixel(0, y)
    addEdgePixel(width - 1, y)
  }

  while (queue.length > 0) {
    const point = queue.shift()
    if (point === undefined) break
    const x = point % width
    const y = Math.floor(point / width)
    const pixelIndex = point * 4
    if (!isWhite(pixelIndex)) continue
    data[pixelIndex + 3] = 0
    for (const [nextX, nextY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height) {
        const nextPoint = nextY * width + nextX
        if (!visited[nextPoint]) {
          visited[nextPoint] = 1
          queue.push(nextPoint)
        }
      }
    }
  }
  return sharp(data, { raw: { width, height, channels: info.channels } }).png().toBuffer()
}

await mkdir(outputRoot, { recursive: true })
await copyFile(
  'C:/Users/wjj123/AppData/Local/Temp/codex-clipboard-98ae9260-22a6-4cf1-8a6c-093f17f7ca98.gif',
  path.join(outputRoot, 'center-signal.gif'),
)

const metadata = await sharp(source).metadata()
const width = metadata.width ?? 684
const height = metadata.height ?? 627
const cellWidth = Math.floor(width / 5)
const cellHeight = 118
const top = 18

for (const [name, position] of Object.entries(sprites)) {
  const left = position.column * cellWidth + 10
  const topOffset = top + position.row * 149
  const crop = await sharp(source)
    .extract({ left, top: topOffset, width: cellWidth - 20, height: cellHeight })
    .png()
    .toBuffer()
  const transparent = await removeWhiteBackground(crop, cellWidth - 20, cellHeight)
  await sharp(transparent).resize({ width: 176, height: 176, fit: 'contain' }).toFile(path.join(outputRoot, `${name}.png`))
}

process.stdout.write('ip: ready\n')
