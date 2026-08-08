import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { build } from 'vite'

let outputDirectory: string | undefined

afterEach(() => {
  vi.unstubAllEnvs()
  if (outputDirectory) {
    rmSync(outputDirectory, { force: true, recursive: true })
    outputDirectory = undefined
  }
})

describe('deployment base path', () => {
  it('builds scripts, styles, and the QR entry below VITE_BASE_PATH', async () => {
    outputDirectory = mkdtempSync(join(tmpdir(), 'cdut-fit-quiz-'))
    vi.stubEnv('VITE_BASE_PATH', '/club/')

    await build({
      build: { emptyOutDir: true, outDir: outputDirectory },
      configFile: resolve('vite.config.ts'),
      logLevel: 'silent',
    })

    const indexHtml = readFileSync(join(outputDirectory, 'index.html'), 'utf8')
    expect(indexHtml).toMatch(/(?:src|href)="\/club\/assets\//)

    const javascript = readdirSync(join(outputDirectory, 'assets'))
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFileSync(join(outputDirectory!, 'assets', file), 'utf8'))
      .join('\n')
    expect(javascript).toContain('/club/')
    expect(javascript).toContain('recruitment-qq-qr.png')
  })
})
