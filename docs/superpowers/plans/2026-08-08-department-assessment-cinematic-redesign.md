# 科创部门适配测评动态纪实改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This project must be executed inline; do not dispatch subagents.

**Goal:** 将现有科创部门适配测评升级为真实部门素材驱动、具有动态光感和完整部门叙事的响应式网页，同时保持计分、会话恢复和无障碍能力稳定。

**Architecture:** 保留现有 React 状态机和计分模块，把新增内容拆为结构化部门数据、可复用媒体与动效组件、页面级编排三个层次。PPT 素材经确定性脚本转换为响应式 WebP；React `motion` 负责状态转场，OGL 仅保留在已有雷达和结果揭晓的轻量背景中。

**Tech Stack:** React 19、TypeScript 6、Vite 8、Motion 13、OGL、Sharp、Vitest、Testing Library、Playwright。

**Repository note:** `D:\工作\科创部门适配测评` 当前没有 `.git`，不得擅自初始化 Git。计划中的阶段收口使用测试与变更文件清单替代提交。

**Windows runtime:** 执行命令前先运行：

```powershell
$env:PATH="C:\Users\wjj123\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\wjj123\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;$env:PATH"
```

---

## File Map

### Create

- `scripts/prepare-department-assets.mjs`: 从已提取 PPT 素材生成响应式 WebP。
- `src/content/quizStages.ts`: 四个答题阶段及题号映射。
- `src/hooks/useAppReducedMotion.ts`: 全站统一减少动态效果检测。
- `src/scoring/profileFacets.ts`: 从四维分数生成八个可解释的画像切面。
- `src/components/SignalProgress.tsx`: 答题阶段与信号轨道。
- `src/components/AnswerOption.tsx`: 可访问单选项及短促光流反馈。
- `src/components/AnimatedNumber.tsx`: 只播放一次的数字计数。
- `src/components/ProfileRadar.tsx`: 八点画像与文字摘要。
- `src/components/ResultReveal.tsx`: 结果照片、匹配度与锁定状态。
- `src/components/ResultPoster.tsx`: 结果海报生成控制。
- `src/lib/createResultPoster.ts`: Canvas 海报绘制与下载。
- `src/components/DepartmentHero.tsx`: 部门详情首屏。
- `src/components/WorkflowTimeline.tsx`: 部门工作流程。
- `src/components/EvidenceGallery.tsx`: 工作现场与证据图。
- `src/styles/quiz.css`: 答题页布局与交互样式。
- `src/styles/result.css`: 结果页与画像样式。
- `src/styles/department.css`: 部门详情叙事样式。
- `src/styles/motion.css`: 扫描光、追光、光幕及 reduced-motion 降级。
- `tests/departmentAssets.test.ts`: 生成图片存在性与尺寸验证。
- `tests/scoring/profileFacets.test.ts`: 八点画像映射验证。
- `design-research/motion-storyboard/DESIGN.md`: 揭晓动效视觉与时间规则。
- `design-research/motion-storyboard/index.html`: HyperFrames 揭晓节奏样片。

### Modify

- `package.json`: 增加素材生成与动效样片检查命令。
- `src/main.tsx`: 引入新增分区样式。
- `src/content/types.ts`: 扩展部门内容、媒体、成果和流程类型。
- `src/content/departments.ts`: 写入七部门完整内容与素材路径。
- `src/components/QuizScreen.tsx`: 改为信号采集式答题界面。
- `src/app/App.tsx`: 使用新的分析序列并将结果揭晓时长控制在 2 秒内。
- `src/components/ResultScreen.tsx`: 重组首屏、画像、适配依据、备选对比和海报区。
- `src/components/DepartmentDetails.tsx`: 改为完整部门纪实页面。
- `src/styles/tokens.css`: 增加中性色、青蓝、暖金和部门色令牌。
- `src/styles/app.css`: 保留全局和欢迎页样式，移除迁出的页面样式。
- `tests/content/departments.test.ts`: 验证七部门完整内容和相关部门关系。
- `src/components/ResultScreen.test.tsx`: 覆盖结果、海报、详情与降级。
- `src/app/App.test.tsx`: 覆盖分析序列和答题阶段。
- `tests/e2e/smoke.spec.ts`: 覆盖新版流程、图片、海报、响应式和减少动态效果。

