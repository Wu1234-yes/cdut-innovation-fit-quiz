import { expect, test, type Page, type TestInfo } from '@playwright/test'

const NIGHT_VOYAGE_URL = '/'

const assertNoHorizontalOverflow = async (page: Page) => {
  const widths = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))

  expect(widths.body).toBeLessThanOrEqual(widths.viewport)
  expect(widths.document).toBeLessThanOrEqual(widths.viewport)
}

const assertContained = async (
  page: Page,
  childSelector: string,
  parentSelector: string,
) => {
  const child = await page.locator(childSelector).boundingBox()
  const parent = await page.locator(parentSelector).boundingBox()
  expect(child).not.toBeNull()
  expect(parent).not.toBeNull()
  expect(child!.x).toBeGreaterThanOrEqual(parent!.x - 1)
  expect(child!.y).toBeGreaterThanOrEqual(parent!.y - 1)
  expect(child!.x + child!.width).toBeLessThanOrEqual(parent!.x + parent!.width + 1)
  expect(child!.y + child!.height).toBeLessThanOrEqual(parent!.y + parent!.height + 1)
}

const assertNoVerticalOverlap = async (
  page: Page,
  upperSelector: string,
  lowerSelector: string,
) => {
  const upper = await page.locator(upperSelector).boundingBox()
  const lower = await page.locator(lowerSelector).boundingBox()
  expect(upper).not.toBeNull()
  expect(lower).not.toBeNull()
  expect(upper!.y + upper!.height).toBeLessThanOrEqual(lower!.y + 1)
}

