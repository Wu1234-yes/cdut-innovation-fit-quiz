import { expect, test, type Page } from '@playwright/test'

const sessionKey = 'cdut-new-student-voyage-session-v1'

const answers = {
  observation: { stationId: 'observation', choiceId: 'pattern', weights: { observation: 3, progress: 1 } },
  experiment: { stationId: 'experiment', choiceId: 'prototype', weights: { handsOn: 3, observation: 1 } },
  collaboration: { stationId: 'collaboration', choiceId: 'clarify', weights: { collaboration: 3, expression: 1 } },
  progress: { stationId: 'progress', choiceId: 'milestone', weights: { progress: 3, collaboration: 1 } },
  expression: { stationId: 'expression', choiceId: 'story', weights: { expression: 3, observation: 1 } },
}

const reportState = {
  version: 1,
  view: 'report',
  activeStationId: null,
  completedMythCount: 3,
  screeningAct: 2,
  answers,
}

async function openState(page: Page, state: Record<string, unknown>) {
  await page.evaluate(
    ({ key, nextState }) => {
      sessionStorage.setItem(key, JSON.stringify({ version: 1, state: nextState }))
    },
    { key: sessionKey, nextState: state },
  )
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
}

async function expectStableViewport(page: Page, enforceTouchTargets: boolean) {
  const audit = await page.evaluate(() => {
    const viewportWidth = window.innerWidth
    const belongsToHorizontalScroller = (element: HTMLElement) => {
      let parent = element.parentElement
      while (parent) {
        const style = getComputedStyle(parent)
        if (
          parent.scrollWidth > parent.clientWidth + 1 &&
          (style.overflowX === 'auto' || style.overflowX === 'scroll')
        ) return true
        parent = parent.parentElement
      }
      return false
    }
    const interactive = [...document.querySelectorAll<HTMLElement>('button, a[href]')]
      .filter((element) => {
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
      })
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          label: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 40) || element.tagName,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
          inScroller: belongsToHorizontalScroller(element),
        }
      })

    return {
      viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      outside: interactive.filter((item) => !item.inScroller && (item.left < -1 || item.right > viewportWidth + 1)),
      undersized: interactive.filter((item) => item.width < 44 || item.height < 44),
    }
  })

  expect(audit.scrollWidth).toBeLessThanOrEqual(audit.viewportWidth + 1)
  expect(audit.outside).toEqual([])
  if (enforceTouchTargets) expect(audit.undersized).toEqual([])
}

const viewports = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-412x915', width: 412, height: 915 },
  { name: 'desktop-1280x800', width: 1280, height: 800 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
]

for (const viewport of viewports) {
  test(`${viewport.name} keeps the intro and report stable`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    await expectStableViewport(page, viewport.width < 600)
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-intro.png`) })

    await openState(page, reportState)
    await expect(page.getByText('你的行动信号')).toBeVisible()
    const reportCinematic = await page.locator('.voyage-report__cinematic').boundingBox()
    expect(reportCinematic?.height ?? 0).toBeGreaterThanOrEqual(viewport.height - 1)
    await expectStableViewport(page, viewport.width < 600)
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-report.png`) })
  })
}

for (const viewport of [viewports[0], viewports[3]]) {
  test(`${viewport.name} keeps exploration views stable`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await openState(page, { ...reportState, view: 'screening', screeningAct: 0 })
    await page.getByRole('button', { name: '查看赛训部镜头' }).click()
    await expect(page.getByRole('heading', { name: '赛训部 / 选题研讨' })).toBeVisible()
    await page.waitForTimeout(450)
    await page.evaluate(() => window.scrollTo(0, 0))
    await expectStableViewport(page, viewport.width < 600)
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-screening.png`) })

    await openState(page, { ...reportState, view: 'atlas' })
    await expect(page.getByText('七部门探索图鉴')).toBeVisible()
    await expectStableViewport(page, viewport.width < 600)
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-atlas.png`) })

    await openState(page, {
      ...reportState,
      view: 'archive',
      selectedDepartmentId: 'publicity',
      archiveReturnView: 'report',
    })
    await expect(page.getByRole('heading', { name: '宣传部' })).toBeVisible()
    await expectStableViewport(page, viewport.width < 600)
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-archive.png`) })

    await page.getByRole('button', { name: '下一个部门' }).click()
    await expect(page.getByRole('heading', { name: '语培部' })).toBeVisible()
    await page.getByRole('button', { name: '打开宣传部档案' }).click()
    await expect(page.getByRole('heading', { name: '宣传部' })).toBeVisible()

    await openState(page, { ...reportState, view: 'egg' })
    await expect(page.getByText('没有一种航线，')).toBeVisible()
    await expectStableViewport(page, viewport.width < 600)
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-egg.png`) })
  })
}

test('mobile handoff CTA stays clickable above the orbit visual', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await openState(page, {
    ...reportState,
    view: 'handoff',
    activeStationId: null,
    answers: {},
  })

  await page.getByRole('button', { name: '试试就试试' }).click()

  await expect(page.locator('.station-shell--observation')).toBeVisible()
})

test('station navigation works before the first answer', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await openState(page, {
    ...reportState,
    view: 'station',
    activeStationId: 'observation',
    answers: {},
  })

  await page.getByRole('button', { name: '返回行动导航' }).click()
  await expect(page.getByRole('button', { name: '试试就试试' })).toBeVisible()

  await page.getByRole('button', { name: '试试就试试' }).click()
  await page.getByRole('button', { name: '先看报告' }).click()
  await expect(page.getByText('一束待显影的行动信号')).toBeVisible()
})