---

### Task 1: 生成并验证部门图片资产

**Files:**
- Create: `scripts/prepare-department-assets.mjs`
- Create: `tests/departmentAssets.test.ts`
- Modify: `package.json`
- Generate: `public/departments/**`

- [ ] **Step 1: 写失败测试，锁定输出清单和尺寸**

```ts
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

const ids = ['office', 'project', 'competition', 'training', 'science', 'publicity', 'language']

describe('department image assets', () => {
  it.each(ids)('%s has two heroes and at least three gallery images', async (id) => {
    const root = path.resolve(`public/departments/${id}`)
    for (const file of ['hero-600.webp', 'hero-1200.webp', 'gallery-1-640.webp', 'gallery-2-640.webp', 'gallery-3-640.webp']) {
      await expect(access(path.join(root, file))).resolves.toBeUndefined()
    }
    const metadata = await sharp(await readFile(path.join(root, 'hero-1200.webp'))).metadata()
    expect(metadata.width).toBe(1200)
    expect(metadata.format).toBe('webp')
  })
})
```

- [ ] **Step 2: 运行测试并确认因资产缺失失败**

Run: `pnpm vitest run tests/departmentAssets.test.ts`

Expected: FAIL，错误指向 `public/departments/<id>/hero-640.webp` 不存在。

- [ ] **Step 3: 编写确定性 Sharp 处理脚本**

脚本使用以下固定来源，不扫描或猜测其他文件：

```js
const sources = {
  office: ['image10.jpeg', 'image11.jpeg', 'image14.jpeg', 'image17.jpeg'],
  project: ['image20.png', 'image21.png', 'image22.jpeg', 'image18.png'],
  competition: ['image17.png', 'image12.jpeg', 'image16.jpeg', 'image20.png'],
  training: ['image4.jpeg', 'image5.png', 'image7.png', 'image8.jpeg'],
  science: ['image25.jpeg', 'image26.jpeg', 'image27.jpeg', 'image28.png'],
  publicity: ['image23.jpeg', 'image20.jpeg', 'image21.jpeg', 'image22.jpeg'],
  language: ['image12.png', 'image13.png', 'image14.png', 'image15.png'],
}
```

每组第一张输出 `hero-600.webp` 与 `hero-1200.webp`，其余三张输出 `gallery-1-640.webp` 至 `gallery-3-640.webp`。Hero 使用 `16:9` cover，gallery 保留原始比例但限制宽度为 640，WebP quality 为 82，禁止放大低于目标宽度的源图。已核对七张 hero 源图宽度均不低于 1200px。

- [ ] **Step 4: 增加素材命令并生成资产**

```json
{
  "scripts": {
    "assets:departments": "node scripts/prepare-department-assets.mjs"
  }
}
```

Run: `pnpm assets:departments`

Expected: 输出 35 个 WebP 文件，并打印七部门完成清单。

- [ ] **Step 5: 重新运行资产测试**

Run: `pnpm vitest run tests/departmentAssets.test.ts`

Expected: PASS。

---

### Task 2: 扩展七部门结构化内容

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/departments.ts`
- Modify: `tests/content/departments.test.ts`

- [ ] **Step 1: 写失败测试，要求完整部门叙事**

```ts
it('provides complete documentary content for every department', () => {
  for (const department of departments) {
    expect(department.hero.alt.trim()).not.toBe('')
    expect(department.gallery).toHaveLength(3)
    expect(department.responsibilities.length).toBeGreaterThanOrEqual(3)
    expect(department.stats.length).toBeGreaterThanOrEqual(2)
    expect(department.workflow.length).toBeGreaterThanOrEqual(4)
    expect(department.gains.length).toBeGreaterThanOrEqual(3)
    expect(department.fitNarrative.trim()).not.toBe('')
    expect(department.related).toHaveLength(2)
    expect(department.related).not.toContain(department.id)
  }
})
```

- [ ] **Step 2: 运行内容测试并确认类型或字段缺失**

Run: `pnpm vitest run tests/content/departments.test.ts`

Expected: FAIL，提示 `hero`、`gallery` 或叙事字段不存在。

- [ ] **Step 3: 增加部门媒体与叙事类型**

```ts
export interface DepartmentMedia {
  fallback: string
  srcSet: string
  alt: string
  objectPosition: string
}

