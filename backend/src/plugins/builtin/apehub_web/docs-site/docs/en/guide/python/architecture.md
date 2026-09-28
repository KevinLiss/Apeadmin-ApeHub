---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '1469312a-a5c1-4c5c-9353-431da0f19cf8'
  PropagateID: '1469312a-a5c1-4c5c-9353-431da0f19cf8'
  ReservedCode1: 'cee9930a-0152-49dc-8037-8ac9a652a6d9'
  ReservedCode2: 'cee9930a-0152-49dc-8037-8ac9a652a6d9'
---

# Architecture & Request Flow

## Application Startup

The lifespan in `backend/src/main.py` starts the app in this order:

1. Initialize logging, middleware and exception handlers.
2. Initialize the database connection; the dev environment may auto-create tables.
3. Run core seed data to ensure default departments, roles and menus exist.
4. Scan `backend/src/plugins/builtin`, sync plugin metadata and enabled state.
5. Execute `install()` on enabled plugins, then register HTTP routes, MCP tools and event listeners.
6. Register MCP HTTP routes and dispatch the `APP_STARTUP` event.

On shutdown, plugins unload their runtime resources first, then the database pool closes.

## Backend Layering

```text
HTTP Request
  ↓
Middleware (request id, CORS, exception filter, operation log)
  ↓
FastAPI Router
  ↓
Dependency (get_db / get_current_user / require_permission)
  ↓
CRUD / Service
  ↓
SQLAlchemy Model + AsyncSession
```

The routing layer handles parameter validation and response format; business rules live in service functions; database commits stay inside the transaction boundary of business operations. The unified success response is `{ code, msg, data }`; business exceptions are converted by the global handler into the same error structure.

## Frontend Routing

The admin panel loads user info and the menu tree on startup. `frontend/src/router/index.ts` uses `import.meta.glob('@/views/**/*.vue')` to resolve the menu `component`:

```text
Menu component: apehub_web/admin/Config
Page file:       frontend/src/views/apehub_web/admin/Config.vue
Access path:     /apehub-web/admin/config
```

If the component is missing, no dynamic route is generated and users hit a 404. So the menu registration, page file and permission identifiers must be delivered as one plugin version.

## Apehub_web's Three API Groups

| Type | Example | Auth |
| --- | --- | --- |
| Public website APIs | `/api/v1/apehub-web/site/public/*` | No login required |
| Developer APIs | `/api/v1/apehub-web/developer/*` | JWT login |
| Admin APIs | `/api/v1/apehub-web/admin/*` | JWT + plugin permission |

Public APIs only return enabled, published data; developer APIs only access the developer's own plugins; admin APIs are protected by `apehub_web:*` menu permissions.