---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '97d84d20-05d0-4ee7-a86c-e71f18008853'
  PropagateID: '97d84d20-05d0-4ee7-a86c-e71f18008853'
  ReservedCode1: '8cefc419-95a0-4ef7-a01a-981229813d4e'
  ReservedCode2: '8cefc419-95a0-4ef7-a01a-981229813d4e'
---

# API Conventions

## Base URL & Response

The core API prefix is configured by `settings.API_PREFIX`, defaulting to `/api/v1`. Apehub_web APIs use the `/apehub-web` prefix on top of it.

Successful responses use `{ code, msg, data }`. Business errors use `401` (invalid session), `403` (insufficient permission), `404` (resource not found), `409` (state conflict) and `422` (validation failure).

## Authentication

Requests that require login carry:

```http
Authorization: Bearer <access_token>
```

The core `get_current_user` dependency validates the JWT, the user status and the user record. Admin permission endpoints additionally need a permission dependency such as `require_permission("system:user:list")`; plugin endpoints should use their own `apehub_web:*` permission identifiers.

## Request & Response Examples

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "admin", "password": "admin123" }
```

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "access_token": "<access_token>",
    "refresh_token": "<refresh_token>"
  }
}
```

### Request with Token

```http
GET /api/v1/apehub-web/site/public/plugins
Authorization: Bearer <access_token>
```

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [],
    "total": 0
  }
}
```

### Insufficient Permission

```json
{
  "code": 403,
  "msg": "permission denied",
  "data": null
}
```

## Core API Groups

| Group | Purpose |
| --- | --- |
| `/auth` | Login, token refresh, current user info |
| `/users` | User management |
| `/roles` | Roles and menu permissions |
| `/menus` | Menu tree and dynamic route source |
| `/depts` | Departments and data scope |
| `/plugins` | Plugin discovery, hot toggling, upload and uninstall |
| `/mcp` | Tools, resources, prompts and auditing |
| `/ai` | Multi-model chat and tool calling |
| `/apehub-web/site/public` | Public website data |
| `/apehub-web/developer` | Plugin developer workbench |
| `/apehub-web/admin` | Website and marketplace admin |

## Apehub_web API Details

Apehub_web uses the `/api/v1/apehub-web` prefix and exposes three groups:

| Group | Main endpoints | Auth |
| --- | --- | --- |
| Public website | `GET /site/public/config`, `/content`, `/navigation`, `/docs`, `/plugins`, `/plugins/{id}` | None |
| Developer workbench | `POST/GET /developer/plugins`, `PUT /developer/plugins/{id}`, `POST /developer/plugins/{id}/versions`, `POST .../versions/{vid}/analyze` `/submit` `/generate-documentation` `/optimize-changelog`, `POST .../media` `.../files`, `DELETE .../files/{fid}` | JWT login |
| Admin | `GET/PUT /admin/config`, `POST /admin/assets/upload`, `/admin/navigation`, `/admin/content`, `/admin/doc-categories`, `/admin/docs`, `/admin/tech-docs`, `/admin/plugin-categories`, `/admin/plugins`, `POST /admin/plugins/{id}/versions/{vid}/review` `/publish` `/unpublish`, `POST /admin/plugins/{id}/offline` `/online` | JWT + `apehub_web:*` |

`analyze` / `generate-documentation` / `generate-changelog` / `optimize-*` are AI-analysis endpoints; file uploads use `POST .../media/upload` and `POST .../files`. Static checks and AI analysis only affect draft versions.

## Writing Plugin APIs

Mount plugin routes in the plugin's own `register()`, using Pydantic request models and the unified exception types. Never return secrets, internal file paths or unpublished data from public endpoints; file paths must pass directory-boundary validation.