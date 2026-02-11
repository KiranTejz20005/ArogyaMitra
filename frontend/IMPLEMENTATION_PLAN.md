# ArogyaMitra Implementation Plan
## Based on AroMi_doc.docx PDF Specification

---

## 1. Executive Summary

This plan maps the AroMi PDF specification to the **current Next.js codebase** and defines a phased implementation strategy. The PDF describes a FastAPI + React/Vite architecture, while the current project uses **Next.js 16** (full-stack), **Supabase** (auth + DB), and **Groq** (AI). The plan adapts PDF requirements to this stack.

### Architecture Mapping

| PDF Specification | Current Project |
|-------------------|-----------------|
| FastAPI backend | Next.js API Routes (App Router) |
| React + Vite frontend | Next.js (React) with App Router |
| SQLite / custom DB | Supabase (PostgreSQL) |
| JWT auth | Supabase Auth |
| Separate backend/frontend | Unified Next.js app |

### What Already Exists ✓

- **Auth**: Supabase sign-up, login, callback
- **Profiles**: `profiles` table with fitness_goal, activity_level, dietary_preference
- **Health Assessments**: 12-question form, BMI, health_conditions, injuries, sleep, stress
- **Database Models**: workout_plans, exercises, nutrition_plans, meals, progress_records, achievements, chat_sessions, chat_messages
- **AROMI AI Coach**: Chat API route using Groq LLaMA-3.3-70B, profile/assessment context
- **Dashboard**: Workouts, Nutrition, Coach, Progress, Achievements, Assessment, Profile
- **Floating AROMI**: Chat UI component
- **Video Player**: YouTube embed with custom controls, `/videos` page
- **Landing Page**: Hero, ArogyaMitra section, features, CTA

---

## 2. Gap Analysis

### High Priority (Core PDF Features)

| Feature | PDF Requirement | Current State | Effort |
|---------|-----------------|---------------|--------|
| **AI-Generated Workout Plans** | 7-day plans from goals, preferences, time; warmups, exercises, rest, YouTube links | Manual plan creation only | High |
| **AI-Generated Nutrition Plans** | 7-day Indian cuisine, macros, allergies, Spoonacular | Tables exist; no AI/Spoonacular | High |
| **YouTube API Integration** | Fetch exercise videos dynamically per plan | Static video list; manual youtube_video_id | Medium |
| **Exercise Player** | Embedded YouTube per exercise, Start Workout flow | Basic video modal; no guided flow | Medium |
| **Spoonacular API** | Recipes, nutrition data, meal plans | Not integrated | High |

### Medium Priority (Enhancement Features)

| Feature | PDF Requirement | Current State | Effort |
|---------|-----------------|---------------|--------|
| **Google Calendar API** | Sync workout + meal schedules | Not implemented | Medium |
| **Shopping List** | Auto-generated from meal plans | Not implemented | Medium |
| **BigBasket Redirect** | Purchase items from shopping list | Not implemented | Low |
| **Charity Gamification** | Calories/goals → charitable contributions | achievements.charity_points exists; no logic | Medium |
| **Workout Completion Flow** | Track completion, update progress | Partial (progress_records) | Medium |

### Lower Priority (Polish)

| Feature | PDF Requirement | Current State | Effort |
|---------|-----------------|---------------|--------|
| **Zustand State Management** | Global state, localStorage | React state, Supabase | Low (optional) |
| **7-Day Schedule View** | Calendar-style workout/meal display | Basic plan list | Medium |

---

## 3. Implementation Phases

### Phase 1: AI Workout Plan Generation (Weeks 1–2)

**Goal**: Generate personalized 7-day workout plans via Groq AI based on user profile and assessment.

**Tasks**:

1. **API Route**: `app/api/workouts/generate/route.ts`
   - Input: userId, preferences (goal, time/day, equipment: Home/Gym)
   - Fetch profile + assessment from Supabase
   - Call Groq with structured prompt to generate JSON: 7 days, exercises per day, sets, reps, rest, warmup
   - Parse response and insert into `workout_plans` + `exercises`

2. **YouTube Video Enrichment**:
   - Option A: Include YouTube search in Groq prompt (model returns video IDs)
   - Option B: Post-process: call YouTube Data API to search by exercise name, attach `youtube_video_id`

3. **Frontend**: "Generate Plan" flow in Workouts page
   - Form: goal, minutes/day, equipment (Home/Gym)
   - Call API, show loading, display generated plan

**Dependencies**: GROQ_API_KEY (exists), YOUTUBE_API_KEY (add to .env)

---

### Phase 2: AI Nutrition Plan Generation (Weeks 2–3)

**Goal**: Generate 7-day Indian cuisine meal plans with Spoonacular + Groq.

**Tasks**:

1. **Spoonacular Integration**:
   - Add SPOONACULAR_API_KEY to .env
   - Create `lib/spoonacular.ts`: fetch recipes by query, dietary filters, calories
   - Endpoints: recipes search, recipe by ID, nutrition info

2. **API Route**: `app/api/nutrition/generate/route.ts`
   - Input: userId, dailyCalories, dietaryType, allergies[]
   - Fetch profile (dietary_preference, allergies from assessment)
   - Use Groq to generate 7-day meal structure (breakfast, lunch, dinner, snacks)
   - For each meal: call Spoonacular for matching recipes, extract macros
   - Insert into `nutrition_plans` + `meals`

