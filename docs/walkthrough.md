# Walkthrough

## 2026-04-13 · Sprint2 乙同学 API 联调迭代记录

### 变更概览
- 新增前端测试基建（Vitest + jsdom）并接入 `pnpm test` 脚本。
- 在全局 HTTP 层实现 401 登出事件派发，解决仅清理 localStorage 导致的同页鉴权态不同步问题。
- 在全局 HTTP 层实现 `HTTP 200 + code=1101` 的业务失败拦截并转为 reject，避免库存不足误判为成功。
- 新增报名 API 封装与类型：
  - `createEnrollment(activityId)` 对接 `POST /enrollments`，支持 `202 + code=1201` 排队受理。
  - `getEnrollmentStatus(enrollmentId)` 对接 `GET /enrollments/:id/status`。
  - `listMyEnrollments(page,pageSize)` 对接 `GET /enrollments` 分页数据。

### Diff 思路
- 先补测试框架，再做拦截器与 endpoint，保证每次变更都有可执行回归。
- 契约映射策略统一在 endpoint 层处理：后端 snake_case 字段映射为前端 camelCase，页面层不承担字段转换。
- 全局错误语义集中在 axios 拦截器，页面调用方只处理成功对象或 reject 对象，避免分散判断逻辑。

### 验证结果
- `pnpm test`：通过（新增 smoke、401、1101、enrollments endpoint 测试）。
- `pnpm build`：通过。
- `pnpm lint`：存在仓库既有错误（Merchant 页面中的 `react-hooks/set-state-in-effect`），与本次改动无直接关联。

## 2026-04-13 · 前端 lint 修复迭代

### 变更概览
- 修复 `MerchantActivities.tsx` 中 `react-hooks/set-state-in-effect`：
  - 去除 effect 内同步 `setBanner`，改为从路由 state 派生 banner。
  - 首次加载改为带取消标记的异步请求，避免 effect 中同步 setState。
  - 发布后刷新列表改为独立 `reloadList()`。
- 修复 `MerchantActivityEdit.tsx` 中 `react-hooks/set-state-in-effect`：
  - 去除 effect 内同步 `setLoading(false)` 分支。
  - 引入 `isActivityIdValid` 派生判定与 invalid-id 早返回视图。
  - 为异步详情加载增加取消标记，卸载时避免写状态。
- 在 `eslint.config.js` 中忽略 `public/mockServiceWorker.js`，消除生成文件的无效注释 warning。

### 验证结果
- `pnpm lint`：通过。
- `pnpm test`：通过。
- `pnpm build`：通过。

## 2026-04-13 · 商户控制台与通知联调记录

### 变更概览
- **商户端**：`MerchantDashboard` / `MerchantActivities` / `MerchantActivityNew` / `MerchantActivityEdit` 对接真实商户活动接口；列表、发布、创建、编辑、详情加载失败时使用页面横幅展示 `getRequestErrorMessage` 文案，不单依赖控制台；创建成功可通过回跳 `location.state.message` 提示；发布走 `publishMerchantActivity` 并刷新列表。
- **MerchantForm**：提交前校验报名开始早于报名结束、报名结束早于活动开始；表单字段与 `toBackendActivityInput` / 后端约定一致。
- **通知 API 客户端**（`api/endpoints/notifications.ts`）：`GET /notifications` 分页（`list`、`total`、`page`、`page_size`）；`GET /notifications/unread-count` 读取 `data.unread_count`；`PUT /notifications/:id/read` 标记已读；将 `created_at`、`is_read` 等蛇形字段映射为 `NotificationItem`。
- **通知页面**（`pages/Notifications.tsx`）：首屏加载 + 「加载更多」分页追加；空态与骨架占位；请求失败横幅；点击条目调用 `markNotificationRead` 并乐观更新已读样式。
- **通知铃铛**（`components/public/NotificationBell.tsx`）：已登录时拉取未读数；依赖路由 `pathname`、定时轮询与 `window` `focus` 刷新，保持角标与列表大致同步。
- **共用错误文案**（`utils/requestErrorMessage.ts`）：供商户与通知等页面统一解析 axios 业务错误与网络错误。


### 验证结果
- 代码层面：商户列表 → 新建/编辑 → 发布、通知列表 → 标记已读、铃铛未读数刷新路径已实现。
- 运行时：需在商户账号与普通用户账号下用 Chrome DevTools 确认核心请求无持续 401/404，并与后端通知写库行为一致（未读数、已读状态）。
