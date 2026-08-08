# 成都理工大学青年科技创新服务中心部门适配测评

面向 2026 级新生的移动端优先网页。参与者完成 20 道情境选择后，会得到四维科创倾向、1 个首选部门和 2 个备选部门，并可查看七个部门介绍和招新群入口。

本测评用于帮助新生了解部门工作方向，不是专业 MBTI、心理测验、能力鉴定或录取依据。

## 本地运行

环境要求：Node.js 22 或更高版本、pnpm 11。

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

默认开发地址由 Vite 在终端中显示。

## 检查与构建

```powershell
pnpm lint
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

Windows 本地验收默认使用系统自带的 Microsoft Edge。需要指定其他 Chromium 通道时，可设置 `PLAYWRIGHT_CHANNEL`。CI 环境使用 Playwright 下载的 Chromium。

生产文件生成在 `dist`。预览生产构建：

```powershell
pnpm preview --host 127.0.0.1
```

## 内容维护

七个部门资料位于 `src/content/departments.ts`，题库位于 `src/content/questions.ts`。

调整题库时需保留 20 题结构：12 道倾向题、8 道工作场景题。选项中不直接写部门名称，场景计分机会保持均衡；修改后至少运行 `pnpm test` 和 `pnpm test:e2e`。

招新群二维码文件为 `public/recruitment-qq-qr.png`，页面群号在 `src/components/JoinPanel.tsx`。当前二维码为 420×420 PNG，解码地址由 `tests/qrAsset.test.ts` 校验。

如需从新版招新图中重新提取二维码，先核对 `scripts/extract-qr.mjs` 内的裁剪区域和预期 QQ 地址，再执行：

```powershell
node scripts/extract-qr.mjs "D:\path\to\source-image.jpg"
```

脚本会在替换成品前完成尺寸和解码检查。

## 数据说明

- 不收集姓名、手机号、QQ 号或其他个人信息。
- 答案只写入当前标签页的 `sessionStorage`，关闭标签页后失效。
- 评分完全在浏览器本地完成，不调用 AI、后端或数据库。
- 项目未接入统计、广告或用户行为追踪服务。

## EdgeOne Pages

- 框架：Vite
- 安装命令：`pnpm install --frozen-lockfile`
- 构建命令：`pnpm build`
- 输出目录：`dist`
- 根目录：项目根目录
- Node.js：22
- `VITE_BASE_PATH`：使用独立域名时保持 `/` 或不设置

## GitHub Pages

预设仓库名为 `cdut-innovation-fit-quiz`，工作流位于 `.github/workflows/deploy-pages.yml`。构建时使用 `VITE_BASE_PATH=/cdut-innovation-fit-quiz/`，确保脚本、样式和二维码在仓库子路径下正常加载。

如果仓库改名，需同步修改工作流中的 `VITE_BASE_PATH`。创建公开仓库、上传源码和正式部署必须在本地验收后单独确认。

## 第三方说明

依赖与视觉参考的许可信息见 `THIRD_PARTY_NOTICES.md`。React Bits 雷达许可原文保留在 `src/components/RadarHero.tsx`，并由 Vite 注入对应生产代码块。
