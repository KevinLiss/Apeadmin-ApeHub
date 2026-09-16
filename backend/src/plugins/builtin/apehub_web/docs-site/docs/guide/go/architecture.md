# 架构与请求链路

## 应用启动

`cmd/server/main.go` 解析 flag 后调用 `bootstrap.Run`，按以下顺序启动：

1. 加载配置：Viper 读取 `configs/config.yaml`，环境变量以 `GA_` 前缀覆盖。
2. 初始化 Zap 结构化日志（JSON 格式）。
3. 初始化 GORM 数据库：MySQL / SQLite 自动切换 + 连接池（`max_open_conns: 50`）。
4. 执行种子数据：超管账号 + 核心菜单。
5. 扫描注册插件：L1 `init()` 自注册 + L2 ZIP 声明式加载。
6. 注册 HTTP 路由：公开 / 认证 / 权限三级分组。
7. 启动 MCP 网关。
8. 发送 `app_startup` 事件。

## 后端分层

```text
HTTP Request
  ↓
Middleware（request_id / cors / recovery / jwt_auth / permission / rate_limit / operation_log）
  ↓
Gin Router（公开 / 认证 / 权限三级分组）
  ↓
Handler（api/*.go）→ 参数校验 + 响应格式
  ↓
Service（service/）→ 业务逻辑
  ↓
DAL（dal/）→ 数据访问
  ↓
GORM Model（model/，sys_ 前缀）
```

Handler 层负责参数绑定和统一响应格式 `{ code, msg, data }`；业务规则放在 Service 中；DAL 封装 GORM 查询。业务异常由 recovery 中间件捕获并转换为同样的错误结构。

## 中间件链路

| 中间件 | 职责 |
| --- | --- |
| `request_id` | 为每个请求生成唯一 ID，贯穿日志链路 |
| `cors` | 跨域处理， Origins 由配置控制 |
| `recovery` | 捕获 panic，返回 500 而非崩溃 |
| `logger` | 请求/响应日志 |
| `jwt_auth` | 解析 Bearer Token，校验 JWT 有效性 |
| `login_guard` | 登录防爆破：5 次失败锁定 30 分钟 |
| `permission` | 基于权限标识的 RBAC 鉴权 |
| `rate_limit` | 每 IP 每分钟 300 次，burst 50 |
| `operation_log` | 操作日志异步写入审计队列 |

## 优雅关闭

收到关闭信号后分三阶段执行，每阶段超时 5 秒：

1. 停止接收新请求（5s）。
2. 插件卸载 + 发送 `app_shutdown` 事件（5s）。
3. 日志 drain + 断开数据库连接（5s）。