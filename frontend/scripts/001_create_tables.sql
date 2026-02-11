-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  fitness_goal TEXT,
  activity_level TEXT,
  dietary_preference TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Health assessments
CREATE TABLE IF NOT EXISTS public.health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bmi NUMERIC,
  bmi_category TEXT,
  health_conditions TEXT[] DEFAULT '{}',
  injuries TEXT[] DEFAULT '{}',
  sleep_hours NUMERIC,
  stress_level TEXT,
  water_intake_liters NUMERIC,
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  ai_recommendations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assessments_select_own" ON public.health_assessments;
DROP POLICY IF EXISTS "assessments_insert_own" ON public.health_assessments;
DROP POLICY IF EXISTS "assessments_update_own" ON public.health_assessments;
DROP POLICY IF EXISTS "assessments_delete_own" ON public.health_assessments;
CREATE POLICY "assessments_select_own" ON public.health_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "assessments_insert_own" ON public.health_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assessments_update_own" ON public.health_assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "assessments_delete_own" ON public.health_assessments FOR DELETE USING (auth.uid() = user_id);

-- Workout plans
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  duration_weeks INTEGER,
  goal TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workout_plans_select_own" ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_insert_own" ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_update_own" ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_delete_own" ON public.workout_plans;
CREATE POLICY "workout_plans_select_own" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_plans_insert_own" ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_plans_update_own" ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_plans_delete_own" ON public.workout_plans FOR DELETE USING (auth.uid() = user_id);

-- Exercises within workout plans
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT,
  sets INTEGER,
  reps INTEGER,
  duration_minutes INTEGER,
  rest_seconds INTEGER,
  youtube_video_id TEXT,
  day_of_week TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exercises_select_own" ON public.exercises;
DROP POLICY IF EXISTS "exercises_insert_own" ON public.exercises;
DROP POLICY IF EXISTS "exercises_update_own" ON public.exercises;
DROP POLICY IF EXISTS "exercises_delete_own" ON public.exercises;
CREATE POLICY "exercises_select_own" ON public.exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exercises_insert_own" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises_update_own" ON public.exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exercises_delete_own" ON public.exercises FOR DELETE USING (auth.uid() = user_id);
