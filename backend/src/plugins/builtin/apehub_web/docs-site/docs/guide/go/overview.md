# 平台概览

ApeAdmin-Gin 是 ApeAdmin 的 Go 语言实现：后端基于 Gin v1.12 + GORM v1.31，配置使用 Viper v1.21，日志使用 Zap v1.28，前端使用 Vue 3.5 + TypeScript + Vite + Element Plus。业务能力通过插件扩展，核心只负责认证、权限、菜单、日志、数据访问和 AI 能力。

## 解决什么问题

- 用统一的用户、角色、菜单和接口权限支撑中后台业务。
- 用三级插件体系（编译内置 / 声明式 ZIP / 外部进程）隔离业务代码，支持运行时启停。
- 用 MCP 网关将可授权的管理能力安全暴露给 AI Agent。
- 用结构化日志、请求追踪和操作日志降低排查成本。

## 运行边界

```text
浏览器
  ├─ Vue 管理台（/）
  └─ Apehub_web 官网（/apehub-web）
          │
          └─ Gin（/api/v1）
               ├─ 核心 API：auth / user / role / menu / dept / plugin
               ├─ MCP：tools / resources / prompts / audit-logs
               └─ 插件 API：由插件自行挂载
```

默认端口 8001，默认账号 admin / admin123。配置文件 `configs/config.yaml`，入口 `cmd/server/main.go`。

## 目录速览

| 目录 | 责任 |
| --- | --- |
| `cmd/server` | 程序入口，flag 解析 + bootstrap.Run |
| `configs` | 全局配置（config.yaml） |
| `internal/bootstrap` | 启动编排：配置→日志→DB→种子→插件→路由→优雅关闭 |
| `internal/api` | HTTP 路由 + Handler（公开/认证/权限三级分组） |
| `internal/config` | Viper 配置结构体 |
| `internal/core` | 核心组件：db / jwt / tokenstore / auditqueue / logger / seed / container |
| `internal/middleware` | 中间件链：jwt_auth / login_guard / permission / rate_limit 等 |
| `internal/model` | GORM 模型（sys_ 前缀） |
| `internal/schema` | 请求/响应 DTO |
| `internal/dal` | 数据访问层 |
| `internal/service` | 业务逻辑层 |
| `internal/mcp` | MCP 协议体系（manager / builtin） |
| `internal/plugin` | 插件系统（interface / registry / manager / eventbus / loader_l2 / zipguard） |
| `internal/pkg` | 公共工具（response / pagination / tree / utils） |

## 关键原则

1. 核心能力放在 `internal/`，业务能力放在插件目录。
2. 插件的菜单、接口、数据表和静态资源必须使用自己的命名空间。
3. 页面权限只用于前端体验，后端接口必须再次校验权限。
4. 生产环境必须修改 `jwt.secret`，否则密钥熔断机制会拒绝启动。