export interface DepartmentStat {
  value: number
  suffix: string
  label: string
  note: string
}

export interface DepartmentWorkflowStep {
  title: string
  description: string
}

export interface Department {
  id: DepartmentId
  name: string
  summary: string
  mission: string
  accent: string
  keywords: string[]
  target: ScoreMap
  hero: DepartmentMedia
  gallery: DepartmentMedia[]
  responsibilities: string[]
  stats: DepartmentStat[]
  workflow: DepartmentWorkflowStep[]
  gains: string[]
  fitNarrative: string
  related: DepartmentId[]
}
```

- [ ] **Step 4: 写入七部门已核实内容**

使用规格中的数据，不新增未经材料支持的赛事、奖项或数量。相关部门固定为：

```ts
const related = {
  office: ['project', 'competition'],
  project: ['competition', 'science'],
  competition: ['training', 'project'],
  training: ['competition', 'language'],
  science: ['project', 'publicity'],
  publicity: ['language', 'office'],
  language: ['publicity', 'training'],
} satisfies Record<DepartmentId, DepartmentId[]>
```

统计值固定采用：办公室 `33 项审核`、`3 期培训`；项目部 `50 项结题`、`10 项优秀`、`4 项省赛`、`2 项省赛决赛`；赛训部 `3 个特等奖`、`1 个一等奖`、`7 个二等奖`、`8 个三等奖`；宣传部栏目期数与平均阅读量。竞赛部、科素部、语培部只使用材料中可核实的工作类别，不补造数字。

- [ ] **Step 5: 运行内容和计分测试**

Run: `pnpm vitest run tests/content/departments.test.ts tests/scoring/scoreQuiz.test.ts`

Expected: PASS，既有 target 向量和排序测试保持不变。

---

### Task 3: 建立动效基础与 HyperFrames 节奏样片

**Files:**
- Create: `src/hooks/useAppReducedMotion.ts`
- Create: `src/components/AnimatedNumber.tsx`
- Create: `design-research/motion-storyboard/DESIGN.md`
- Create: `design-research/motion-storyboard/index.html`
- Modify: `package.json`

- [ ] **Step 1: 写减少动态效果 Hook 与计数组件测试**

在 `src/components/ResultScreen.test.tsx` 增加：减少动态效果时计数直接显示终值；普通模式下计数只播放一次，卸载后取消 animation frame。

- [ ] **Step 2: 运行定向测试确认失败**

Run: `pnpm vitest run src/components/ResultScreen.test.tsx`

Expected: FAIL，`AnimatedNumber` 尚不存在。

- [ ] **Step 3: 实现统一 Hook 和数字计数**

```ts
export function useAppReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  return reduced
}
```

`AnimatedNumber` 接收 `value`、`suffix`、`duration=700`，使用 `requestAnimationFrame` 和 `easeOutCubic`，并为数字设置 `font-variant-numeric: tabular-nums`。

- [ ] **Step 4: 写 HyperFrames 视觉身份与 1.6 秒揭晓时间线**

`DESIGN.md` 固定：深黑 `#07111f`、青蓝 `#31c7e8`、暖金 `#f2c14e`、白 `#f7fafc`；中文字体使用系统无衬线；禁止紫色主导、玻璃卡片、持续粒子和满屏渐变。

`index.html` 包含三个阶段：`0.15s-0.55s` 四条光路聚合，`0.55s-1.05s` 坐标锁定，`1.05s-1.60s` 部门照片与标题揭示。所有元素先完成静态最终版式，再使用 GSAP `from()` 添加进入动画。

