import { existsSync } from 'node:fs'
import path from 'node:path'
import jsQR from 'jsqr'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const EXPECTED_QR = 'https://qm.qq.com/q/3ALTJ37mxy'

describe('recruitment QQ QR asset', () => {
  it('exists at 420 by 420 pixels and decodes to the expected QQ link', async () => {
    const assetPath = path.resolve('public/recruitment-qq-qr.png')

    expect(existsSync(assetPath)).toBe(true)
    if (!existsSync(assetPath)) {
      return
    }

    const { data, info } = await sharp(assetPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    expect(info.width).toBe(420)
    expect(info.height).toBe(420)

    const decoded = jsQR(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
    )
    expect(decoded?.data).toBe(EXPECTED_QR)
  })
})
