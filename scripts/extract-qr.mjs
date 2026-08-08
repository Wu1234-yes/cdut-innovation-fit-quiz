import {
  access,
  constants,
  mkdir,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import jsQR from 'jsqr'
import sharp from 'sharp'

const EXPECTED_QR = 'https://qm.qq.com/q/3ALTJ37mxy'
const sourceInput = process.argv[2] ?? process.env.QR_SOURCE
const sourcePath = sourceInput ? path.resolve(sourceInput) : null
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const outputPath = path.join(projectRoot, 'public', 'recruitment-qq-qr.png')
const temporaryPath = path.join(
  path.dirname(outputPath),
  `.recruitment-qq-qr.${process.pid}.${Date.now()}.tmp.png`,
)
const candidates = [
  { crop: { left: 230, top: 1605, width: 330, height: 315 }, quietZone: 0 },
  { crop: { left: 260, top: 1700, width: 220, height: 220 }, quietZone: 20 },
  { crop: { left: 250, top: 1690, width: 240, height: 230 }, quietZone: 20 },
  { crop: { left: 265, top: 1710, width: 210, height: 210 }, quietZone: 24 },
  { crop: { left: 250, top: 1700, width: 230, height: 220 }, quietZone: 24 },
  { crop: { left: 265, top: 1720, width: 198, height: 195 }, quietZone: 28 },
  { crop: { left: 270, top: 1725, width: 190, height: 190 }, quietZone: 30 },
].sort(
  (left, right) =>
    left.crop.width * left.crop.height - right.crop.width * right.crop.height,
)
const treatments = [
  { grayscale: false, name: 'color', threshold: null },
  { grayscale: true, name: 'grayscale', threshold: null },
  { grayscale: true, name: 'threshold-245', threshold: 245 },
  { grayscale: true, name: 'threshold-235', threshold: 235 },
  { grayscale: true, name: 'threshold-225', threshold: 225 },
  { grayscale: true, name: 'threshold-215', threshold: 215 },
]

let temporaryFileExists = false

try {
  if (!sourcePath) {
    throw new Error(
      'Pass a source image path as the first argument or set QR_SOURCE.',
    )
  }

  await access(sourcePath, constants.R_OK)
  const sourceStat = await stat(sourcePath)
  if (!sourceStat.isFile()) {
    throw new Error(`QR source is not a file: ${sourcePath}`)
  }

  const sourceMetadata = await sharp(sourcePath).metadata()
  if (!sourceMetadata.width || !sourceMetadata.height) {
    throw new Error(`QR source dimensions are unavailable: ${sourcePath}`)
  }

  for (const { crop } of candidates) {
    if (
      crop.left < 0 ||
      crop.top < 0 ||
      crop.width <= 0 ||
      crop.height <= 0 ||
      crop.left + crop.width > sourceMetadata.width ||
      crop.top + crop.height > sourceMetadata.height
    ) {
      throw new Error(
        `QR crop is outside source bounds ${sourceMetadata.width}x${sourceMetadata.height}: ${JSON.stringify(crop)}`,
      )
    }
  }

  let selected = null

  candidateLoop: for (const [candidateIndex, { crop, quietZone }] of candidates.entries()) {
    const cropped = await sharp(sourcePath).extract(crop).png().toBuffer()
    const extracted =
      quietZone === 0
        ? cropped
        : await sharp(cropped)
            .extend({
              top: quietZone,
              bottom: quietZone,
              left: quietZone,
              right: quietZone,
              background: { r: 255, g: 255, b: 255, alpha: 1 },
            })
            .png()
            .toBuffer()

    for (const treatment of treatments) {
      let pipeline = sharp(extracted)
      if (treatment.grayscale) {
        pipeline = pipeline.grayscale()
      }
      if (treatment.threshold !== null) {
        pipeline = pipeline.threshold(treatment.threshold)
      }

      const output = await pipeline
        .resize(420, 420, {
          background: { r: 255, g: 255, b: 255, alpha: 1 },
          fit: 'contain',
          kernel: sharp.kernel.nearest,
        })
        .png()
        .toBuffer()
      const { data, info } = await sharp(output)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      const decoded = jsQR(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        { inversionAttempts: 'attemptBoth' },
      )

      if (!decoded?.data) {
        continue
      }
      if (decoded.data !== EXPECTED_QR) {
        throw new Error(`QR decoded unexpected content: ${decoded.data}`)
      }

      selected = {
        candidateIndex,
        output,
        treatment: treatment.name,
      }
      break candidateLoop
    }
  }

  if (!selected) {
    throw new Error('QR decode failed: output is not readable')
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(temporaryPath, selected.output, { flag: 'wx' })
  temporaryFileExists = true

  const outputMetadata = await sharp(temporaryPath).metadata()
  if (outputMetadata.width !== 420 || outputMetadata.height !== 420) {
    throw new Error(
      `QR output has unexpected dimensions: ${outputMetadata.width}x${outputMetadata.height}`,
    )
  }

  await rename(temporaryPath, outputPath)
  temporaryFileExists = false

  console.log(`QR decoded: ${EXPECTED_QR}`)
  console.log(`QR source: ${sourcePath}`)
  console.log(`QR crop candidate: ${selected.candidateIndex + 1}`)
  console.log(`QR treatment: ${selected.treatment}`)
  console.log(`QR asset: ${outputPath} (420x420)`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
} finally {
  if (temporaryFileExists) {
    await unlink(temporaryPath).catch(() => undefined)
  }
}