- [ ] **Step 5: 增加并运行 HyperFrames 检查命令**

```json
{
  "scripts": {
    "motion:lint": "npx hyperframes lint design-research/motion-storyboard && npx hyperframes validate design-research/motion-storyboard && npx hyperframes inspect design-research/motion-storyboard --samples 6"
  }
}
```

Run: `pnpm motion:lint`

Expected: lint 与 validate 通过，无文本溢出；若当前 HyperFrames CLI 不接受目录参数，则在 `design-research/motion-storyboard` 中运行相同三个命令。

- [ ] **Step 6: 记录 Figma 可用性**

若当前任务出现 `use_figma` 接口，建立 `Quiz/Desktop 1440`、`Quiz/Mobile 390`、`Result/Desktop 1440`、`Result/Mobile 390`、`Department/Desktop 1440`、`Department/Mobile 390` 六个关键帧。若接口仍未挂载，在计划执行记录中标记“Figma 插件已安装但本任务无可调用接口”，使用浏览器截图完成同一组对照，不阻塞实现。

- [ ] **Step 7: 运行定向测试**

Run: `pnpm vitest run src/components/ResultScreen.test.tsx`

Expected: PASS。

---

### Task 4: 改造答题页为信号采集界面

**Files:**
- Create: `src/content/quizStages.ts`
- Create: `src/components/SignalProgress.tsx`
- Create: `src/components/AnswerOption.tsx`
- Create: `src/styles/quiz.css`
- Modify: `src/components/QuizScreen.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: 写失败测试覆盖四阶段和可访问单选项**

测试题号 1、6、11、16 分别显示“观察”“协作”“执行”“表达”；选中答案后状态文字为“协作画像正在形成”，单选框仍可通过键盘操作，下一题后标题获得焦点。

- [ ] **Step 2: 运行 App 测试确认失败**

Run: `pnpm vitest run src/app/App.test.tsx`

Expected: FAIL，页面没有阶段名称和信号采集仪。

- [ ] **Step 3: 定义四个阶段**

```ts
export const quizStages = [
  { id: 'observe', label: '观察', range: [0, 4], signal: '读取你的判断方式' },
  { id: 'collaborate', label: '协作', range: [5, 9], signal: '识别你的合作偏好' },
  { id: 'execute', label: '执行', range: [10, 14], signal: '记录你的推进节奏' },
  { id: 'express', label: '表达', range: [15, 19], signal: '完成你的科创画像' },
] as const
```

- [ ] **Step 4: 实现 SignalProgress**

组件显示四条固定轨道、当前阶段、`questionIndex + 1 / totalQuestions`，用 `aria-current="step"` 标记当前阶段。轨道只显示进度，不显示部门或维度分数。

- [ ] **Step 5: 实现 AnswerOption**

保留原生 `input type="radio"`。使用 Motion 在选中时播放 220ms 下压回弹，并添加一次性的 `.answer-option__signal` 光流；reduced-motion 时取消位移，只切换边框和背景。

- [ ] **Step 6: 重组 QuizScreen**

桌面使用 `quiz-layout` 两列，左侧 `SignalProgress` 固定宽度 320px，右侧题目宽度限制 760px。手机宽度 720px 以下改为单列，阶段轨道变为横向。

- [ ] **Step 7: 引入样式并运行测试**

Run: `pnpm vitest run src/app/App.test.tsx tests/state/appReducer.test.ts`

Expected: PASS，状态机行为保持不变。

---

### Task 5: 实现结果聚合序列和八点画像

**Files:**
- Create: `src/scoring/profileFacets.ts`
- Create: `tests/scoring/profileFacets.test.ts`
- Create: `src/components/ProfileRadar.tsx`
- Create: `src/components/ResultReveal.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/components/ResultScreen.tsx`

- [ ] **Step 1: 写八点画像失败测试**

```ts
it('builds eight bounded facets without changing source dimensions', () => {
  const source = { expression: 80, analysis: 60, execution: 90, adaptation: 70 }
  expect(buildProfileFacets(source).map((facet) => facet.value)).toEqual([
    80, 74, 60, 63, 90, 81, 70, 73,
  ])
  expect(source).toEqual({ expression: 80, analysis: 60, execution: 90, adaptation: 70 })
})
```

- [ ] **Step 2: 实现透明可解释的切面映射**

```ts
const mix = (primary: number, secondary: number) =>
  Math.round(primary * 0.7 + secondary * 0.3)

