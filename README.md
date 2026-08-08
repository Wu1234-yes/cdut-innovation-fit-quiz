# 科创夜航

面向成都理工大学新生的移动端优先科创探索网页。参与者通过五个 30 至 45 秒的互动场景完成一次约 3 至 4 分钟的校园夜航，看到自己的行动线索、可尝试的科研场景和今天就能开始的小任务，再按兴趣进入“科创放映舱”、七部门探索图鉴和部门档案。

网页不进行人格判断、能力鉴定、部门排名或唯一推荐，也不是 MBTI 测试和录取依据。

## 本地运行

环境要求：Node.js 22 或更高版本、pnpm 11。

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

默认开发地址由 Vite 在终端中显示。生产构建位于 `dist`：

```powershell
pnpm build
pnpm preview --host 127.0.0.1
```

## 质量检查

```powershell
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Playwright 覆盖 390x844、768x1024、1024x768、1280x720 和 1440x900，并检查完整路线、快速浏览、降动效、横向溢出、资源错误、会话恢复、角色锚点和本地视觉资源。

## 视觉与角色

- 首页、枢纽、五个场景、结果页和部门总览各有一套独立宇宙环境，并使用本地响应式 WebP 底图、CSS 视差、星尘和环境光共同组成舞台。
- 白色探索者代表正在体验网页的用户，使用八个本地预渲染姿态参与不同场景，不给用户贴标签。
- 科创 IP 是组织向导，只承担提示、解释和鼓励，不替用户选择部门。
- 真实照片从科创放映舱开始出现，首页、枢纽和五个探索场景保持虚拟夜航世界。
- 七部门探索图鉴提供统一入口，部门档案之间也可以前后翻阅。

## 内容维护

- 五站问题与选项：`src/night-voyage/content/journey.ts`
- 真实项目胶片：`src/night-voyage/content/projects.ts`
- 七个部门档案：`src/night-voyage/content/departmentArchives.ts`
- 行动地图生成：`src/night-voyage/result/buildActionProfile.ts`
- 视觉样式：`src/night-voyage/styles/`
- 宇宙场景配置：`src/night-voyage/content/sceneVisuals.ts`
- 宇宙场景底图：`public/environments/`
- 探索者姿态：`public/explorer/`
- 视觉资产生成：`scripts/generate-cosmic-assets.mjs`
- 部门图片：`public/departments/`
- 科创 IP 素材：`public/ip/`
- 招新群二维码：`public/recruitment-qq-qr.png`

正式页面的图片、IP、二维码和运行时视觉素材均由 `public/` 本地托管，不依赖境外视频或远程图片服务。

修改内容后至少运行 `pnpm test`、`pnpm lint` 和 `pnpm test:e2e -- tests/e2e/night-voyage.spec.ts`。图片必须保留准确替代文本和明确裁切位置，不能用无关合照填充项目胶片。

## 数据说明

- 不收集姓名、手机号、QQ 号或其他个人信息。
- 探索进度只写入当前标签页的 `sessionStorage`，关闭标签页后失效。
- 所有结果在浏览器本地生成，不调用 AI、后端或数据库。
- 项目未接入统计、广告或用户行为追踪服务。
- 当前会话键为 `cdut-night-voyage-session-v3`；旧测评和旧夜航会话会被清除，不迁移旧答案。

## 部署

EdgeOne Pages 配置：

- 框架：Vite
- 安装命令：`pnpm install --frozen-lockfile`
- 构建命令：`pnpm build`
- 输出目录：`dist`
- Node.js：22
- 独立域名部署时 `VITE_BASE_PATH` 保持 `/` 或不设置

GitHub Pages 子路径部署时设置 `VITE_BASE_PATH=/仓库名/`。正式部署前必须在本地完成全量检查并单独确认。

回滚时恢复上一个已验证版本并重新构建即可。版本 3 会话使用独立键，不会污染旧版会话；部署后若内容结构变化，应提升会话版本并拒绝旧结构，而不是猜测迁移。

第三方依赖与视觉参考信息见 `THIRD_PARTY_NOTICES.md`。
