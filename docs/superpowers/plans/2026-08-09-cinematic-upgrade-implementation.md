# 科创夜航第二轮动态体验升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不延长核心试航流程的前提下，把放映仓扩展为三幕七部门，升级破冰、转场、报告和彩蛋的动态背景与交互，并修正文字疏密和五维星图可读性。

**Architecture:** 继续使用 React 19、Vite、现有 `CinematicBackdrop`、Motion 和 CSS 动画体系。新增的数据与视觉算法放在独立模块中，页面组件只负责状态和渲染；所有新视频本地化为桌面版、手机版和 WebP 封面，并通过统一素材清单引用。

**Tech Stack:** React 19、TypeScript、Vite、Motion、Vitest、Testing Library、Playwright、Sharp/FFmpeg 素材处理。

---

## 文件结构

- Create: `src/voyage/content/cinematicAssets.ts`，统一声明新动态素材路径和用途。
- Create: `src/voyage/content/cinematicAssets.test.ts`，验证素材文件存在并有移动端回退。
- Modify: `src/voyage/content/screening.ts`，由三张图片扩展为三幕七部门镜头。
- Modify: `src/voyage/components/CinematicFilmReel.tsx`，支持七镜头轨道和当前镜头信息。
- Create: `src/voyage/components/VoyageScreeningRoom.test.tsx`，验证七部门镜头和切换。
- Modify: `src/voyage/components/VoyageScreeningRoom.tsx`，显示部门、正在做和新生入口。
- Modify: `src/voyage/components/MythBreaker.tsx`，接入球体背景、空间卡组和点击锁定反馈。
- Create: `src/voyage/components/MythBreaker.test.tsx`，验证三卡展开与可访问状态。
- Create: `src/voyage/components/VoyageHandoff.tsx`，承载独立背景和 Relocation 转场。
- Create: `src/voyage/components/VoyageHandoff.test.tsx`，验证 CTA 和转场状态。
- Modify: `src/voyage/App.tsx`，使用独立过渡组件。
- Create: `src/voyage/result/reportVisuals.ts`，计算可读的相对星图半径。
- Create: `src/voyage/result/reportVisuals.test.ts`，验证最高维度接近外圈、低值不堆在中心。
- Modify: `src/voyage/components/VoyageReportView.tsx`，接入视频背景、星图提示和交互节点。
- Modify: `src/voyage/components/SignalAnomaly.tsx`，接入独立视频和隐藏信号。
- Modify: `src/voyage/components/SignalAnomaly.test.tsx`，验证隐藏信号和返回报告。
- Modify: `src/voyage/components/StationShell.tsx`，增加 Nimbus 风格选项锁定反馈。
- Modify: `src/voyage/components/StationShell.test.tsx`，验证选项状态和提交重置。
- Modify: `src/voyage/styles/new-voyage.css`，页面主体、星图、转场和彩蛋样式。
- Modify: `src/voyage/styles/film-reel.css`，七镜头胶片和镜头索引。
- Modify: `src/voyage/styles/mobile.css`，手机视频、卡组和星图布局。
- Modify: `tests/e2e/responsive.spec.ts`，覆盖新增背景、七部门镜头和隐藏信号。
- Modify: `README.md`，记录新素材和验证命令。

### Task 1: 本地化动态素材

- [ ] **Step 1: 建立素材失败测试**

在 `src/voyage/content/cinematicAssets.test.ts` 中验证每组素材均有桌面视频、手机视频和封面：

```ts
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cinematicAssets } from './cinematicAssets'

describe('cinematicAssets', () => {
  it.each(Object.entries(cinematicAssets))('%s has desktop, mobile and poster files', (_, asset) => {
    for (const source of [asset.desktopVideo, asset.mobileVideo, asset.poster]) {
      expect(existsSync(resolve('public', source.replace(/^\//, '')))).toBe(true)
    }
  })
})
```

- [ ] **Step 2: 运行测试并确认缺少素材时失败**