export function buildProfileFacets(scores: ScoreMap) {
  return [
    { id: 'clarity', label: '表达清晰', value: scores.expression },
    { id: 'translation', label: '内容转化', value: mix(scores.expression, scores.analysis) },
    { id: 'decomposition', label: '分析拆解', value: scores.analysis },
    { id: 'judgement', label: '方案判断', value: mix(scores.analysis, scores.adaptation) },
    { id: 'momentum', label: '执行推进', value: scores.execution },
    { id: 'milestones', label: '节点管理', value: mix(scores.execution, scores.analysis) },
    { id: 'adaptability', label: '协作应变', value: scores.adaptation },
    { id: 'communication', label: '现场沟通', value: mix(scores.adaptation, scores.expression) },
  ]
}
```

- [ ] **Step 3: 运行画像测试**

Run: `pnpm vitest run tests/scoring/profileFacets.test.ts`

Expected: PASS。

- [ ] **Step 4: 实现 ProfileRadar**

使用 SVG polygon 绘制固定八边网格和数据轮廓。每个顶点有可见标签，组件外增加 `<dl>` 文字摘要，确保不依赖图形理解结果。SVG 设置稳定 `viewBox="0 0 480 480"` 和 `aspect-ratio: 1`。

- [ ] **Step 5: 实现 ResultReveal 并调整分析时长**

`App.tsx` 将普通分析时长从 900ms 调整为 1500ms；reduced-motion 使用 150ms。`ResultReveal` 使用首选部门 hero 图、匹配度和 profile 文案，动效顺序严格复用 HyperFrames 样片时间比例。

- [ ] **Step 6: 运行 App 与结果测试**

Run: `pnpm vitest run src/app/App.test.tsx src/components/ResultScreen.test.tsx tests/scoring/profileFacets.test.ts`

Expected: PASS。

---

### Task 6: 完成结果页适配依据、备选对比和结果海报

**Files:**
- Create: `src/lib/createResultPoster.ts`
- Create: `src/components/ResultPoster.tsx`
- Create: `src/styles/result.css`
- Modify: `src/components/ResultScreen.tsx`
- Modify: `src/components/ResultScreen.test.tsx`

- [ ] **Step 1: 写结果页和海报失败测试**

测试首选部门 hero 图片、八点画像、三条真实职责对应、两个备选部门、结果海报按钮均存在。模拟 `canvas.getContext` 与 `canvas.toBlob`，验证下载文件名为 `科创部门适配结果-<部门名>.png`；生成失败时显示“海报生成失败，请重试”。

- [ ] **Step 2: 运行结果测试确认失败**

Run: `pnpm vitest run src/components/ResultScreen.test.tsx`

Expected: FAIL，页面尚无 hero 图片和海报按钮。

- [ ] **Step 3: 实现 Canvas 海报生成器**

画布固定 `1080x1440`。绘制顺序为深色底、顶部组织名称、部门 hero 图片、部门名称、profile、匹配度、四维数值、匿名与非录取说明。图片通过同源 URL 加载；`toBlob` 返回 null 时抛出 `Unable to encode result poster`。

- [ ] **Step 4: 重组结果页内容顺序**

依次渲染 `ResultReveal`、`ProfileRadar`、适配依据、备选对比、`ResultPoster`、部门目录、`JoinPanel` 和重新测评。适配依据从 `primary.department.responsibilities.slice(0, 3)` 生成，不使用泛化 AI 口吻。

- [ ] **Step 5: 实现结果页样式**

首屏真实照片覆盖页面宽度并设置稳定 `min-height: clamp(560px, 82svh, 820px)`；文字直接叠在图片暗部，不放入卡片。结果主体使用深浅节奏分区，避免连续卡片。备选部门使用两列对比表述，手机端单列。

- [ ] **Step 6: 运行定向测试**

Run: `pnpm vitest run src/components/ResultScreen.test.tsx`

Expected: PASS。

---

### Task 7: 将部门详情改为真实工作纪实

**Files:**
- Create: `src/components/DepartmentHero.tsx`
- Create: `src/components/WorkflowTimeline.tsx`
- Create: `src/components/EvidenceGallery.tsx`
- Create: `src/styles/department.css`
- Modify: `src/components/DepartmentDetails.tsx`
- Modify: `src/components/ResultScreen.test.tsx`

- [ ] **Step 1: 写七部门详情失败测试**

针对每个部门渲染 `DepartmentDetails`，验证 hero 图片 alt、至少两个统计数字、四个流程步骤、三项成长收获、三张现场图片、两个相关部门入口和返回按钮。

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run src/components/ResultScreen.test.tsx`

