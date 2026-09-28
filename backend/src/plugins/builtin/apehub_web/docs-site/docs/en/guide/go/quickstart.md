---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '450d32f4-4be1-4bca-865f-dab9082a84f5'
  PropagateID: '450d32f4-4be1-4bca-865f-dab9082a84f5'
  ReservedCode1: '9264a28b-ecbf-438b-b468-501bae926134'
  ReservedCode2: '9264a28b-ecbf-438b-b468-501bae926134'
---

# Local Run

## Environment Requirements

- Go 1.21 or higher
- Node.js 18 or higher
- Git
- SQLite works for development; MySQL is recommended for production

## Start the Backend

```bash
# Build
go build -o bin/server ./cmd/server

# Run (reads configs/config.yaml by default)
./bin/server

# Or run directly
go run cmd/server/main.go
```

The backend listens on `http://127.0.0.1:8001` by default. On startup it initializes core tables, seed menus and loads enabled plugins.

Environment variables override config (the `GA_` prefix):

```bash
GA_APP_PORT=8001 GA_APP_DEBUG=true go run cmd/server/main.go
```

## Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`, proxying backend APIs through Vite.

## Access the Website

The ApeHub website and marketplace ship with the core as a plugin:

- Home: `http://127.0.0.1:8001/apehub-web/`
- Marketplace: `http://127.0.0.1:8001/apehub-web/plugins.html`
- Technical Docs: `http://127.0.0.1:8001/apehub-web/docs-portal/`
- Profile: `http://127.0.0.1:8001/apehub-web/profile.html`

The profile page requires website login state; when logged out it only shows a login prompt.

## Configuration

Key config items live in `configs/config.yaml`:

```yaml
app:
  port: 8001
  debug: true
  spa_dir: frontend/dist
database:
  type: sqlite          # or mysql
  max_open_conns: 50
jwt:
  secret: change-me-in-production
  expire_minutes: 1440
  refresh_expire_days: 7
cors:
  origins: localhost:5173,8000
mcp:
  timeout: 30
  max_concurrency: 10
```

## Default Trial Path

1. Log in to the admin panel with admin / admin123.
2. Confirm the plugin plugin is enabled under plugin management.
3. Refresh dynamic menus and confirm the plugin page is reachable.
4. Try tool calls from the MCP panel.

Do not use default passwords in production, and never commit keys to the repository.