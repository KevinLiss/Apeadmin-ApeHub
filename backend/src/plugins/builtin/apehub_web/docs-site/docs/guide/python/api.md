---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '6f7a8df7-1a32-4b22-bdc8-755ffc7d1721'
  PropagateID: '6f7a8df7-1a32-4b22-bdc8-755ffc7d1721'
  ReservedCode1: 'dab030f8-42f0-4354-a61e-17e3f6e18ed9'
  ReservedCode2: 'dab030f8-42f0-4354-a61e-17e3f6e18ed9'
---

# API 约定

## 地址与响应

核心 API 前缀由 `settings.API_PREFIX` 配置，默认是 `/api/v1`。Apehub_web API 在此基础上使用 `/apehub-web` 前缀。

成功响应格式为 `{ code, msg, data }`。业务错误使用 `401`（登录态无效）、`403`（权限不足）、`404`（资源不存在）、`409`（状态冲突）和 `422`（参数校验失败）。

## 认证

需要登录的请求携带：

```http
Authorization: Bearer <access_token>
```

核心依赖 `get_current_user` 校验 JWT、用户状态和用户记录。后台权限接口还需要 `require_permission("system:user:list")` 这类权限依赖；插件接口应使用自己的 `apehub_web:*` 权限标识。

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
    "refresh_token": "<refresh_token>"
  }
}
```

### 携带令牌请求

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
| `/apehub-web/site/public` | 官网公开数据 |
| `/apehub-web/developer` | 插件开发者工作台 |
| `/apehub-web/admin` | 官网和市场后台管理 |

## Apehub_web 接口明细

Apehub_web 以 `/api/v1/apehub-web` 为前缀，分三类接口：

| 接口组 | 主要端点 | 鉴权 |
| --- | --- | --- |
| 官网公开 | `GET /site/public/config`、`/content`、`/navigation`、`/docs`、`/plugins`、`/plugins/{id}` | 免登录 |
| 开发者工作台 | `POST/GET /developer/plugins`、`PUT /developer/plugins/{id}`、`POST /developer/plugins/{id}/versions`、`POST .../versions/{vid}/analyze`、`/submit`、`/generate-documentation`、`/optimize-changelog`、`POST .../media`、`POST .../files`、`DELETE .../files/{fid}` | JWT 登录 |
| 后台管理 | `GET/PUT /admin/config`、`POST /admin/assets/upload`、`/admin/navigation`、`/admin/content`、`/admin/doc-categories`、`/admin/docs`、`/admin/tech-docs`、`/admin/plugin-categories`、`/admin/plugins`、`POST /admin/plugins/{id}/versions/{vid}/review`、`/publish`、`/unpublish`、`POST /admin/plugins/{id}/offline`、`/online` | JWT + `apehub_web:*` 权限 |

其中 `analyze` / `generate-documentation` / `generate-changelog` / `optimize-*` 为 AI 分析相关端点，上传文件使用 `POST .../media/upload` 与 `POST .../files`，静态检查与 AI 分析均只影响草稿版本。

## 编写插件 API

插件路由应在插件自己的 `register()` 中挂载，使用 Pydantic 请求模型和统一异常类型。不要在公开接口返回密钥、内部文件路径或未发布版本数据；文件路径必须经过目录边界校验。

> AI生成