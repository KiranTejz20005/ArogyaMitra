# ArogyaMitra – Single Root Project

One repository: **frontend** (Next.js), **backend** (FastAPI), **shared** (types/constants).

## Folder layout

```
root (v00)
├── frontend/          # Next.js app (UI, app router, components, hooks, lib, styles, public, types)
├── backend/           # FastAPI (app: routers, services, models, core, database)
├── shared/            # types, constants (reference for API contracts)
├── .env               # Reference; copy to backend/.env and frontend/.env.local
├── .env.example
├── .gitignore
└── README.md
```

## Run

**Backend** (Python 3.10+)

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
# Ensure backend/.env exists (SECRET_KEY, DATABASE_URL, CORS_ORIGINS, etc.)
python run.py
```

API: http://localhost:8000 · Docs: http://localhost:8000/docs

**Frontend** (Node 18+)

```bash
cd frontend
npm install
cp ../.env .env.local   # or create; set NEXT_PUBLIC_BACKEND_URL and BACKEND_URL
npm run dev
```

App: http://localhost:3000

## Connection

- Frontend calls the backend via **NEXT_PUBLIC_BACKEND_URL** / **BACKEND_URL** (default `http://localhost:8000`).
- Config: `frontend/lib/backend-api.ts` (and auth API routes under `frontend/app/api/auth/`).
- Backend CORS must allow the frontend origin (e.g. `http://localhost:3000`); set in `backend/.env` as `CORS_ORIGINS`.

## Env

- **Root `.env`**: Reference only; do not commit secrets.
- **Backend**: `backend/.env` – all server-side vars (SECRET_KEY, DATABASE_URL, GROQ_*, etc.).
- **Frontend**: `frontend/.env.local` – only `NEXT_PUBLIC_BACKEND_URL` and `BACKEND_URL` (and optional GROQ for API routes). No secrets.

## Validation

- [ ] `cd backend && pip install -r requirements.txt && python run.py` – backend starts
- [ ] `cd frontend && npm install && npm run dev` – frontend starts
- [ ] Login/sign-up and dashboard load; API calls hit backend
- [ ] No broken imports; no duplicate `node_modules` or configs at root

## Cleanup (required to remove double code)

**Delete the nested project folder** so there is only one codebase:

1. Close any tabs or terminals using files inside `v0-project-credit-analysis`.
2. In File Explorer or your IDE, delete the folder **`v0-project-credit-analysis`** (the entire folder).
3. After deletion, the root should contain only: `backend/`, `frontend/`, `shared/`, and root config files. No duplicate app, backend, or package.json.
