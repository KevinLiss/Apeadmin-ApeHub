---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'dbb5be62-1526-4be4-8a86-d0a2d280cba1'
  PropagateID: 'dbb5be62-1526-4be4-8a86-d0a2d280cba1'
  ReservedCode1: 'af09cfbb-ed8f-419d-b06b-8345ef00586f'
  ReservedCode2: 'af09cfbb-ed8f-419d-b06b-8345ef00586f'
---

# Local Run

## Environment

- Python 3.11 or higher
- Node.js 18 or higher
- Git
- SQLite works for development; MySQL is recommended for production

## Start the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -e .
uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

The backend API docs are at `http://127.0.0.1:8000/docs`. On startup it initializes core tables, seed menus and loads enabled built-in plugins.

## Start the Admin Panel

```bash
cd frontend
npm install
npm run dev
```

The dev server usually runs at `http://localhost:5173`. The frontend proxies backend APIs through Vite.

## Access the Website

- Home: `/apehub-web/index.html`
- Marketplace: `/apehub-web/plugins.html`
- Technical Docs: `/apehub-web/docs-portal/`
- Profile: `/apehub-web/profile.html`

The profile page requires website login state; when logged out it only shows a login prompt and does not read developer data.

## First Checks

1. Sign in to the admin panel with an administrator account.
2. Confirm `Apehub_web` is enabled under "Plugin Management".
3. Open the website home and this docs entry, and confirm no static asset 404s.
4. Refresh dynamic menus in the admin panel and confirm all `apehub_web/admin/*` pages are reachable.

Do not use default passwords in production, and never commit SMTP authorization codes, AI keys or payment keys to the repository.