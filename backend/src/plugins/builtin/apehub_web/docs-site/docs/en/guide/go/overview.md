---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '5ec07dc1-36ff-4beb-812d-0aa792e73f45'
  PropagateID: '5ec07dc1-36ff-4beb-812d-0aa792e73f45'
  ReservedCode1: '7479a9fd-b7a9-45f1-a574-655764f03e7f'
  ReservedCode2: '7479a9fd-b7a9-45f1-a574-655764f03e7f'
---

# Platform Overview

ApeAdmin-Gin is the Go implementation of ApeAdmin: the backend is built on Gin v1.12 + GORM v1.31, config via Viper v1.21, logs via Zap v1.28, and the frontend uses Vue 3.5 + TypeScript + Vite + Element Plus. Business capabilities are extended via plugins; the core only handles authentication, permissions, menus, logging, data access and AI capabilities.

## What It Solves

- Unified users, roles, menus and API permissions to support admin business scenarios.
- A three-tier plugin system (compiled-in / declarative ZIP / external process) isolates business code with runtime enable/disable.
- The MCP gateway safely exposes authorizable admin capabilities to AI agents.
- Structured logs, request tracing and operation logs reduce troubleshooting cost.

## Runtime Boundary

```text
Browser
  ├─ Vue Admin Panel (/)
  └─ Apehub_web Website (/apehub-web)
          │
          └─ Gin (/api/v1)
               ├─ Core APIs: auth / user / role / menu / dept / plugin
               ├─ MCP: tools / resources / prompts / audit-logs
               └─ Plugin APIs: mounted by the plugin itself
```

Default port is 8001, default account admin / admin123. Config file `configs/config.yaml`, entry point `cmd/server/main.go`.

## Directory Map

| Directory | Responsibility |
| --- | --- |
| `cmd/server` | Program entry: flag parsing + bootstrap.Run |
| `configs` | Global config (config.yaml) |
| `internal/bootstrap` | Startup orchestration: config → log → DB → seed → plugins → routes → graceful shutdown |
| `internal/api` | HTTP routes + handlers (public/auth/permission tiers) |
| `internal/config` | Viper config structs |
| `internal/core` | Core components: db / jwt / tokenstore / auditqueue / logger / seed / container |
| `internal/middleware` | Middleware chain: jwt_auth / login_guard / permission / rate_limit etc. |
| `internal/model` | GORM models (sys_ prefix) |
| `internal/schema` | Request/response DTOs |
| `internal/dal` | Data access layer |
| `internal/service` | Business logic layer |
| `internal/mcp` | MCP protocol system (manager / builtin) |
| `internal/plugin` | Plugin system (interface / registry / manager / eventbus / loader_l2 / zipguard) |
| `internal/pkg` | Shared utilities (response / pagination / tree / utils) |

## Key Principles

1. Core capabilities live in `internal/`; business capabilities live in plugin directories.
2. Plugin menus, APIs, tables and static assets must use their own namespaces.
3. Page permissions only improve the frontend experience; backend APIs must re-check permissions.
4. Production must change `jwt.secret`, otherwise the key-circuit-breaker refuses to start.