import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'

const scriptPath = path.resolve('scripts/extract-qr.mjs')
const assetPath = path.resolve('public/recruitment-qq-qr.png')
const temporaryDirectories: string[] = []

const hashFile = async (filePath: string) =>
  createHash('sha256').update(await readFile(filePath)).digest('hex')

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  )
})

describe('extract-qr script source safety', () => {
  it('requires an explicit source image instead of a machine-specific default', () => {
    const environment = { ...process.env }
    delete environment.QR_SOURCE

    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: 'utf8',
      env: environment,
    })

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Pass a source image path')
  })

  it.each(['cli', 'env'] as const)(
    'rejects out-of-bounds crops from the %s source without replacing the asset',
    async (sourceMode) => {
      const directory = await mkdtemp(path.join(tmpdir(), 'task8-qr-'))
      temporaryDirectories.push(directory)
      const tinySource = path.join(directory, 'tiny.jpg')
      await sharp({
        create: {
          background: '#ffffff',
          channels: 3,
          height: 100,
          width: 100,
        },
      })
        .jpeg()
        .toFile(tinySource)
      const beforeHash = await hashFile(assetPath)

      const result = spawnSync(
        process.execPath,
        [scriptPath, ...(sourceMode === 'cli' ? [tinySource] : [])],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            ...(sourceMode === 'env' ? { QR_SOURCE: tinySource } : {}),
          },
        },
      )

      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('outside source bounds')
      expect(await hashFile(assetPath)).toBe(beforeHash)
    },
  )
})
