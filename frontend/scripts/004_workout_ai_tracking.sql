-- AI workout plan storage and completion tracking
-- Extend workout_plans for AI-generated plans
ALTER TABLE public.workout_plans
ADD COLUMN IF NOT EXISTS plan_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS weekly_summary TEXT,
ADD COLUMN IF NOT EXISTS tips TEXT[] DEFAULT '{}';

-- Exercise completions for tracking progress
CREATE TABLE IF NOT EXISTS public.exercise_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  day_number INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exercise_completions_select_own" ON public.exercise_completions;
DROP POLICY IF EXISTS "exercise_completions_insert_own" ON public.exercise_completions;
DROP POLICY IF EXISTS "exercise_completions_update_own" ON public.exercise_completions;
CREATE POLICY "exercise_completions_select_own" ON public.exercise_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exercise_completions_insert_own" ON public.exercise_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercise_completions_update_own" ON public.exercise_completions FOR UPDATE USING (auth.uid() = user_id);

-- Extend exercises for AI plan fields
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT,
ADD COLUMN IF NOT EXISTS day_number INTEGER,
ADD COLUMN IF NOT EXISTS reps_display TEXT,
ADD COLUMN IF NOT EXISTS warmup TEXT,
ADD COLUMN IF NOT EXISTS cooldown TEXT,
ADD COLUMN IF NOT EXISTS focus TEXT,
ADD COLUMN IF NOT EXISTS recommended_time TEXT,
ADD COLUMN IF NOT EXISTS total_duration INTEGER;

-- User workout stats (streak, total workouts)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS workout_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_workouts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_workout_date DATE;
