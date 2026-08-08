import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const departmentIds = [
  'office',
  'project',
  'competition',
  'training',
  'science',
  'publicity',
  'language',
]

describe('department image assets', () => {
  it.each(departmentIds)(
    '%s has two heroes and three gallery images',
    async (departmentId) => {
      const root = path.resolve(`public/departments/${departmentId}`)
      const requiredFiles = [
        'hero-600.webp',
        'hero-1200.webp',
        'gallery-1-640.webp',
        'gallery-2-640.webp',
        'gallery-3-640.webp',
      ]

      for (const file of requiredFiles) {
        await expect(access(path.join(root, file))).resolves.toBeUndefined()
      }

      const metadata = await sharp(
        await readFile(path.join(root, 'hero-1200.webp')),
      ).metadata()

      expect(metadata.width).toBe(1200)
      expect(metadata.height).toBe(675)
      expect(metadata.format).toBe('webp')
    },
  )
})
