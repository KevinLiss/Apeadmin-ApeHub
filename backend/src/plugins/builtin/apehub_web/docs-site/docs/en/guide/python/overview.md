---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '8dcb57b4-c4ca-46b1-8e84-16551d2cb4f4'
  PropagateID: '8dcb57b4-c4ca-46b1-8e84-16551d2cb4f4'
  ReservedCode1: 'd515f32c-6bd0-45f7-bbf3-c03eec3549c3'
  ReservedCode2: 'd515f32c-6bd0-45f7-bbf3-c03eec3549c3'
---

# Platform Overview

ApeAdmin is a decoupled admin framework: the backend is built on FastAPI with SQLAlchemy 2.0 async sessions, and the frontend uses Vue 3, TypeScript, Vite and Element Plus. Business capabilities are extended via plugins; the core only handles common authentication, permissions, menus, logging, data access and AI capabilities.

## What It Solves

- Unified users, roles, menus and API permissions to support admin business scenarios.
- Plugin packages isolate business code with runtime enable/disable and resource cleanup.
- MCP exposes authorizable admin capabilities to AI agents.
- Unified error responses, request tracing and operation logs reduce troubleshooting cost.

## Runtime Boundary

```text
Browser
  ├─ Vue Admin Panel (/)
  └─ Apehub_web Website (/apehub-web)
          │
          └─ FastAPI (/api/v1)
               ├─ Core APIs: auth / user / role / menu / dept / plugin
               ├─ MCP: tools / resources / prompts / audit-logs
               └─ Plugin APIs: mounted by the plugin itself
```

Apehub_web is a regular ApeAdmin plugin: it provides the website, marketplace, developer center and site admin APIs, but does not change the core routing rules. When enabled it mounts `/api/v1/apehub-web` and `/apehub-web`; when disabled the plugin manager removes its runtime resources and hides its menus.

## Directory Map

| Directory | Responsibility |
| --- | --- |
| `backend/src/api` | Core HTTP routes |
| `backend/src/core` | Config, security, dependency injection, middleware, seed data |
| `backend/src/db` | Async engine, sessions and database initialization |
| `backend/src/models` | Core ORM models |
| `backend/src/crud` | Generic CRUD and RBAC data operations |
| `backend/src/plugins` | Plugin interface, discovery, install, hot toggling and resource tracking |
| `backend/src/mcp` | MCP tools, resources, prompts and auditing |
| `backend/src/ai` | Multi-model chat and tool-calling loops |
| `frontend/src/router` | Static routes, dynamic menu routes and permission guards |
| `frontend/src/views` | Vue pages; paths must match the menu `component` |

## Key Principles

1. Core capabilities live in `backend/src`; business capabilities live in plugin directories.
2. Plugin menus, APIs, tables and static assets must use their own namespaces.
3. Page permissions only improve the frontend experience; backend APIs must re-check permissions.
4. Production uses migration scripts; `init_db()` is for first-time development startup only.