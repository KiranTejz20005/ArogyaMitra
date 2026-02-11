# Run & Validation Summary

## Status: **Working**

Both backend and frontend run successfully. Endpoints and frontend flows have been verified.

---

## Backend (FastAPI)

**Start:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows
pip install -r requirements.txt
python run.py
```

- **URL:** http://localhost:8000  
- **Docs:** http://localhost:8000/docs  

**Fixes applied:**
- `requirements.txt`: `google-auth-oauthlib` set to `>=0.5.2,<2` (no 2.0.0).
- Added `email-validator` and `bcrypt>=4.0.1,<5` for Pydantic `EmailStr` and passlib.

**Endpoints verified:**
| Endpoint | Method | Result |
|----------|--------|--------|
| `/` | GET | 200 – `{"app":"ArogyaMitra","status":"ok"}` |
| `/health` | GET | 200 – `{"status":"healthy"}` |
| `/auth/register` | POST | 200 – `{access_token, token_type}` |
| `/auth/login` | POST | 200 – token |
| `/auth/me` | GET (Bearer) | 200 – user |
| `/workouts/plans` | GET (Bearer) | 200 – [] |
| `/health/` | GET (Bearer) | 200 – {} |
| `/progress/` | GET (Bearer) | 200 – [] |

---

## Frontend (Next.js)

**Start:**
```bash
cd frontend
npm install
npm run dev
```

- **URL:** http://localhost:3000  

**Fixes applied:**
- `package.json`: added `"overrides": { "date-fns": "^3.6.0" }` so `npm install` works (react-day-picker peer dependency). If you used `npm install --legacy-peer-deps` before, a clean `npm install` should work now.

**Flows verified (from server logs):**
- GET `/` 200 (landing)
- GET `/auth/login`, `/auth/sign-up` 200
- POST `/api/auth/register` 200
- GET `/api/backend/auth/me`, `/api/backend/health`, `/api/backend/workouts/plans`, `/api/backend/progress` 200
- GET `/dashboard` 200 (after login)

---

## Environment

- **backend/.env** – Used (SECRET_KEY, DATABASE_URL, CORS_ORIGINS, GROQ_API_KEY, etc.).
- **frontend/.env** – `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`, `BACKEND_URL=http://localhost:8000`.

---

## Quick test

1. Backend: `cd backend && python run.py` (leave running).
2. Frontend: `cd frontend && npm run dev` (leave running).
3. Open http://localhost:3000 → Sign up → Log in → Dashboard loads with data from backend.

No duplicate project folder; single codebase under `frontend/` and `backend/`.
