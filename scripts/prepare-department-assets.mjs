import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.join(projectRoot, 'design-research', 'ppt-media')
const outputRoot = path.join(projectRoot, 'public', 'departments')

const sources = {
  office: ['image17.jpeg', 'image10.jpeg', 'image11.jpeg', 'image14.jpeg'],
  project: ['image21.png', 'image22.jpeg', 'image20.png', 'image18.png'],
  competition: ['image16.jpeg', 'image17.png', 'image20.png', 'image12.jpeg'],
  training: ['image4.jpeg', 'image5.png', 'image7.png', 'image8.jpeg'],
  science: ['image26.jpeg', 'image27.jpeg', 'image25.jpeg', 'image28.png'],
  publicity: ['image23.jpeg', 'image10.png', 'image20.jpeg', 'image21.jpeg'],
  language: ['image12.png', 'image13.png', 'image14.png', 'image15.png'],
}

const writeHero = async (source, output, width) => {
  await sharp(source)
    .rotate()
    .resize({
      width,
    height: Math.round((width * 9) / 16),
    fit: 'cover',
    position: 'attention',
  })
    .webp({ quality: 82, effort: 5 })
    .toFile(output)
}

const writeGallery = async (source, output) => {
  await sharp(source)
    .rotate()
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(output)
}

for (const [departmentId, files] of Object.entries(sources)) {
  const departmentSourceRoot = path.join(sourceRoot, departmentId)
  const departmentOutputRoot = path.join(outputRoot, departmentId)
  const [hero, ...gallery] = files

  await mkdir(departmentOutputRoot, { recursive: true })
  await Promise.all([
    writeHero(
      path.join(departmentSourceRoot, hero),
      path.join(departmentOutputRoot, 'hero-600.webp'),
      600,
    ),
    writeHero(
      path.join(departmentSourceRoot, hero),
      path.join(departmentOutputRoot, 'hero-1200.webp'),
      1200,
    ),
    ...gallery.map((file, index) =>
      writeGallery(
        path.join(departmentSourceRoot, file),
        path.join(departmentOutputRoot, `gallery-${index + 1}-640.webp`),
      ),
    ),
  ])

  process.stdout.write(`${departmentId}: ready\n`)
}
