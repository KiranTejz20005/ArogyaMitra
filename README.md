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
pip install -r requirements.txt
python run.py
```

Or with uvicorn directly: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

API: http://localhost:8000 · Docs: http://localhost:8000/docs

**Frontend** (Node 18+)

```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000 (see .env.local.example)
npm run dev
```

App: http://localhost:3000

## Connection

- Frontend API calls use **NEXT_PUBLIC_API_URL** (and **API_URL** server-side). Do not hardcode localhost; set env in production (e.g. Render).
- Config: `frontend/config/api.ts` and `frontend/lib/backend-api.ts`.
- Backend CORS must allow the frontend origin; set in `backend/.env` as `CORS_ORIGINS`.

## Deploy (Render)

- **Backend**: Build command `pip install -r requirements.txt`. Start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set env: `SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS` (your frontend URL), `GROQ_API_KEY`.
- **Frontend**: Build `npm install && npm run build`. Start `npm start`. Set `NEXT_PUBLIC_API_URL` to your backend URL (e.g. `https://your-backend.onrender.com`) and `NEXT_PUBLIC_APP_URL` to your frontend URL.

## Env

- **Root `.env`**: Reference only; do not commit secrets.
- **Backend**: `backend/.env` – SECRET_KEY, DATABASE_URL, CORS_ORIGINS, GROQ_*, etc.
- **Frontend**: `frontend/.env.local` – **NEXT_PUBLIC_API_URL** (backend API URL), **NEXT_PUBLIC_APP_URL** (this app’s URL for SSR), optional GROQ/Supabase. No secrets.

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