Run: `pnpm test src/voyage/content/cinematicAssets.test.ts`

Expected: FAIL，提示 `cinematicAssets` 或本地素材不存在。

- [ ] **Step 3: 从用户授权素材站获取并处理素材**

复用工程中已经准备好的本地高清素材，按以下用途登记，不重复下载：

```text
mythPlanet -> public/media/night-voyage/clues-green-planet-*
handoffDrift -> public/media/night-voyage/map-black-hole-*
reportBackground -> public/media/night-voyage/result-collaboration-*
eggLiquid -> public/media/night-voyage/dialogue-cosmic-mind-*
```

桌面视频目标宽度 1920，手机视频目标宽度 720，均去除音轨并启用 `faststart`。若参考作品只提供代码或受限素材，则复用其运动规律重新生成本项目自己的背景，不复制完整视觉标识。

- [ ] **Step 4: 创建统一素材清单**

```ts
export const cinematicAssets = {
  mythPlanet: {
    desktopVideo: '/media/night-voyage/clues-green-planet-desktop.mp4',
    mobileVideo: '/media/night-voyage/clues-green-planet-mobile.mp4',
    poster: '/media/night-voyage/clues-green-planet.webp',
  },
  handoffDrift: {
    desktopVideo: '/media/night-voyage/map-black-hole-desktop.mp4',
    mobileVideo: '/media/night-voyage/map-black-hole-mobile.mp4',
    poster: '/media/night-voyage/map-black-hole.webp',
  },
  reportBackground: {
    desktopVideo: '/media/night-voyage/result-collaboration-desktop.mp4',
    mobileVideo: '/media/night-voyage/result-collaboration-mobile.mp4',
    poster: '/media/night-voyage/result-collaboration.webp',
  },
  eggLiquid: {
    desktopVideo: '/media/night-voyage/dialogue-cosmic-mind-desktop.mp4',
    mobileVideo: '/media/night-voyage/dialogue-cosmic-mind-mobile.mp4',
    poster: '/media/night-voyage/dialogue-cosmic-mind.webp',
  },
} as const
```

- [ ] **Step 5: 运行素材测试**

Run: `pnpm test src/voyage/content/cinematicAssets.test.ts`

Expected: PASS。

### Task 2: 三幕七部门放映仓

- [ ] **Step 1: 写七镜头失败测试**

测试放映仓包含七个不同部门镜头，点击宣传部镜头后出现具体动作：

```tsx
render(<VoyageScreeningRoom projects={projects} onBack={vi.fn()} onContinue={vi.fn()} />)
expect(screen.getAllByRole('button', { name: /镜头/ })).toHaveLength(7)
fireEvent.click(screen.getByRole('button', { name: /宣传部镜头/ }))
expect(screen.getByText('拍摄活动现场并整理图文素材')).toBeInTheDocument()
```

- [ ] **Step 2: 运行失败测试**

Run: `pnpm test src/voyage/components/VoyageScreeningRoom.test.tsx`

Expected: FAIL，当前只有三幕控制。

- [ ] **Step 3: 定义七部门镜头数据**

在 `screening.ts` 定义 `ScreeningFrame`：

```ts
export interface ScreeningFrame {
  id: string
  act: 'ACT 01' | 'ACT 02' | 'ACT 03'
  departmentId: DepartmentId
  departmentName: string
  action: string
  startHere: string
  project: ProjectRecord
}
```

按项目部、科素部、办公室、竞赛部、赛训部、宣传部、语培部生成七条真实镜头数据。

- [ ] **Step 4: 修改放映仓组件**

让 `CinematicFilmReel` 接收七个 `project`，`VoyageScreeningRoom` 以当前镜头渲染：

```tsx
<span>{frame.act} / {frame.departmentName}</span>
<h2>{frame.departmentName} / 正在做</h2>
<p>{frame.action}</p>
<strong>{frame.startHere}</strong>
```

七个镜头按钮提供 `aria-label="查看宣传部镜头"` 等明确名称。

