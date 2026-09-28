---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '54643897-2147-4b3c-b098-87fb372d09fe'
  PropagateID: '54643897-2147-4b3c-b098-87fb372d09fe'
  ReservedCode1: '4a845224-e884-4686-b988-b541e2a15a78'
  ReservedCode2: '4a845224-e884-4686-b988-b541e2a15a78'
---

# Operations & Troubleshooting

## Logs

ApeAdmin generates a request ID for every API request and records the method, path, status code, latency, user and client info in `sys_log`. MCP calls have a separate `McpAuditLog`; you can inspect tool results and failure reasons in the admin panel.

When debugging plugin issues, check in order: startup logs, the plugin's `runtime_state` / `last_error`, the `sys_log` entries for the request ID, and the API responses in the browser Network tab.

## Common Issues

### Menu returns 404

Check that the menu `component` resolves to a `.vue` file of the same name under `frontend/src/views` (case-sensitive). Then sign out and reload the user menus.

### Plugin shows enabled but APIs are missing

Check whether the plugin's `register(app)` succeeded and whether there are duplicate prefixes. If needed, disable and re-enable the plugin; never delete a running plugin directory directly.

### AI document analysis fails

Confirm the DeepSeek API Key, model and network access are configured in the admin panel. Check whether the upload exceeds the size/file-count limits or contains path traversal, symlinks or encrypted files.

### Website assets 404

Confirm Apehub_web is enabled and the `/apehub-web` static mount exists. Plugin packages must include `static/docs-portal` but not the dev-only `node_modules`.

## Production Checklist

- Change the default admin password and restrict admin access.
- Use environment variables or a secret manager for database, JWT, SMTP, AI and payment credentials.
- Use migration scripts instead of relying on auto table creation.
- Configure backup and access control for the uploads directory.
- Verify the disable, re-enable, upgrade and uninstall flows; confirm no menu, route, database or file resources are left behind.