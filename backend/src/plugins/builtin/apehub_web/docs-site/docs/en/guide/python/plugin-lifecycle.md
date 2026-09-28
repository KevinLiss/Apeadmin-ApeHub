---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'c1e63ef6-2db3-409c-9e19-6656e7abb6a4'
  PropagateID: 'c1e63ef6-2db3-409c-9e19-6656e7abb6a4'
  ReservedCode1: '2fac0257-f3cf-4cf8-98f3-36d2bc7a076f'
  ReservedCode2: '2fac0257-f3cf-4cf8-98f3-36d2bc7a076f'
---

# Plugin Lifecycle

## Plugin Package Structure

```text
my_plugin/
  __init__.py
  plugin.py          # PluginInterface implementation
  plugin.json        # name / display_name / version / entry
  api.py             # optional: FastAPI routes
  models.py          # optional: plugin ORM models
  migrations/        # optional: plugin migrations
  frontend/          # optional: plugin Vue pages
  static/            # optional: plugin static assets
```

The plugin name must be a valid Python package name. `plugin.json.entry` must point to a single entry class, e.g. `plugin.MyPlugin`; do not place multiple `PluginInterface` implementations without an explicit entry.

## Runtime States

```text
discovered → installing → active
                    └──→ failed
active ──disable──→ inactive
active ──uninstall→ removed
```

The manager uses a lock to guard operations on the same plugin and tracks registered routes, MCP tools and event listeners. On disable it calls the plugin's `unregister()` first, then removes trackable runtime resources; on enable it re-registers them.

## Hook Responsibilities

| Hook | Responsibility |
| --- | --- |
| `on_load()` | Lightweight init after module load; must not depend on request context |
| `install()` | Create tables, run migrations, seed data; must be idempotent |
| `register(app)` | Register routes, static dirs, MCP tools or events |
| `unregister(app)` | Actively release runtime resources created by the plugin |
| `uninstall()` | Delete plugin data and resources under an explicit policy |
| `on_unload()` | Clean up in-process objects and caches |

## Menu & Page Contract

The menu `component` must match one-to-one to a real Vue file. Components, menus and permission identifiers must be delivered in the same plugin version; never register placeholder or planned pages.

## Production Example: a Plugin with Menu and MCP Tool

```python
# my_plugin/plugin.py
from fastapi import APIRouter, Depends
from apeadmin.plugin import PluginInterface
from apeadmin.api.deps import get_current_user, require_permission

class MyPlugin(PluginInterface):
    name = "my_plugin"

    def install(self) -> None:
        # create tables, seed data (must be idempotent)
        pass

    def register(self, app) -> None:
        # plugin APIs use their own namespace /my-plugin
        router = APIRouter(prefix="/my-plugin", tags=["my_plugin"])

        @router.get("/hello", dependencies=[Depends(require_permission("my_plugin:hello:call"))])
        async def hello():
            return {"message": "hello from my_plugin"}

        app.include_router(router)

    def unregister(self, app) -> None:
        # release runtime resources created by the plugin
        pass

    def uninstall(self) -> None:
        # delete plugin data and resources under an explicit policy
        pass

    def on_unload(self) -> None:
        pass

    def register_mcp_tools(self) -> list[dict]:
        # declare permission identifiers; the gateway does RBAC filtering automatically
        return [{
            "name": "my_plugin_hello",
            "description": "Return a greeting",
            "required_permissions": ["my_plugin:hello:call"],
        }]
```

Key points:

- Plugin APIs, menus, tables and permission identifiers uniformly use the `my_plugin:` namespace to avoid conflicts with the core or other plugins.
- Admin endpoints validate permissions server-side with `require_permission("my_plugin:*")`; the frontend `v-permission` only hides buttons.
- Once an MCP tool declares `required_permissions`, the gateway filters it uniformly; no duplicated checks are needed inside the tool.

## Upgrades & Failure Handling

Before upgrading, disable the old version and keep the database and uploaded files. If the new version fails to install, restore the plugin directory and runtime state. Migration scripts must provide a forward-compatible strategy — never rely on database rollback to undo already-published data.