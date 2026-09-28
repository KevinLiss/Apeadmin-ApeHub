---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '0f37daa7-8788-483f-92c2-5a0ee5a858de'
  PropagateID: '0f37daa7-8788-483f-92c2-5a0ee5a858de'
  ReservedCode1: 'b4aa56e9-8897-4ced-bf11-1d0e24bdb9eb'
  ReservedCode2: 'b4aa56e9-8897-4ced-bf11-1d0e24bdb9eb'
---

# Architecture & Request Flow

## Application Startup

`cmd/server/main.go` parses flags then calls `bootstrap.Run`, which starts in this order:

1. Load config: Viper reads `configs/config.yaml`; env vars with the `GA_` prefix override it.
2. Initialize Zap structured logging (JSON).
3. Initialize GORM database: MySQL / SQLite auto-switch + connection pool (`max_open_conns: 50`).
4. Seed data: superadmin account + core menus.
5. Scan and register plugins: L1 `init()` self-registration + L2 declarative ZIP loading.
6. Register HTTP routes: public / auth / permission groups.
7. Start the MCP gateway.
8. Dispatch the `app_startup` event.

## Backend Layering

```text
HTTP Request
  ↓
Middleware (request_id / cors / recovery / jwt_auth / permission / rate_limit / operation_log)
  ↓
Gin Router (public / auth / permission groups)
  ↓
Handler (api/*.go) → parameter binding + response format
  ↓
Service (service/) → business logic
  ↓
DAL (dal/) → data access
  ↓
GORM Model (model/, sys_ prefix)
```

The Handler layer handles parameter binding and the unified response format `{ code, msg, data }`; business rules live in Service; DAL wraps GORM queries. Business exceptions are caught by the recovery middleware and converted to the same error structure.

## Middleware Chain

| Middleware | Responsibility |
| --- | --- |
| `request_id` | Generates a unique ID per request, threading through the log chain |
| `cors` | Cross-origin handling; Origins controlled by config |
| `recovery` | Catches panics, returns 500 instead of crashing |
| `logger` | Request/response logging |
| `jwt_auth` | Parses Bearer tokens, validates JWT validity |
| `login_guard` | Login brute-force protection: 5 failures locks for 30 minutes |
| `permission` | RBAC authorization based on permission identifiers |
| `rate_limit` | 300 requests/IP/minute, burst 50 |
| `operation_log` | Operation logs written asynchronously to the audit queue |

## Graceful Shutdown

After receiving a shutdown signal, shutdown runs in three phases, each with a 5-second timeout:

1. Stop accepting new requests (5s).
2. Plugin unload + dispatch `app_shutdown` event (5s).
3. Drain logs + close database connections (5s).