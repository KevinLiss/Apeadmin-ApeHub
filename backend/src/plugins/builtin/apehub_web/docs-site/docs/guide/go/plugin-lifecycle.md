---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '22b18860-a755-49e0-9981-c183265a8269'
  PropagateID: '22b18860-a755-49e0-9981-c183265a8269'
  ReservedCode1: '52d7865a-6f02-4376-ab39-b41a8e2bf4a5'
  ReservedCode2: '52d7865a-6f02-4376-ab39-b41a8e2bf4a5'
---

# 插件生命周期

## 三级插件体系

| 级别 | 方式 | 说明 |
| --- | --- | --- |
| L1 | 编译内置 | Go 代码中 `init()` 自注册，随主程序编译 |
| L2 | 声明式 ZIP | manifest 清单 + menu.json + seed.sql，运行时加载 |
| L3 | 外部进程 | 预留扩展，通过 IPC 通信 |

## 插件包结构

```text
# L1 Go 代码
my_plugin/
  plugin.go       # PluginInterface 实现
  models.go       # GORM 模型（可选）
  api.go          # HTTP Handler（可选）

# L2 ZIP
my_plugin.zip
  manifest.json   # name / version / entry / permissions
  menu.json       # 菜单注册
  seed.sql        # 种子数据
  static/         # 静态资源（可选）
  frontend/       # Vue 页面（可选）
```

## 运行时状态流转

```text
discovered → installing → active
                    └──→ failed
active ──disable──→ inactive
active ──uninstall→ removed
inactive ─enable─→ active
```

## Hook 责任

| Hook | 责任 |
| --- | --- |
| `OnLoad()` | 模块加载后的轻量初始化，不应依赖请求上下文 |
| `Install()` | 建表、执行迁移、种子数据；必须可重复执行 |
| `Register(router)` | 注册路由、MCP 工具或事件监听 |
| `Unregister(router)` | 释放插件创建的运行时资源 |
| `Uninstall()` | 按策略删除插件数据和资源 |
| `OnUnload()` | 清理进程内对象和缓存 |

## L1 插件开发示例

```go
package my_plugin

import (
    "github.com/gin-gonic/gin"
    "apeadmin-gin/internal/plugin"
)

type MyPlugin struct{}

func init() { plugin.Register(&MyPlugin{}) }

func (p *MyPlugin) Name() string { return "my_plugin" }
func (p *MyPlugin) OnLoad() error { return nil }
func (p *MyPlugin) Install() error { return nil } // 建表、种子数据
func (p *MyPlugin) Register(r *gin.RouterGroup) { r.GET("/hello", p.helloHandler) }
```

## 完整实战：带菜单与 MCP 工具的插件

以下示例展示一个生产级 L1 插件应包含的完整要素：命名空间、权限标识、菜单注册、MCP 工具声明。

```go
package greeting

import (
    "github.com/gin-gonic/gin"
    "apeadmin-gin/internal/mcp"
    "apeadmin-gin/internal/plugin"
    "apeadmin-gin/internal/pkg/response"
)

type GreetingPlugin struct{}

func init() { plugin.Register(&GreetingPlugin{}) }

func (p *GreetingPlugin) Name() string { return "greeting" }

// OnLoad 只做轻量初始化，不依赖请求上下文
func (p *GreetingPlugin) OnLoad() error { return nil }

// Install 建表 + 种子数据，必须可重复执行
func (p *GreetingPlugin) Install() error {
    // 例如：db.AutoMigrate(&Greeting{})；插入默认菜单到 sys_menu
    return nil
}

// Register 注册路由与 MCP 工具
func (p *GreetingPlugin) Register(r *gin.RouterGroup) {
    // 插件 API 使用自己的命名空间 /greeting
    g := r.Group("/greeting")
    g.GET("/hello", p.hello)
}

func (p *GreetingPlugin) hello(c *gin.Context) {
    response.OK(c, gin.H{"message": "hello from greeting"})
}

// McpTools 声明 MCP 工具，网关按 RequiredPermissions 做 RBAC 过滤
func (p *GreetingPlugin) McpTools() []mcp.Tool {
    return []mcp.Tool{{
        Name:        "greeting_hello",
        Description: "返回问候语",
        RequiredPermissions: []string{"greeting:hello:call"},
    }}
}

func (p *GreetingPlugin) Unregister(r *gin.RouterGroup) {}
func (p *GreetingPlugin) Uninstall() error              { return nil }
func (p *GreetingPlugin) OnUnload() error               { return nil }
```

要点：

- 插件 API、菜单、数据表、权限标识统一使用 `greeting:` 命名空间，避免与核心或其他插件冲突。
- MCP 工具声明 `RequiredPermissions` 后，网关自动做 RBAC 过滤，无需在工具内部重复校验。
- 权限标识格式 `模块:资源:操作`（如 `greeting:hello:call`）与 RBAC 五表模型保持一致。

## 事件总线

事件类型：`app_startup` / `app_shutdown` / `db_ready` / `user_login`。处理器以 goroutine 异步执行，不阻塞发布者。插件可在 `Register()` 中订阅事件。

## 升级与失败处理

升级前先停用旧版本，保留数据库和上传文件。L2 ZIP 安装通过 `zipguard` 安全检查后才执行，失败时自动回滚。

> AI生成