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

## 编写插件 API

插件路由在插件的 `Register()` 方法中挂载到 Gin RouterGroup。使用 `internal/schema` 中的 DTO 做请求绑定，通过 `internal/pkg/response` 统一响应。

注意事项：

- 不要在公开接口返回密钥、内部文件路径或未发布数据。
- 文件路径必须经过目录边界校验。
- 插件接口应使用自己的权限标识（如 `my_plugin:*`）。
- MCP 工具需声明 `RequiredPermissions`，网关会自动做 RBAC 过滤。