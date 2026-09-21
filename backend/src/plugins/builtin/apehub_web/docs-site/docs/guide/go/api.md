---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'acf2b1f2-8738-4d95-97cf-132c42aad834'
  PropagateID: 'acf2b1f2-8738-4d95-97cf-132c42aad834'
  ReservedCode1: '0f3f8e42-8fea-4f04-a1da-56c57886122c'
  ReservedCode2: '0f3f8e42-8fea-4f04-a1da-56c57886122c'
---

# API 约定

## 地址与响应

核心 API 前缀为 `/api/v1`。统一响应格式：

```json
{ "code": 0, "msg": "success", "data": {} }
```

业务错误使用 `401`（登录态无效）、`403`（权限不足）、`404`（资源不存在）、`409`（状态冲突）和 `422`（参数校验失败）。

## 认证

需要登录的请求携带：

```http
Authorization: Bearer <access_token>
```

JWT 使用 HS256 算法，access 令牌有效期 24 小时，refresh 令牌 7 天。中间件 `jwt_auth` 校验令牌签名、有效期和黑名单状态；`permission` 中间件基于权限标识做 RBAC 鉴权。

改密后 `TokenVersion` 递增，旧令牌自动失效。

## 请求与响应示例

### 登录

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

### 携带令牌请求

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

### 权限不足

```json
{
  "code": 403,
  "msg": "permission denied",
  "data": null
}
```

## 核心接口分组

| 分组 | 作用 |
| --- | --- |
| `/auth` | 登录、刷新令牌、当前用户信息 |
| `/users` | 用户管理 |
| `/roles` | 角色和菜单权限 |
| `/menus` | 菜单树和动态路由来源 |
| `/depts` | 部门和数据范围 |
| `/plugins` | 插件发现、热启停、上传和卸载 |
| `/mcp` | 工具、资源、提示词和审计 |
| `/ai` | 多模型对话和工具调用 |

## Apehub_web 三类接口

Apehub_web 是 ApeAdmin-Gin 的内置插件，API 以 `/api/v1/apehub-web` 为前缀，按鉴权分为三类：

| 类型 | 示例 | 鉴权 |
| --- | --- | --- |
| 官网公开接口 | `GET /site/public/plugins`、`/site/public/docs` | 注册到公开分组，免登录 |
| 开发者接口 | `/developer/plugins`、`/developer/plugins/{id}/versions` | `jwt_auth` 登录即可 |
| 后台管理接口 | `/admin/config`、`/admin/plugins/{id}/versions/{vid}/review` | `jwt_auth` + `permission`（`apehub_web:*` 权限标识） |

公开接口只返回已启用、已发布的数据；开发者接口只允许访问自己的插件；后台接口由插件权限标识保护。插件在 `Register()` 中挂载这些路由到对应的 Gin 分组即可。

## 编写插件 API

插件路由在插件的 `Register()` 方法中挂载到 Gin RouterGroup。使用 `internal/schema` 中的 DTO 做请求绑定，通过 `internal/pkg/response` 统一响应。

注意事项：

- 不要在公开接口返回密钥、内部文件路径或未发布数据。
- 文件路径必须经过目录边界校验。
- 插件接口应使用自己的权限标识（如 `my_plugin:*`）。
- MCP 工具需声明 `RequiredPermissions`，网关会自动做 RBAC 过滤。

> AI生成