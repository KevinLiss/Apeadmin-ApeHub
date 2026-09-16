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

## 事件总线

事件类型：`app_startup` / `app_shutdown` / `db_ready` / `user_login`。处理器以 goroutine 异步执行，不阻塞发布者。插件可在 `Register()` 中订阅事件。

## 升级与失败处理

升级前先停用旧版本，保留数据库和上传文件。L2 ZIP 安装通过 `zipguard` 安全检查后才执行，失败时自动回滚。