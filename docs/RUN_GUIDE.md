# UAAD 全栈工程本地运行与联调指南

本文档介绍如何在本地完整拉起前端应用、Go 后端微服务以及其依赖的分布式环境。

## 1. 基础依赖预检查

请确保您的开发本机已完成下述环境及版本安装：

- **Docker & Docker Compose**（用于剥离 MySQL / Redis / Kafka 的本地安装运维）
- **Go (1.20+)** （保证 Go Modules 代理畅通可用）
- **Node.js (18+) & Cnpm/Npm**

---

## 2. 拉起基础数据容器（中间件基座）

当前项目的底层物理基座被封装在主目录下的容器配置中。每次开发前，请优先保证其运行：

```bash
# 在项目根目录下执行
docker-compose up -d

# 可以通过查看日志来确保 MySQL 等服务已成功 Initialized
docker-compose logs -f
```

*(注意：若环境数据严重错乱，可通过 `docker-compose down -v` 彻底销毁并删除数据卷重来一次。)*

---

## 3. 启动 Go 后端核心服务

后端服务实现了 DDL 自动映射（AutoMigrate），因此无需手动向 DB 导入初始 SQL 脚本。

```bash
# 1. 切换至后台工作域
cd backend

# 2. 检查并整理第三方依赖包
go mod tidy

# 3. 直启后端 HTTP 服务（默认将监听在 8080 端口）
go run ./cmd/server/main.go
```

**[可选操作] 测试数据预热：**
如果您是第一次启动刚建好空表，可以新开一个终端用于向数据库灌入预设的商户、Mock 活动以及测试用户：

```bash
cd backend
go run ./scripts/seed/main.go
```

---

## 4. 启动基于 Vite 的前端工程

前端在启动前会自动接管到 `localhost:8080` 的后端层，或者采用内建的 MSW Mock数据层。

```bash
# 1. 切换至大前端工作域
cd frontend

# 2. 首次安装/有新依赖更新时安装 Node 模组
npm install

# 3. 开启带有 HMR 级别的调试热加载
npm run dev
```

成功拉起后，点击控制台输出的回显地址（通常位于 `http://localhost:5173`）并用浏览器打开。

---

## 5. 高级排查与联调诊断建议

- **后端接口拒绝 (CORS/401)**：确认您在登录页输入的信息无误，获取到的 Token 已成功固化到了 `AuthContext` 和 LocalStorage 内；验证 `src/api/axios.ts` 内的 BaseURL 是否正确拦截了您的出站请求。
- **启动报错 (端口占用)**：如果因上次进程异常未死导致端口抢占（如 8080 错误），Windows 用户可使用 `netstat -ano | findstr 8080` 抓出 PID 后强行 `taskkill /F /PID XXXX` 关闭该进程。

