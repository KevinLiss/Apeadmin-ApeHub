---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '21651708-8c2a-45d2-9eb9-4b0181d91bf7'
  PropagateID: '21651708-8c2a-45d2-9eb9-4b0181d91bf7'
  ReservedCode1: '1d7fda69-f418-48a0-bf8b-a21dff3009e3'
  ReservedCode2: '1d7fda69-f418-48a0-bf8b-a21dff3009e3'
---

# API Conventions

## Address & Response

The core API prefix is `/api/v1`. The unified response format:

```json
{ "code": 0, "msg": "success", "data": {} }
```

Business errors use `401` (invalid session), `403` (insufficient permission), `404` (resource not found), `409` (state conflict) and `422` (validation failure).

## Authentication

Requests that require login carry:

```http
Authorization: Bearer <access_token>
```

JWT uses the HS256 algorithm; access tokens are valid for 24 hours and refresh tokens for 7 days. The `jwt_auth` middleware validates the signature, expiry and blacklist status; the `permission` middleware does RBAC authorization based on permission identifiers.

After a password change, `TokenVersion` increments and old tokens become invalid automatically.

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
    "refresh_token": "<refresh_token>",
    "expires_in": 86400
  }
}
```

### Request with Token

```http
GET /api/v1/users?page=1&page_size=20
Authorization: Bearer <access_token>
```

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [],
    "total": 0,
    "page": 1,
    "page_size": 20
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
| `/plugins` | Plugin discovery, hot toggle, upload and uninstall |
| `/mcp` | Tools, resources, prompts and auditing |
| `/ai` | AI chat and tool calling |

## Apehub_web's Three API Groups

Apehub_web is a built-in plugin of ApeAdmin-Gin. Its APIs use the `/api/v1/apehub-web` prefix and are grouped by authentication:

| Group | Example | Auth |
| --- | --- | --- |
| Public website | `GET /site/public/plugins` `/site/public/docs` | Public group, no login |
| Developer | `/developer/plugins`, `/developer/plugins/{id}/versions` | `jwt_auth` login only |
| Admin | `/admin/config`, `/admin/plugins/{id}/versions/{vid}/review` | `jwt_auth` + `permission` (`apehub_web:*`) |

Public APIs return only enabled, published data; developer APIs only access the developer's own plugins; admin APIs are protected by plugin permission identifiers. Plugins mount these routes to the matching Gin groups in `Register()`.

## Writing Plugin APIs

Plugin routes are mounted to a Gin RouterGroup in the plugin's `Register()`. Use DTOs from `internal/schema` for request binding and `internal/pkg/response` for unified responses.

Notes:

- Never return keys, internal file paths or unpublished data from public endpoints.
- File paths must pass directory-boundary validation.
- Plugin endpoints should use their own permission identifiers (e.g. `my_plugin:*`).
- MCP tools must declare `RequiredPermissions`; the gateway does RBAC filtering automatically.