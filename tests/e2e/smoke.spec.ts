import { expect, test, type Page } from '@playwright/test'
import { PNG } from 'pngjs'

const assertNoHorizontalOverflow = async (page: Page) => {
  const widths = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))

  expect(widths.body).toBeLessThanOrEqual(widths.viewport)
  expect(widths.document).toBeLessThanOrEqual(widths.viewport)
}

const assertTouchTargets = async (page: Page) => {
  const targets = page.locator('button:visible, .quiz-option:visible')
  const count = await targets.count()
  expect(count).toBeGreaterThan(0)

  for (let index = 0; index < count; index += 1) {
    const box = await targets.nth(index).boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
  }
}

const assertOptionLayout = async (page: Page) => {
  const option = await page.locator('.quiz-option').first().boundingBox()
  const label = await page.locator('.quiz-option__label').first().boundingBox()

  expect(option).not.toBeNull()
  expect(label).not.toBeNull()
  expect(label!.width).toBeGreaterThan(option!.width * 0.7)
}

const assertDisabledAdvanceIsMuted = async (page: Page) => {
  const style = await page
    .locator('.quiz-actions .button--primary')
    .evaluate((button) => {
      const computed = window.getComputedStyle(button)
      return {
        backgroundColor: computed.backgroundColor,
        cursor: computed.cursor,
      }
    })

  expect(style.backgroundColor).toBe('rgba(49, 199, 232, 0.12)')
  expect(style.cursor).toBe('not-allowed')
}

const assertDirectoryHasNoTrailingFill = async (page: Page) => {
  const backgroundColor = await page
    .locator('.department-directory__list')
    .evaluate((directory) => window.getComputedStyle(directory).backgroundColor)

  expect(backgroundColor).toBe('rgba(0, 0, 0, 0)')
}

const startAssessment = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: '开始扫描' }).click()
  await expect(page.getByTestId('signal-progress')).toBeVisible()
  await expect(page.getByText('1 / 20')).toBeVisible()
  await assertOptionLayout(page)
  await assertDisabledAdvanceIsMuted(page)
}

const finishAssessment = async (page: Page, keyboardOnly = false) => {
  for (let question = 1; question <= 20; question += 1) {
    const firstOption = page.getByRole('radio').first()
    const firstOptionRow = page.locator('label.quiz-option').first()
    const advance = page.getByRole('button', {
      name: question === 20 ? '生成结果' : '下一题',
    })

    if (keyboardOnly) {
      await firstOption.focus()
      await page.keyboard.press('Space')
      await advance.focus()
      await page.keyboard.press('Enter')
    } else {
      await firstOptionRow.click()
      await advance.click()
    }
  }

  await expect(page.getByRole('region', { name: '首选部门' })).toBeVisible({
    timeout: 5_000,
  })
}

test('shows the assessment title on the home page', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /科创部门适配测评/ }),
  ).toBeVisible()
  await assertNoHorizontalOverflow(page)
  await assertTouchTargets(page)
})

test('restores the current answer after a reload', async ({ page }) => {
  await startAssessment(page)
  await page.locator('label.quiz-option').nth(1).click()
  await page.getByRole('button', { name: '下一题' }).click()
  await page.locator('label.quiz-option').first().click()

  await page.reload()

  await expect(page.getByTestId('signal-progress')).toBeVisible()
  await expect(page.getByText('2 / 20')).toBeVisible()
  await expect(page.getByRole('radio').first()).toBeChecked()
  await assertNoHorizontalOverflow(page)
  await assertTouchTargets(page)
})

test('completes the assessment, opens details, returns focus, and resets', async ({
  page,
}) => {
  await startAssessment(page)
  await finishAssessment(page)
  await expect(page.getByTestId('profile-radar')).toBeVisible()
  await expect(page.locator('.result-reveal__media img')).toBeVisible()
  await assertDirectoryHasNoTrailingFill(page)
  await assertNoHorizontalOverflow(page)
  await assertTouchTargets(page)

  const detailsButton = page.getByRole('button', {
    name: /^查看首选部门.+详情$/,
  })
  await detailsButton.click()
  await expect(page.getByRole('button', { name: '返回结果' })).toBeVisible()
  await expect(page.getByTestId('department-hero')).toBeVisible()
  await expect(page.getByTestId('evidence-image')).toHaveCount(3)
  await assertNoHorizontalOverflow(page)

  await page.getByRole('button', { name: '返回结果' }).click()
  await expect(detailsButton).toBeFocused()
  await page.getByRole('button', { name: '重新测评' }).click()
  await expect(page.getByRole('button', { name: '开始扫描' })).toBeVisible()
})

test('downloads a locally generated result poster', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1440x900')

  await startAssessment(page)
  await finishAssessment(page)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '生成结果海报' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/^科创部门适配结果-.+\.png$/)
  const stream = await download.createReadStream()
  let size = 0
  for await (const chunk of stream) {
    size += chunk.length
  }
  expect(size).toBeGreaterThan(20_000)
})

test('supports a keyboard-only assessment flow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-1440x900')

  await page.goto('/')
  const startButton = page.getByRole('button', { name: '开始扫描' })
  await startButton.focus()
  await page.keyboard.press('Enter')
  await finishAssessment(page, true)
})

test('renders a nonblank moving radar canvas', async ({ page }, testInfo) => {
  test.skip(!['mobile-390x844', 'desktop-1440x900'].includes(testInfo.project.name))

  await page.goto('/')
  const canvas = page.locator('.radar-visual--canvas canvas')
  await expect(canvas).toBeVisible()

  const firstFrame = await canvas.screenshot()
  await page.waitForTimeout(600)
  const secondFrame = await canvas.screenshot()
  const png = PNG.sync.read(firstFrame)
  const corner = [png.data[0], png.data[1], png.data[2]]
  const colors = new Set<string>()
  let nonBackgroundPixels = 0

  for (let offset = 0; offset < png.data.length; offset += 4) {
    const red = png.data[offset]
    const green = png.data[offset + 1]
    const blue = png.data[offset + 2]
    colors.add(`${red >> 4}:${green >> 4}:${blue >> 4}`)
    if (
      Math.abs(red - corner[0]) +
        Math.abs(green - corner[1]) +
        Math.abs(blue - corner[2]) >
      24
    ) {
      nonBackgroundPixels += 1
    }
  }

  expect(colors.size).toBeGreaterThanOrEqual(12)
  expect(nonBackgroundPixels / (png.width * png.height)).toBeGreaterThan(0.05)
  expect(secondFrame.equals(firstFrame)).toBe(false)
})

test.describe('reduced motion', () => {
  test('uses the static radar without an animated canvas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    await expect
      .poll(() =>
        page.evaluate(() =>
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        ),
      )
      .toBe(true)
    await expect(page.locator('.radar-visual--static')).toBeVisible()
    await expect(page.locator('.radar-visual--canvas canvas')).toHaveCount(0)
  })

  test('keeps quiz and result content available without reveal motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440x900')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await startAssessment(page)
    await finishAssessment(page)

    await expect(page.getByTestId('profile-radar')).toBeVisible()
    await expect(page.locator('.result-reveal__media img')).toBeVisible()
    await expect(page.locator('.result-view--reduced-motion')).toBeVisible()
  })
})
