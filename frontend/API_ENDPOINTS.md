# ArogyaMitra API Endpoints

Reference for multi-agent development. All endpoints require authentication (Supabase session) unless noted.

## Auth

- Supabase handles auth. Use `createClient()` from `@/lib/supabase/client` or server.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat` | AROMI AI coach chat (streaming) |
| POST | `/api/workouts/generate` | Generate 7-day AI workout plan |
| GET | `/api/workouts` | Get active workout plan |
| GET | `/api/workouts/today` | Get today's workout |
| POST | `/api/workouts/complete/[exerciseId]` | Mark exercise complete |
| POST | `/api/nutrition` | Generate 7-day AI nutrition plan (no auth) |
| GET | `/api/health-assessment` | Get user's latest assessment |
| POST | `/api/health-assessment/submit` | Submit health assessment |

## Fallback Behavior

When APIs fail (network, etc.), endpoints return dummy/sample data with `fallback: true`. The UI shows a toast and displays the sample data instead of a blank screen.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Auth
- `GROQ_API_KEY` – AI (workouts, nutrition, chat)
- `SPOONACULAR_API_KEY` – Optional, for enhanced nutrition
