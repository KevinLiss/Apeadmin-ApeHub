---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '0b459eab-af06-4bf1-b0b9-127d5dfc972f'
  PropagateID: '0b459eab-af06-4bf1-b0b9-127d5dfc972f'
  ReservedCode1: 'c4542464-ba63-4608-acfc-79af01459925'
  ReservedCode2: 'c4542464-ba63-4608-acfc-79af01459925'
---

# Plugin Lifecycle

## Three-Tier Plugin System

| Tier | Approach | Description |
| --- | --- | --- |
| L1 | Compiled-in | Go code self-registers via `init()`, compiled with the main binary |
| L2 | Declarative ZIP | manifest + menu.json + seed.sql, loaded at runtime |
| L3 | External process | Reserved extension via IPC |

## Plugin Package Structure

```text
# L1 Go code
my_plugin/
  plugin.go       # PluginInterface implementation
  models.go       # GORM models (optional)
  api.go          # HTTP handlers (optional)

# L2 ZIP
my_plugin.zip
  manifest.json   # name / version / entry / permissions
  menu.json       # menu registration
  seed.sql        # seed data
  static/         # static assets (optional)
  frontend/       # Vue pages (optional)
```

## Runtime State Transitions

```text
discovered → installing → active
                    └──→ failed
active ──disable──→ inactive
active ──uninstall→ removed
inactive ─enable─→ active
```

## Hook Responsibilities

| Hook | Responsibility |
| --- | --- |
| `OnLoad()` | Lightweight init after module load; must not depend on request context |
| `Install()` | Create tables, run migrations, seed data; must be idempotent |
| `Register(router)` | Register routes, MCP tools or event listeners |
| `Unregister(router)` | Release runtime resources created by the plugin |
| `Uninstall()` | Delete plugin data and resources under an explicit policy |
| `OnUnload()` | Clean up in-process objects and caches |

## L1 Plugin Example

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
func (p *MyPlugin) Install() error { return nil } // create tables, seed data
func (p *MyPlugin) Register(r *gin.RouterGroup) { r.GET("/hello", p.helloHandler) }
```

## Production Example: a Plugin with Menu and MCP Tool

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

// OnLoad does lightweight init only; no request context
func (p *GreetingPlugin) OnLoad() error { return nil }

// Install creates tables + seed data; must be idempotent
func (p *GreetingPlugin) Install() error {
    // e.g. db.AutoMigrate(&Greeting{}); insert default menus into sys_menu
    return nil
}

// Register registers routes and MCP tools
func (p *GreetingPlugin) Register(r *gin.RouterGroup) {
    // plugin APIs use their own namespace /greeting
    g := r.Group("/greeting")
    g.GET("/hello", p.hello)
}

func (p *GreetingPlugin) hello(c *gin.Context) {
    response.OK(c, gin.H{"message": "hello from greeting"})
}

// McpTools declares MCP tools; the gateway does RBAC filtering by RequiredPermissions
func (p *GreetingPlugin) McpTools() []mcp.Tool {
    return []mcp.Tool{{
        Name:        "greeting_hello",
        Description: "Return a greeting",
        RequiredPermissions: []string{"greeting:hello:call"},
    }}
}

func (p *GreetingPlugin) Unregister(r *gin.RouterGroup) {}
func (p *GreetingPlugin) Uninstall() error              { return nil }
func (p *GreetingPlugin) OnUnload() error               { return nil }
```

Key points:

- Plugin APIs, menus, tables and permission identifiers uniformly use the `greeting:` namespace to avoid conflicts with the core or other plugins.
- Once an MCP tool declares `RequiredPermissions`, the gateway does RBAC filtering automatically — no duplicated checks inside the tool.
- Permission identifiers follow `module:resource:action` (e.g. `greeting:hello:call`), consistent with the RBAC five-table model.

## Event Bus

Event types: `app_startup` / `app_shutdown` / `db_ready` / `user_login`. Handlers run asynchronously in goroutines and never block the publisher. Plugins can subscribe to events in `Register()`.

## Upgrades & Failure Handling

Before upgrading, disable the old version and keep the database and uploaded files. L2 ZIP installs run only after `zipguard` security checks pass and roll back automatically on failure.