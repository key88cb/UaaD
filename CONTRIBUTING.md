# UAAD 贡献指南 (CONTRIBUTING)

欢迎参与 UAAD 项目！我们采用 **AI 协作开发** 模式，请遵循以下核心规范。

---

## 1. 核心开发原则

- **架构对齐**：重大变更前必须更新 `docs/SRS.md`，确保代码与设计一致。
- **AI 协作**：利用 AI 生成代码时，需严格按照项目现有的技术栈和命名规范。
- **质量保障**：后端逻辑需包含自动化测试；前端需适配中英文国际化并处理加载/异常状态。

## 2. 提交规范

- **分支命名**：`feature/功能名` 或 `fix/问题名`。
- **Commit 格式**：`feat(模块): 描述` 或 `fix(模块): 描述`。
- **提交记录**：完成后更新 `walkthrough.md` 记录变更点和验证证据。

## 3. 技术栈参考

- **Frontend**: Vite + React + Tailwind v4 + MSW (Mock)。
- **Backend**: Go (Gin) + GORM + SQLite (开发) / MySQL (生产)。
- **Infra**: Docker + Kubernetes (容器编排)。

## 4. 协作流程

1. 认领 `task_list.md` 中的任务。
2. 开发并自行验证功能逻辑。
3. 提交 PR 并在 `walkthrough.md` 中展示运行结果。
