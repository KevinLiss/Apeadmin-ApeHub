---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '91e797e7-f5a1-46b9-b9e2-54a4f04c2561'
  PropagateID: '91e797e7-f5a1-46b9-b9e2-54a4f04c2561'
  ReservedCode1: 'a540a9e3-69f7-4d8a-ad28-2e9d619413c3'
  ReservedCode2: 'a540a9e3-69f7-4d8a-ad28-2e9d619413c3'
---

# Operations & Troubleshooting

## Logging

ApeAdmin-Gin uses Zap for structured JSON logs. Every request is assigned a unique ID by the `request_id` middleware, threading through the entire call chain. Operation logs are written through the async `auditqueue` and never block the main request.

MCP calls are audited automatically, recording request params, response results, latency and caller info — viewable in the admin panel.

When troubleshooting, check in order: startup logs, plugin status, the log entries for the RequestID, and the API responses in the browser Network tab.

## Common Issues

### Menu 404

Check that the menu `component` resolves to a `.vue` file of the same name under `frontend/src/views` (case-sensitive). Then sign out and reload the user menu.

### Plugin APIs Missing

Check whether the plugin `Register()` ran successfully and look at the plugin-loading stage in the startup logs. For L2 ZIP plugins, confirm the manifest format is correct. If needed, disable and re-enable.

### AI Chat Fails

Confirm the AI model API key and network access are configured in the admin panel; check the MCP gateway timeout (default 30s) and concurrency limit (default 10). Inspect the MCP audit logs for error details.

### Assets 404

Confirm the plugin is enabled and check the static file directory config (`app.spa_dir`) and route registration.

## Production Checklist

- [ ] Change `jwt.secret`; otherwise the key circuit-breaker refuses to start (it detects the default secret when debug=false).
- [ ] Adjust the database pool `max_open_conns` to match actual load.
- [ ] Confirm the API rate limit (300/IP/min, burst 50) fits your needs.
- [ ] Configure CORS Origins for your production domain.
- [ ] Verify the graceful shutdown flow: plugin unload → event notification → log drain → DB disconnect.
- [ ] Configure backup and access control for the `uploads/` directory.