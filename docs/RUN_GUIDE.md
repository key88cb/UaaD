# UAAD 全栈工程本地运行与联调指南

本文档介绍如何在本地完整拉起前端应用、Go 后端微服务以及其依赖的分布式环境。

## 1. 基础依赖预检查

请确保您的开发本机已完成下述环境及版本安装：

- **Docker & Docker Compose**（用于 MySQL / Redis / Kafka / Prometheus / Grafana）
- **Go (1.20+)** （保证 Go Modules 代理畅通可用）
- **Node.js (18+) & pnpm/npm**
- **JMeter (5.6+)**（仅压测需要；`brew install jmeter` 或 [官网下载](https://jmeter.apache.org/)）

---

## 2. 环境配置态说明

项目支持三种运行态，按需拉起对应服务：

| 运行态 | Docker 服务 | 说明 |
|--------|-------------|------|
| **开发态** | MySQL + Redis + Kafka | 最小依赖，后端开发与调试 |
| **联调态** | MySQL + Redis + Kafka + 前端 | 前后端联调，需同时启动前端 `pnpm dev` |
| **演示态 / 压测态** | MySQL + Redis + Kafka + Prometheus + Grafana | 完整监控栈，支持压测观测与演示 |

`docker-compose.yaml` 已包含全部五个服务，`docker-compose up -d` 将一次性拉起。若仅需开发态，可选择性启动：

```bash
docker-compose up -d mysql redis kafka
```

---

## 3. 拉起基础数据容器（中间件基座）

```bash
# 在项目根目录下执行（拉起全部服务，含 Prometheus / Grafana）
docker-compose up -d

# 查看容器状态（确认 mysql / redis 为 healthy）
docker-compose ps

# 查看日志
docker-compose logs -f
```

*(注意：若环境数据严重错乱，可通过 `docker-compose down -v` 彻底销毁并删除数据卷重来一次。)*

---

## 4. 启动 Go 后端核心服务

后端服务实现了 DDL 自动映射（AutoMigrate），因此无需手动向 DB 导入初始 SQL 脚本。

```bash
cd backend
go mod tidy
go run ./cmd/server
```

后端默认监听 `:8080`（可通过 `backend/.env` 中的 `PORT` 变量覆盖）。

**测试数据预热（首次或清库后必须执行）：**

```bash
cd backend
go run ./scripts/seed
```

Seed 会导入 5 个用户（含商户 `13800000004`）和 20 个活动。

---

## 5. 启动基于 Vite 的前端工程

```bash
cd frontend
pnpm install
pnpm dev
```

成功拉起后，访问 `http://localhost:5173`。

**联调注意事项：**
- 确保 `.env` 或 `.env.local` 中 `VITE_USE_MOCK` **不为** `true`（联调态需关闭 Mock）。
- 前端请求默认指向 `http://localhost:8080`。

---

## 6. Prometheus 与 Grafana（监控栈）

### 6.1 启动

随 `docker-compose up -d` 一起启动，无需额外操作。

| 服务 | 地址 | 默认账号 |
|------|------|---------|
| Prometheus | `http://localhost:9090` | 无需登录 |
| Grafana | `http://localhost:3000` | admin / admin |

### 6.2 数据源与 Dashboard

- **数据源**：已通过 provisioning 自动配置 Prometheus（`http://prometheus:9090`），无需手动添加。
- **Dashboard**：已通过 provisioning 自动加载 `UAAD / Sprint3 / Enrollment & Worker` 面板（uid: `uaad-sprint3`），启动后即可在 Grafana 中查看。

### 6.3 后端指标

后端暴露 `/metrics` 端点（`http://localhost:8080/metrics`），Prometheus 每 15s 自动拉取。详见 [Prometheus_And_Grafna.md](./Prometheus_And_Grafna.md)。

---

## 7. 压力测试

### 7.1 前置条件

确保 Docker 全栈、后端、Seed 均已就绪（步骤 3-4）。

### 7.2 一键执行

```bash
cd backend/tests/jmeter
bash run-jmeter-report.sh
```

脚本自动完成：商户登录 → 创建活动 → 发布（Redis 预热）→ 生成用户 CSV → 运行 JMeter → 输出 HTML 报告。

### 7.3 切换并发规模

编辑 `enrollment-load.jmx`，启用目标线程组并禁用其余（同时只启用一个）：

| 线程组 | 线程数 | Ramp-up | 默认状态 |
|--------|--------|---------|---------|
| 峰值 1000 并发 | 1000 | 30s | **启用** |
| Sprint3 大规模 3000 并发 | 3000 | 60s | 禁用 |
| Sprint3 冲刺目标 5000 并发 | 5000 | 90s | 禁用 |

### 7.4 压测报告

详见 [ST_BASELINE.md](./STREE_TEST/ST_BASELINE.md) 与 [ST_REPORT.md](./STREE_TEST/ST_REPORT.md)。

---

## 8. 高级排查与联调诊断建议

- **后端接口拒绝 (CORS/401)**：确认登录页输入信息无误，Token 已固化到 `AuthContext` 和 LocalStorage；验证 `src/api/axios.ts` 内的 BaseURL。
- **启动报错 (端口占用)**：`lsof -i :8080` 查找占用进程并 `kill`；Windows: `netstat -ano | findstr 8080` + `taskkill /F /PID <PID>`。
- **Prometheus 无数据**：确认后端已启动且 `curl http://localhost:8080/metrics` 有输出；检查 `docker-compose logs prometheus`。
- **Grafana Dashboard 为空**：确认 Prometheus 数据源连通（Data sources → Prometheus → Save & test）；Dashboard 使用 `uid: prometheus` 引用数据源。