Expected: FAIL，当前详情页只包含关键词和目标四维。

- [ ] **Step 3: 实现 DepartmentHero**

Hero 使用 `<picture>` 和部门 `srcSet`，图片加载失败时设置 `data-image-state="failed"`，以部门 accent、名称、使命和统计文字替代空白。返回按钮位于 hero 上方且保持 44px 点击区域。

- [ ] **Step 4: 实现 WorkflowTimeline 和 EvidenceGallery**

时间线按 DOM 顺序显示四至五步，不依赖横向滚动。照片区使用一张宽图加两张竖向错位图；每张图保留 alt，懒加载非首屏图片，加载失败时隐藏单张图但保留说明文字。

- [ ] **Step 5: 重组 DepartmentDetails**

顺序固定为 `DepartmentHero`、职责、流程、现场图片、成果、成长收获、适配说明、相关部门、`JoinPanel`。标题切换后仍自动获得焦点，返回结果后恢复原触发按钮。

- [ ] **Step 6: 实现详情样式和部门色**

通过 `style={{ '--department-accent': department.accent }}` 提供局部 CSS 变量。图片视差只在支持 hover 且未开启 reduced-motion 时启用；手机端全部取消粘性和视差。

- [ ] **Step 7: 运行详情和状态测试**

Run: `pnpm vitest run src/components/ResultScreen.test.tsx tests/state/appReducer.test.ts`

Expected: PASS。

---

### Task 8: 统一光效、响应式和性能降级

**Files:**
- Create: `src/styles/motion.css`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/app.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: 增加视觉令牌**

```css
:root {
  --ink-1000: #050b13;
  --ink-950: #07111f;
  --ink-900: #0b1928;
  --cyan-400: #31c7e8;
  --cyan-200: #9ce8f4;
  --gold-400: #f2c14e;
  --paper-50: #f7fafc;
  --paper-100: #edf3f6;
  --text-on-dark: #f7fafc;
  --muted-on-dark: #b8c7d8;
}
```

- [ ] **Step 2: 实现有任务的光效**

`motion.css` 只实现四种效果：背景扫描光带、选项边缘追光、结果数字扫光、部门图片光幕。所有效果使用 `opacity` 和 `transform`，不动画 `width`、`height`、`top` 或 `left`。

- [ ] **Step 3: 增加 reduced-motion 与移动端限制**

在 `@media (prefers-reduced-motion: reduce)` 中关闭光流、视差、磁吸、计数过渡和持续扫描。`@media (hover: none), (pointer: coarse)` 禁止光标追踪。720px 以下取消两列和 sticky；1024px 以下降低照片面积但不隐藏正文。

- [ ] **Step 4: 清理迁出样式并引入新文件**

`main.tsx` 引入顺序固定为 `tokens.css`、`app.css`、`quiz.css`、`result.css`、`department.css`、`motion.css`。从 `app.css` 删除已迁移的 `.quiz-*`、`.result-*` 和 `.department-*` 块，保留全局按钮、欢迎页、JoinPanel 和辅助类。

