# 安全与权限

## 四层权限模型

| 层级 | 适用场景 | 实现 |
| --- | --- | --- |
| 免登录 | 官网首页、市场列表 | 路由注册到公开分组 |
| 仅登录 | 个人中心、我的数据 | `jwt_auth` 中间件 |
| 规则鉴权 | 用户、角色、插件管理 | `permission` 中间件 + 权限标识 |
| 数据范围 | 只访问自己的数据 | Service 层按 `user_id` 过滤 |

前端 `v-permission` 只负责隐藏按钮，不能代替后端权限检查。插件后台接口必须在服务端再次校验权限和资源归属。

## RBAC 五表模型

```text
sys_user ──┬── sys_user_role ── sys_role
                                   │
                            sys_role_menu ── sys_menu
```

用户通过角色关联菜单权限，权限标识格式为 `模块:资源:操作`（如 `system:user:list`）。

## 双令牌 JWT 机制

- **access 令牌**：有效期 24 小时（`jwt.expire_minutes: 1440`），用于 API 认证。
- **refresh 令牌**：有效期 7 天（`jwt.refresh_expire_days: 7`），用于刷新 access 令牌。
- **TokenVersion**：用户改密后递增，旧令牌自动失效。
- **黑名单**：主动登出或强制下线时将令牌加入黑名单。
- **算法白名单**：仅允许 HS256。

## 登录防爆破

连续 5 次登录失败后锁定该账号 30 分钟，由 `login_guard` 中间件实现。

## API 限流

每 IP 每分钟 300 次请求，burst 50。超出返回 429。

## 上传白名单

上传文件类型和大小受配置控制，拒绝可执行文件和脚本类型。

## 生产密钥熔断

当 `app.debug: false` 时，启动阶段检测 `jwt.secret` 是否为默认值 `change-me-in-production`，若是则拒绝启动。

## ZIP 安全检查

L2 插件 ZIP 包通过 `zipguard` 检查：

- zip bomb 防护：解压体积上限 200MB，单文件 50MB。
- 条目数上限 2000 条。
- 拒绝符号链接和绝对路径条目。