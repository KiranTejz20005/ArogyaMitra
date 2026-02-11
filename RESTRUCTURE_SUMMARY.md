# Restructure Summary – Single Codebase, No Dummies

## What was done

### 1. Single source of truth
- **Frontend**: All UI lives in **`frontend/`** (Next.js app, components, hooks, lib, config, styles, public, types). There is no second frontend.
- **Backend**: All server logic lives in **`backend/`** (FastAPI: routers, services, models, core). The nested project’s small backend was not merged; the root backend is the only one.
- **Shared**: **`shared/types`** and **`shared/constants`** for API contracts.

### 2. Removed dummy data and fallbacks
- **Deleted** `frontend/lib/dummy-data.ts` (DUMMY_WORKOUT_PLAN, DUMMY_NUTRITION_PLAN, DUMMY_DASHBOARD).
- **Dashboard** (`app/dashboard/page.tsx`): Fetches only from the real backend via `/api/backend/auth/me`, `/api/backend/health`, `/api/backend/workouts/plans`, `/api/backend/progress`. No Supabase, no dummy data.
- **Workouts API** (`app/api/workouts/route.ts`, `today/route.ts`): Proxy to backend; return empty or error when backend fails (no dummy plans).
- **Workouts generate** (`app/api/workouts/generate/route.ts`): Uses cookie auth, backend for user/health, Groq for generation, backend to create plan. On failure returns 500 (no dummy plan).
- **Nutrition API** (`app/api/nutrition/route.ts`): Removed DUMMY_NUTRITION_PLAN; on parse/API failure returns 502/500.
- **Nutrition view** (`components/dashboard/nutrition-view.tsx`): Removed dummy import; on load failure sets `aiPlan` to `null` and shows error/toast.

### 3. Backend proxy routes (frontend → backend)
- `GET /api/backend/auth/me` – current user (existing).
- `GET /api/backend/health` – health assessment.
- `GET /api/backend/workouts/plans` – workout plans.
- `GET /api/backend/workouts` – workouts list.
- `GET /api/backend/progress` – progress entries.

All use the `arogyamitra_token` cookie and forward the request to the FastAPI backend.

### 4. Files changed (no logic rewrite)
- **app/dashboard/page.tsx** – Switched to backend-only data (profile, assessment, workoutPlans, progressRecords, achievements).
- **app/api/workouts/route.ts** – Proxies to backend; no Supabase/dummy.
- **app/api/workouts/today/route.ts** – Uses backend workouts; no dummy.
- **app/api/workouts/generate/route.ts** – Cookie + backend user/health + Groq; saves plan to backend; no dummy fallback.
- **app/api/nutrition/route.ts** – Removed dummy fallbacks; returns error on failure.
- **components/dashboard/nutrition-view.tsx** – Removed dummy import; error state when plan fails to load.
- **lib/dummy-data.ts** – Deleted.

### 5. Nested project folder
- **v0-project-credit-analysis** could not be deleted automatically (folder in use).
- **Manual step:** Close all editors/terminals using that folder, then delete the **`v0-project-credit-analysis`** directory so the repo has a single root and no duplicate code.

## Final layout (after you delete the nested folder)

```
v00 (root)
├── backend/          # FastAPI only
├── frontend/         # Next.js only (full UI, real backend only)
├── shared/
│   ├── types/
│   └── constants/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── RESTRUCTURE_SUMMARY.md
```

## Validation

- Backend: `cd backend && pip install -r requirements.txt && python run.py`
- Frontend: `cd frontend && npm install && npm run dev`
- Log in via frontend; dashboard and data come from the backend only (no dummy data).
- After deleting `v0-project-credit-analysis`, there is a single codebase and no duplicate app/backend/config.