- [ ] **Step 5: 运行构建和 lint**

Run: `pnpm lint && pnpm build`

Expected: 两条命令均以 0 退出，无 TypeScript 或 ESLint 错误。

---

### Task 9: 扩展端到端与视觉验证

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`
- Modify: `playwright.config.ts` only if screenshot output needs a fixed directory

- [ ] **Step 1: 更新现有选择器为稳定中文可访问名称**

保留 start、20 题、结果、详情、返回和重置流程。新增对 `data-testid="signal-progress"`、`data-testid="profile-radar"`、`data-testid="department-hero"` 的检查，避免依赖纯装饰节点。

- [ ] **Step 2: 增加图片和结果海报测试**

拦截所有 `response`，收集 `/departments/` 下非 200 响应并断言为空。点击“生成结果海报”，等待下载，断言建议文件名以 `.png` 结尾且下载文件大小大于 20KB。

- [ ] **Step 3: 增加视觉与布局检查**

在 390x844 和 1440x900 项目中保存答题第 1 题、结果页首屏、项目部详情首屏截图。继续运行 `assertNoHorizontalOverflow` 和 44px touch target 检查，并验证主要标题、按钮和图片区不存在 bounding box 交叠。

- [ ] **Step 4: 扩展 reduced-motion 检查**

在减少动态效果模式下完成一题并进入结果页，断言没有 OGL result canvas、没有 `.light-sweep--active`，且首选部门和画像仍可见。

- [ ] **Step 5: 运行桌面定向 E2E**

Run: `pnpm playwright test tests/e2e/smoke.spec.ts --project=desktop-1440x900`

Expected: 全部通过，无条件外的新失败。

- [ ] **Step 6: 运行手机定向 E2E**

Run: `pnpm playwright test tests/e2e/smoke.spec.ts --project=mobile-390x844`

Expected: 全部通过，无横向滚动或小于 44px 的主要控件。

---

### Task 10: 全量验证和本地验收

**Files:**
- Modify only files required by observed failures
- Update: `README.md` if local commands or asset generation changed

- [ ] **Step 1: 运行全部单元测试**

Run: `pnpm test`

Expected: 所有 Vitest 测试通过，现有 139 条基线不减少。

- [ ] **Step 2: 运行 lint 与生产构建**

Run: `pnpm lint && pnpm build`

Expected: PASS，`dist` 正常生成。

- [ ] **Step 3: 运行全部 Playwright 项目**

Run: `pnpm test:e2e`

Expected: 375、390、iPad、1024、1440 和 reduced-motion 覆盖全部通过；仅保留由项目条件显式控制的 skip。

- [ ] **Step 4: 检查产物体积和图片引用**

Run: `Get-ChildItem -Recurse dist | Measure-Object Length -Sum; rg -n "departments/.*\.webp" dist`

Expected: 所有部门图片位于 `dist/departments`；无 `design-research` 源图被直接打包；单张 WebP 不超过 450KB。

- [ ] **Step 5: 启动生产预览并人工验收**

Run: `pnpm vite preview --host 127.0.0.1 --port 4174`

依次检查欢迎页、答题第 1/6/11/16 题、结果揭晓、结果海报、七部门详情、返回焦点、咨询群和重新测评。检查照片主体、文字对比、光效强度、手机滚动和控制台错误。

- [ ] **Step 6: 记录最终变更清单**

由于目录没有 Git，使用 `Get-ChildItem src,tests,scripts,public\departments -Recurse -File | Sort-Object FullName` 记录最终文件清单，不初始化仓库、不创建提交。

---

## Execution Order

1. 素材生成与内容模型。
2. 动效基础与 HyperFrames 时间线。
3. 答题页。
4. 结果揭晓、画像和海报。
5. 部门详情。
6. 光效、响应式与性能。
7. 全量测试与本地验收。

每个 Task 完成后必须运行该 Task 的定向测试，再进入下一项。若失败来自无关既有问题，只记录，不修改无关功能。