const capture = async (page: Page, testInfo: TestInfo, name: string) => {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`) })
}

const assertSceneReady = async (page: Page, world: string) => {
  const stage = page.getByTestId('cosmic-scene-stage')
  await expect(stage).toHaveAttribute('data-world', world)
  const video = stage.locator('.cosmic-scene-stage__picture video')
  if (await video.count()) {
    await expect(video).toBeVisible()
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2)
    const asset = await video.evaluate((element: HTMLVideoElement) => ({
      currentTime: element.currentTime,
      height: element.videoHeight,
      src: element.currentSrc,
      width: element.videoWidth,
    }))
    expect(asset.width).toBeGreaterThan(0)
    expect(asset.height).toBeGreaterThan(0)
    expect(asset.currentTime).toBeGreaterThanOrEqual(0)
    expect(new URL(asset.src).pathname).toMatch(/^\/media\/night-voyage\/.+-(?:desktop|mobile)\.mp4$/)
    return
  }

  const image = stage.locator('.cosmic-scene-stage__picture img')
  await expect(image).toBeVisible()
  const asset = await image.evaluate((element: HTMLImageElement) => ({
    complete: element.complete,
    height: element.naturalHeight,
    src: element.getAttribute('src'),
    width: element.naturalWidth,
  }))
  expect(asset.complete).toBe(true)
  expect(asset.width).toBeGreaterThan(0)
  expect(asset.height).toBeGreaterThan(0)
  expect(asset.src).toMatch(/^\/(?:environments|media\/night-voyage)\/.+\.webp$/)
}

const enterDestination = async (page: Page, destination: string) => {
  await page.getByTestId('hub-destination').filter({ hasText: destination }).click()
  await page.getByRole('button', { name: `进入${destination}` }).click()
}

const completeJourney = async (page: Page, testInfo: TestInfo) => {
  await enterDestination(page, '探索镜')
  await page.getByRole('button', { name: /异常变化/ }).click()
  await page.getByRole('button', { name: '放大查看这处细节' }).click()
  await page.getByRole('button', { name: '带回这束信号' }).click()

  await enterDestination(page, '磁吸星图')
  await page.getByRole('button', { name: /新手留言/ }).click()
  await page.getByRole('button', { name: /项目记录/ }).click()
  await page.getByRole('button', { name: '锁定这条星图' }).click()

  await enterDestination(page, '信号接力')
  await page.getByRole('button', { name: /项目参与者/ }).click()
  await page.getByRole('button', { name: '先问现在最卡住哪一步' }).click()
  await page.getByRole('button', { name: '追问：谁能补上这一步？' }).click()
  await page.getByRole('button', { name: '收下这次回应' }).click()

  await page.getByRole('button', { name: '发现一束异常信号' }).click()
  await expect(page.locator('.zero-gravity-signal__backdrop')).toBeVisible()
  if (page.viewportSize()!.width > 680) {
    await expect(page.locator('.zero-gravity-signal__backdrop video')).toBeVisible()
    await expect(page.locator('.zero-gravity-signal__backdrop video')).toHaveAttribute(
      'src',
      '/media/night-voyage/future-reply-desktop.mp4',
    )
  }
  await page.getByRole('button', { name: '先做一小步' }).click()
  await page.getByRole('button', { name: '接收这封回信' }).click()
  await expect(page.getByText(/你不需要先准备好全部答案/)).toBeVisible()
  await page.getByRole('button', { name: '让回信形成星轨' }).click()
  await expect(page.getByRole('button', { name: '星轨已经形成' })).toBeVisible()
  await capture(page, testInfo, 'future-reply')
  await page.getByRole('button', { name: '返回夜航枢纽' }).click()

  await enterDestination(page, '能量路线')
  await page.getByRole('button', { name: '课后半小时' }).click()
  await page.getByRole('button', { name: '找一位同伴' }).click()
  await page.getByRole('button', { name: '先做一次' }).click()
  await page.getByRole('button', { name: '启动能量路线' }).click()
  await page.getByRole('button', { name: '带回这条路线' }).click()

  await enterDestination(page, '广播选择')
  await page.getByRole('button', { name: /海报/ }).click()
  await page.getByRole('button', { name: '发送这束广播' }).click()

  await page.getByRole('button', { name: '汇聚行动星图' }).click()
  await page.getByRole('button', { name: '跳过汇聚' }).click()
}

test('completes the cinematic journey and explores every archive route', async ({
  page,
}, testInfo) => {
  const runtimeErrors: string[] = []
  const failedResources: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`)
  })

  await page.goto(NIGHT_VOYAGE_URL)
  await expect(page.getByRole('heading', { name: '科创夜航' })).toBeVisible()
  await assertSceneReady(page, 'intro')
  await assertContained(page, '.cinematic-intro__guide', '.cinematic-intro')
  await assertContained(
    page,
    '.cinematic-intro__dialogue',
    '.cinematic-intro',
  )
  const introCharacters = await page.evaluate(() => {
    const explorer = document.querySelector('.cinematic-intro__explorer')?.getBoundingClientRect()
    const mascot = document.querySelector('.cinematic-intro__guide .voyage-mascot')?.getBoundingClientRect()
    if (!explorer || !mascot) return null
    return {
      overlapX: Math.max(0, Math.min(explorer.right, mascot.right) - Math.max(explorer.left, mascot.left)),
      overlapY: Math.max(0, Math.min(explorer.bottom, mascot.bottom) - Math.max(explorer.top, mascot.top)),
    }
  })
  expect(introCharacters).not.toBeNull()
  expect(introCharacters!.overlapX * introCharacters!.overlapY).toBeLessThanOrEqual(1)
  await assertNoHorizontalOverflow(page)
  await capture(page, testInfo, 'intro')

  await page.getByRole('button', { name: '进入夜航' }).click()
  await expect(page.getByText('夜航枢纽')).toBeVisible()
  await assertSceneReady(page, 'hub')
  await expect(page.getByTestId('hub-destination')).toHaveCount(5)
  await page.getByTestId('hub-destination').first().focus()
  await expect(page.getByTestId('hub-destination').first()).toBeFocused()
  await assertNoHorizontalOverflow(page)
  await capture(page, testInfo, 'hub')

  await completeJourney(page, testInfo)
  await expect(page.getByRole('heading', { name: '你的夜航信号，正在连成一张星图' })).toBeVisible()
  await expect(page.getByTestId('result-observatory')).toBeVisible()
  await expect(page.getByTestId('observatory-node')).toHaveCount(5)
  await assertSceneReady(page, 'result')
  const screeningEntry = await page.getByRole('button', { name: '进入科创放映舱' }).boundingBox()
  expect(screeningEntry).not.toBeNull()
  expect(screeningEntry!.y + screeningEntry!.height).toBeLessThanOrEqual(
    page.viewportSize()!.height + 1,
  )
  expect(await page.locator('body').innerText()).not.toMatch(/适配率|部门排名|最适合|唯一推荐|%/)
  await assertNoHorizontalOverflow(page)
  await capture(page, testInfo, 'result')

  await page.getByRole('button', { name: '查看全部部门' }).click()
  await expect(page.getByRole('heading', { name: '七部门探索图鉴' })).toBeVisible()
  await assertSceneReady(page, 'atlas')
  await expect(page.getByRole('button', { name: /查看.*档案/ })).toHaveCount(7)
  await expect(page.getByText('QQ群：723526608')).toBeVisible()
  await assertNoHorizontalOverflow(page)
  await capture(page, testInfo, 'department-atlas')

  await page.getByRole('button', { name: '查看宣传部档案' }).click()
  await page.getByRole('button', { name: '打开宣传部完整档案' }).click()
  await expect(page.getByRole('heading', { name: '宣传部', level: 1 })).toBeVisible()
  await expect(page.getByText('QQ群：723526608')).toBeVisible()
  await assertNoVerticalOverlap(page, '.department-archive__nav', '.department-archive__deck')
  await assertNoHorizontalOverflow(page)
  await capture(page, testInfo, 'department-publicity')
  await page.getByRole('button', { name: '返回部门总览' }).click()
  await page.getByRole('button', { name: '返回行动地图' }).click()

  await page.getByRole('button', { name: '进入科创放映舱' }).click()
  await expect(page.getByRole('heading', { name: '科创放映舱' })).toBeVisible()
  await expect(page.getByTestId('projection-panel')).toHaveCount(3)
  const firstFilmAlt = await page.locator('.cinematic-film-reel__panel.is-2 img').getAttribute('alt')
  expect(firstFilmAlt).not.toMatch(/聊天|群聊|记录截图/)
  expect(firstFilmAlt).toMatch(/创新创业交流活动现场/)
  const reel = page.getByTestId('film-reel')
  await reel.dispatchEvent('pointerdown', { clientX: 210 })
  await expect(reel).toHaveClass(/is-paused/)
  await reel.dispatchEvent('pointerup', { clientX: 206 })
  await page.waitForTimeout(1_000)
  await expect(reel).not.toHaveClass(/is-paused/)
  await assertNoHorizontalOverflow(page)
  await capture(page, testInfo, 'screening-room')

  await page.getByRole('button', { name: '继续看看' }).click()
  await page.getByRole('button', { name: /打开.*档案/ }).click()
  await expect(page.locator('.department-archive__hero-copy h1')).toBeVisible()
  await expect(page.getByTestId('responsibility-track-item')).toHaveCount(4)
  await assertNoHorizontalOverflow(page)

  await page.reload()
  await expect(page.locator('.department-archive__hero-copy h1')).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  expect(failedResources).toEqual([])
  expect(runtimeErrors).toEqual([])
})

