# 压力测试

## 简介

目前抢票已经移除了MySQL乐观锁，改为使用Redis在内存中扣减，并在扣减成功后投递Kafka，MySQL异步平稳落盘：

1. MySQL的默认隔离级别是可重复读(Repeatable Read)，但是对于高并发系统最适合的隔离级别应该是读已提交(Read Committed)，这样能够提高并发度，并且不可重复读在业务层通常是可以是接受的
2. Redis是一个高性能的内存键值存储，它的命令执行是单线程的，一个Lua脚本看做一条命令，因而通常使用Lua脚本来实现复杂的原子操作
3. Kafka是一个大数据流式处理平台，因为具备发布/订阅功能，通常被归为消息队列，此处用于缓冲，保护MySQL

## 测试

## 内置Go并发测试

前置条件（必须全部就绪）：

```bash
# 1. 启动基础设施
docker-compose up -d

# 2. 启动服务端（需要 MySQL + Redis + Kafka 全部 healthy）
cd backend && go run ./cmd/server

# 3. 灌入种子数据（商户账号等）
cd backend && go run ./scripts/seed
```

运行测试：

```bash
# 零超卖验证：500 并发抢 10 张票 → 恰好 10 人成功
cd backend && go test -v -tags=stress -run TestConcurrentEnrollment_Stock10 -count=1 ./tests/

# 吞吐量基准：测量每秒处理多少报名请求
cd backend && go test -v -tags=stress -bench=BenchmarkEnrollmentThroughput -benchtime=10s -count=1 ./tests/
```

判断标准：

```
success=10, stock=10 → 零超卖 PASS
success>10           → 超卖 BUG
```

注意现在的enroll链路是异步的(Redis Lua -> Kafka -> Worker -> MySQL)