- [ ] **Step 5: 运行测试和人工检查**

Run: `pnpm test src/voyage/components/VoyageScreeningRoom.test.tsx`

Expected: PASS，并在 `390×844` 下可滑动切换。

### Task 3: Orbis 风格破冰卡组

- [ ] **Step 1: 写卡组状态失败测试**

```tsx
render(<MythBreaker onComplete={vi.fn()} />)
const cards = screen.getAllByRole('button', { name: /SIGNAL/ })
fireEvent.click(cards[0])
expect(cards[0]).toHaveAttribute('aria-expanded', 'true')
expect(cards[1]).toHaveAttribute('aria-expanded', 'false')
```

- [ ] **Step 2: 运行失败测试**

Run: `pnpm test src/voyage/components/MythBreaker.test.tsx`

Expected: FAIL，当前没有 `aria-expanded` 和背景组件。

- [ ] **Step 3: 接入背景和空间状态**

在 `MythBreaker` 中使用 `cinematicAssets.mythPlanet`，并为卡片增加：

```tsx
aria-expanded={isOpen}
data-depth={isOpen ? 'active' : revealed.length > 0 ? 'receded' : 'idle'}
```

增加锁定反馈层：

```tsx
<span aria-hidden="true" className="myth-card__lock"><i /><i /></span>
```

- [ ] **Step 4: 实现桌面空间卡组和手机纵向卡组**

桌面使用 `perspective`、小幅 `translate3d` 和层级变化；手机端取消覆盖和大幅位移，保持自然文档流。所有标题 `letter-spacing: 0`。

- [ ] **Step 5: 运行测试**

Run: `pnpm test src/voyage/components/MythBreaker.test.tsx`

Expected: PASS。

### Task 4: 独立关键转场组件

- [ ] **Step 1: 写过渡页失败测试**

```tsx
render(<VoyageHandoff onBegin={vi.fn()} />)
expect(screen.getByText('刚才看到的是')).toBeInTheDocument()
fireEvent.click(screen.getByRole('button', { name: '试试就试试' }))
expect(onBegin).toHaveBeenCalledTimes(1)
```

- [ ] **Step 2: 运行失败测试**

Run: `pnpm test src/voyage/components/VoyageHandoff.test.tsx`

Expected: FAIL，组件尚不存在。

- [ ] **Step 3: 创建 `VoyageHandoff`**

组件使用 `cinematicAssets.handoffDrift`、退场胶片、移动信号和现有 CTA。把 `App.tsx` 中的内联 `Handoff` 删除并替换为独立组件。

- [ ] **Step 4: 调整文字疏密**

标题桌面最大字号 84px、行高 1.04；手机最大字号 48px、行高 1.1；不使用负字距。

- [ ] **Step 5: 运行测试**

Run: `pnpm test src/voyage/components/VoyageHandoff.test.tsx src/voyage/app/voyageReducer.test.ts`

Expected: PASS。

### Task 5: 五维星图与报告背景

- [ ] **Step 1: 写相对半径失败测试**

```ts
expect(mapReportRadii([40, 20, 20, 27, 27], 126)).toEqual(
  expect.arrayContaining([expect.any(Number)]),
)
expect(Math.max(...radii)).toBeGreaterThanOrEqual(110)
expect(Math.min(...radii)).toBeGreaterThanOrEqual(58)
```

- [ ] **Step 2: 运行失败测试**

Run: `pnpm test src/voyage/result/reportVisuals.test.ts`

Expected: FAIL，函数不存在。

- [ ] **Step 3: 实现相对映射**

```ts
export const mapReportRadii = (scores: Array<number | null>, outerRadius: number) => {
  const values = scores.map((score) => score ?? 0)
  const maximum = Math.max(...values, 1)
  return values.map((score) => outerRadius * (0.48 + 0.5 * (score / maximum)))
}
```

最高值接近外圈，最低值仍保持可读面积；原始百分比继续在文本列表展示。

- [ ] **Step 4: 修改报告组件**

