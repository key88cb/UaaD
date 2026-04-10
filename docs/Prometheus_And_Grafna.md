# Prometheus和Grafana

## 简介

Prometheus（普罗米修斯）是一个开源的系统监控和告警工具包，最初由SoundCloud开发，现已成为云原生基金会(CNFC)的顶级项目（和Kubernetes同级别），它会主动到监控目标那里通过HTTP拉取指标数据，然后将采集到的数据以时间序列的形式存储在本地磁盘上。Prometheus 支持PromQL查询语言，通过它可以对存储的数据进行复杂的查询、聚合和计算，例如过去1h内，CPU使用率超80%的服务器有哪些。

Grafana是一个完全开源的数据分析和可视化平台，它本身不存储任何数据，而是从各种数据源（如Prometheus）读取数据，然后用漂亮的图标展示出来。Grafana可以连接几十种数据源，包括InfluxDB、ElaticSearch、MySQL、PostgreSQL等等。可以在Grafana上创建包含多个图表的自定义仪表盘，比如一个“应用监控大屏幕”上同时展示QPS、P99延迟、错误率等信息。

在本项目中这两个中间件均使用Docker部署，因而Grafana和Prometheus之间应该使用Docker服务名通信，而不是localhost

## 后端埋点

后端通过`prometheus/client_golang`注册了两个指标：

- `http_requests_total`：每个接口的请求总计数
- `http_requests_duration_seconds`：每个接口的请求延迟分布

这个中间件是在`main.go`中全部注册，所以所有HTTP请求都会被记录，此外Gin还通过`promhttp.Handler()`暴露了`/metrics`端点，访问`http://localhost:8080/metrics`就能看到原始的Prometheus指标文本，Prometheus服务每15s从Go后端的`/metrics`拉一次数据。

PromQL示例：

```sql
# 每秒请求率（按接口分组）
rate(http_requests_total[5m])

# 报名接口的 P99 延迟
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{path="/api/v1/enrollments"}[5m]))

# 各接口错误率（5xx）
sum(rate(http_requests_total{status=~"5.."}[5m])) by (path)
```

## 可视化仪表盘

访问`localhost:3000`，使用`admin`/`admin`登录，进入Connections -> Data Sources -> Add data source -> Prometheus，URL填`http://prometheus:9090`，添加数据源后，就可以新建Dashboard，使用PromQL创建面板。常见的面板包括（具体指令问AI）：

- QPS总览
- 报名接口QPS
- P50/P95/P99延迟
- 错误率
- HTTP状态码分布