test('keeps the static fast path usable under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(NIGHT_VOYAGE_URL)

  await expect(page.getByTestId('cosmic-core-canvas')).toHaveCount(0)
  await expect(page.getByTestId('cosmic-scene-stage')).toHaveClass(/is-reduced/)
  await assertSceneReady(page, 'intro')
  await page.getByRole('button', { name: '直接看看科创能做什么' }).click()

  await expect(page.getByRole('heading', { name: '从一件小事开始，也算科创' })).toBeVisible()
  expect(await page.locator('body').innerText()).not.toMatch(/适配率|部门排名|最适合|唯一推荐|%/)
  await assertNoHorizontalOverflow(page)
})

test('keeps the future reply signal contained on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(NIGHT_VOYAGE_URL)
  await page.getByRole('button', { name: '进入夜航' }).click()
  await page.getByTestId('hub-destination').nth(0).click()
  await page.getByRole('button', { name: '进入探索镜' }).click()
  await page.getByRole('button', { name: '跳过这站' }).click()
  await page.getByTestId('hub-destination').nth(1).click()
  await page.getByRole('button', { name: '进入磁吸星图' }).click()
  await page.getByRole('button', { name: '跳过这站' }).click()
  await page.getByRole('button', { name: '发现一束异常信号' }).click()
  await expect(page.getByRole('dialog', { name: '失重信号舱' })).toBeVisible()
  await expect(page.locator('.zero-gravity-signal__backdrop')).toHaveClass(/is-video/)
  await expect(page.locator('.zero-gravity-signal__backdrop video')).toHaveAttribute(
    'src',
    '/media/night-voyage/future-reply-mobile.mp4',
  )
  await assertNoHorizontalOverflow(page)
})

test('lets a visitor skip a station without blocking the voyage', async ({ page }) => {
  await page.goto(NIGHT_VOYAGE_URL)
  await page.getByRole('button', { name: '进入夜航' }).click()
  await enterDestination(page, '能量路线')
  await page.getByRole('button', { name: '跳过这站' }).click()

  await expect(page.getByText('夜航枢纽')).toBeVisible()
  await expect(page.getByText('已回收 1 / 5 束信号')).toBeVisible()
  await assertNoHorizontalOverflow(page)
})