使用 `mapReportRadii` 生成多边形；把网格改为 `1、0.66、0.33` 三层，增加说明“图形展示相对航迹，百分比为原始记录”。报告首屏接入 `cinematicAssets.reportBackground`，下方内容保持静态深色背景。

- [ ] **Step 5: 运行测试**

Run: `pnpm test src/voyage/result/reportVisuals.test.ts src/voyage/result/buildVoyageReport.test.ts`

Expected: PASS。

### Task 6: 彩蛋独立背景与隐藏信号

- [ ] **Step 1: 扩展彩蛋失败测试**

```tsx
render(<SignalAnomaly onBack={vi.fn()} />)
fireEvent.click(screen.getByRole('button', { name: '发现隐藏信号' }))
expect(screen.getByText(/真正的航线/)).toBeInTheDocument()
```

- [ ] **Step 2: 运行失败测试**

Run: `pnpm test src/voyage/components/SignalAnomaly.test.tsx`

Expected: FAIL，隐藏信号尚不存在。

- [ ] **Step 3: 接入独立素材和交互**

将背景改为 `cinematicAssets.eggLiquid`，增加不遮挡返回按钮的隐藏信号触发器；触发后显示一句附加内容并保持键盘可访问。

- [ ] **Step 4: 修正彩蛋文字疏密**

标题 `letter-spacing: 0`、行高 1.04；手机端行高 1.1。正文宽度限制为 34em，按钮与正文间距至少 28px。

- [ ] **Step 5: 运行测试**

Run: `pnpm test src/voyage/components/SignalAnomaly.test.tsx`

Expected: PASS。

### Task 7: Nimbus 点击反馈与全站排版检查

- [ ] **Step 1: 扩展行动站测试**

选择选项后断言 `aria-pressed="true"`、锁定光效类名和提交按钮可用；切换下一站后锁定状态清空。

- [ ] **Step 2: 运行失败测试**

Run: `pnpm test src/voyage/components/StationShell.test.tsx`

Expected: FAIL，当前没有完整锁定状态语义。

- [ ] **Step 3: 实现点击反馈**

为选项添加 `aria-pressed` 和 `data-signal-state`，CSS 使用扫描线、局部光圈和路径亮起，不新增等待时间。

- [ ] **Step 4: 全站清理紧凑标题**

在 `new-voyage.css` 中移除所有中文标题负字距，把 `.voyage-screening__heading h1`、`.voyage-handoff h1`、`.voyage-report__hero h1`、`.signal-anomaly h1` 的行高提高到设计要求。检查 390px 宽度下不存在单字孤行和按钮遮挡。

- [ ] **Step 5: 运行组件测试**

Run: `pnpm test src/voyage/components/StationShell.test.tsx`

Expected: PASS。

### Task 8: 端到端验收

- [ ] **Step 1: 扩展响应式测试**

加入以下断言：七个放映镜头存在；破冰卡可展开；报告背景视频存在；星图信号点不集中于中心；彩蛋背景路径与放映仓不同；隐藏信号可触发。

- [ ] **Step 2: 运行完整单元测试**

Run: `pnpm test`

Expected: 所有测试通过，jsdom 仅允许已知的 `HTMLMediaElement.play()` 提示。

- [ ] **Step 3: 运行静态检查和构建**

Run: `pnpm lint && pnpm build`

Expected: ESLint、TypeScript、Vite 均退出码 0。

- [ ] **Step 4: 运行四视口回归**

Run: `pnpm exec playwright test tests/e2e/responsive.spec.ts --project=desktop-1280x720`

Expected: 390×844、412×915、1280×800、1440×900 全部通过。

- [ ] **Step 5: 视觉检查**

检查首页、破冰、放映仓、过渡、五站、报告、图鉴、档案和彩蛋截图，确认视频非空白、焦点正确、文字不重叠、触控区不小于 44px。

- [ ] **Step 6: 更新说明**

在 `README.md` 增加新素材清单、视频处理要求、测试命令和旧版工程边界。