3. **Frontend**: "Generate Plan" in Nutrition page
   - Form: calories, diet type, allergies
   - Display 7-day meals with macros, recipes, images

**Dependencies**: SPOONACULAR_API_KEY

---

### Phase 3: Exercise Player & Workout Flow (Week 3)

**Goal**: Guided workout execution with embedded YouTube per exercise.

**Tasks**:

1. **Exercise Player Component**:
   - Full-screen or modal player for a single exercise
   - YouTube embed (reuse `YouTubePlayerWithControls`)
   - "Next Exercise" / "Complete Workout" actions

2. **Start Workout Flow**:
   - From workout plan, "Start Day 1" (or selected day)
   - Step through exercises in order
   - On completion: increment `workouts_completed`, update `calories_burned` (estimate)

3. **Schema**: Add `workout_sessions` table (optional) for per-session tracking

---

### Phase 4: ~~YouTube API~~ (Removed – using embedded curated videos)

Exercise videos are mapped from `lib/videos` by keyword; no YouTube API used.

---

### Phase 5: Shopping List & BigBasket ✓

**Goal**: Auto-generated grocery list from nutrition plan, link to BigBasket.

**Tasks**:

1. **Shopping List**:
   - Aggregate `ingredients` from all meals in active nutrition plan
   - Dedupe, group by category
   - New component: `ShoppingListView`

2. **BigBasket Integration**:
   - BigBasket does not have a public API; use deep link or search URL
   - `https://www.bigbasket.com/ps/?q={ingredient}` or similar
   - "Add to Basket" opens BigBasket in new tab with search query

---

### Phase 6: ~~Google Calendar~~ (Removed)

Not used in current implementation.

---

### Phase 7: Charity (Dummy Display)

**Goal**: Convert calories burned, goals, achievements into virtual charitable contributions.

**Tasks**:

1. **Charity Logic**:
   - Define rules: e.g., 100 calories = 1 point, workout completed = 5 points
   - On workout completion / achievement earn: insert/update `achievements` with `charity_points`
   - Aggregate total points per user

2. **UI**:
   - "Community Impact" or "Charity Contribution" widget on Dashboard
   - Progress bar / total points
   - Optional: partner charity display

---

### Phase 8: Testing & Polish (Week 6+)

**Tasks**:

1. **API Testing**: Postman/Thunder Client for all new routes
2. **E2E Flows**: Generate workout → complete workout → see progress
3. **Error Handling**: Graceful fallbacks for API failures
4. **Responsive UI**: Ensure all new pages work on mobile

---

## 4. Environment Variables Required

Add to `.env` (and `.env.local.example`):

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=

# Optional
SPOONACULAR_API_KEY=      # For enhanced nutrition data (Phase 2)
```

---

## 5. API Routes to Create

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/workouts/generate` | POST | AI-generated 7-day workout plan |
| `/api/nutrition/generate` | POST | AI-generated 7-day meal plan |
| `/api/youtube/search` | GET | Search exercise videos (or internal only) |
| `/api/calendar/connect` | GET | OAuth redirect for Google Calendar |
| `/api/calendar/sync` | POST | Sync plan to calendar |
| `/api/workouts/complete` | POST | Mark workout/day as complete, update progress |

---

## 6. Database Migrations (If Needed)

- `user_calendar_tokens`: store Google OAuth tokens (if not using Supabase auth integrations)
- `workout_sessions`: optional, for granular session tracking
- `meal_plan_days` or similar: if 7-day structure needs explicit day-level table (current `meals` may suffice with `day_of_week` or date)

---

## 7. Scenario Validation (from PDF)

| Scenario | Validation |
|----------|------------|
| **1. Personalized Workout Plan** | User selects goal, home/gym, 30 min/day → AI generates 7-day plan with warmups, exercises, YouTube links |
| **2. AI Nutrition & Meal Plan** | User sets allergies (peanuts, lactose), 1800 cal, vegetarian → 7-day Indian meal plan with macros |
| **3. Real-Time AROMI Coaching** | User says "I am traveling for 4 days" → AROMI adjusts plan to travel-friendly exercises, local meal tips |

---

## 8. Recommended Implementation Order

1. **Phase 1** (AI Workouts) – Highest user value
2. **Phase 2** (AI Nutrition) – Core differentiator
3. **Phase 3** (Exercise Player) – Completes workout loop
4. **Phase 4** (YouTube API) – Improves workout quality
5. **Phase 5** (Shopping List) – Enhances nutrition UX
6. **Phase 7** (Charity) – Motivation layer
7. **Phase 6** (Calendar) – More complex, OAuth required

---

## 9. Risk & Mitigations

| Risk | Mitigation |
|------|------------|
| Groq rate limits | Implement retry, cache plans, consider fallback model |
| Spoonacular free tier limits | Cache recipes, optimize calls, consider paid tier |
| YouTube API quota | Cache video IDs, batch searches |
| Google OAuth complexity | Use Supabase Auth Google provider if possible; else dedicated OAuth flow |

---

*Document version: 1.0 | Based on AroMi_doc.docx PDF | Generated for v0-project-credit-analysis*
