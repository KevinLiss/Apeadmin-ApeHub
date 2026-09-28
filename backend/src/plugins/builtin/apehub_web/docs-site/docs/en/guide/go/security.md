---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '22790660-78b1-4e56-918d-7a265941b564'
  PropagateID: '22790660-78b1-4e56-918d-7a265941b564'
  ReservedCode1: '6bf8ee81-39d1-4e64-8fe6-f9fb6cd30fa0'
  ReservedCode2: '6bf8ee81-39d1-4e64-8fe6-f9fb6cd30fa0'
---

# Security & Permissions

## Four-Layer Permission Model

| Layer | Typical scenario | Implementation |
| --- | --- | --- |
| No login | Website home, marketplace list | Routes registered in the public group |
| Login required | Profile, my data | `jwt_auth` middleware |
| Rule-based authorization | User, role, plugin management | `permission` middleware + permission identifiers |
| Data scope | Access only your own data | Service layer filters by `user_id` |

The frontend `v-permission` directive only hides buttons — it never replaces backend permission checks. Plugin APIs must re-check permissions and resource ownership on the server.

## RBAC Five-Table Model

```text
sys_user ──┬── sys_user_role ── sys_role
                               │
                            sys_role_menu ── sys_menu
```

Users link menu permissions through roles; permission identifiers follow the `module:resource:action` format (e.g. `system:user:list`).

## Dual-Token JWT

- **access token**: valid 24 hours (`jwt.expire_minutes: 1440`), used for API auth.
- **refresh token**: valid 7 days (`jwt.refresh_expire_days: 7`), used to refresh access tokens.
- **TokenVersion**: incremented on password change; old tokens expire immediately.
- **Blacklist**: tokens are added to the blacklist on logout or forced revocation.
- **Algorithm whitelist**: HS256 only.

## Login Brute-Force Protection

5 consecutive failed logins lock the account for 30 minutes (`login_guard` middleware).

## API Rate Limit

300 requests per IP per minute, burst 50. Exceeding it returns 429.

## Upload Whitelist

Uploaded file types and sizes are controlled by config; executables and scripts are rejected.

## Production Key Circuit-Breaker

When `app.debug: false`, startup detects whether `jwt.secret` is still the default `change-me-in-production`; if so, it refuses to start.

## ZIP Security Check

L2 plugin ZIPs are checked by `zipguard`:

- ZIP-bomb protection: extracted size limit 200 MB, single file 50 MB.
- Entry count limit: 2000.
- Symbolic links and absolute path entries rejected.