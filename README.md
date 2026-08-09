# 科创夜航 · 新生试航版

这是独立于 `D:\工作\科创部门适配测评` 的新版工程。新版采用“先看真实行动，再做五站试航，最后开放探索”的流程，结果页只提供探索方向，不把新生固定判定到某一个部门。

## 本地运行

在本目录执行：

```powershell
pnpm dev
```

默认预览地址为 `http://127.0.0.1:5173/`；如果端口被占用，Vite 会自动切换到可用端口。生产构建：

```powershell
pnpm build
```

质量检查：

```powershell
pnpm test
pnpm lint
pnpm exec playwright test tests/e2e/responsive.spec.ts --project=desktop-1280x720
```

## 目录说明

- `src/voyage/App.tsx`：页面状态与主流程入口。
- `src/voyage/content/`：五站文案、部门档案、项目放映内容。
- `src/voyage/styles/`：新版视觉系统、响应式规则与页面样式。
- `public/media/`：本地视频与视频封面，桌面和手机使用对应尺寸素材。
- `public/departments/`：部门真实图片与自适应 WebP 素材。
- `public/ip/`：科创 IP 辅助素材。

## 第二轮动态体验

- 放映仓采用三幕七部门胶片镜头，真实部门照片与对应工作场景同步展示。
- 破冰、过渡、报告和彩蛋分别使用独立的本地桌面视频、手机视频和 WebP 封面回退。
- 报告星图按本次最高信号做相对可视化，分数列表仍保留原始百分比；彩蛋中的三个信号点可点击解码。
- 动态背景均支持 `prefers-reduced-motion`，静态部署不需要额外后端服务。

## 会话与部署

试航进度使用 `sessionStorage` 保存，键名为 `cdut-new-student-voyage-session-v1`。部署静态产物时只需要发布 `dist/`，不依赖后端接口；后续更新素材或文案后重新执行 `pnpm build` 即可。

旧版保留在 `D:\工作\科创部门适配测评`，不要把两个工程的 `src`、`public` 或 `dist` 混合覆盖。
