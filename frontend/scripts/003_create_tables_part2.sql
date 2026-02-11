-- Nutrition plans
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  daily_calories INTEGER,
  protein_grams INTEGER,
  carbs_grams INTEGER,
  fat_grams INTEGER,
  dietary_type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "nutrition_plans_select_own" ON public.nutrition_plans;
DROP POLICY IF EXISTS "nutrition_plans_insert_own" ON public.nutrition_plans;
DROP POLICY IF EXISTS "nutrition_plans_update_own" ON public.nutrition_plans;
DROP POLICY IF EXISTS "nutrition_plans_delete_own" ON public.nutrition_plans;
CREATE POLICY "nutrition_plans_select_own" ON public.nutrition_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "nutrition_plans_insert_own" ON public.nutrition_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "nutrition_plans_update_own" ON public.nutrition_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "nutrition_plans_delete_own" ON public.nutrition_plans FOR DELETE USING (auth.uid() = user_id);

-- Meals within nutrition plans
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrition_plan_id UUID NOT NULL REFERENCES public.nutrition_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  calories INTEGER,
  protein_grams INTEGER,
  carbs_grams INTEGER,
  fat_grams INTEGER,
  ingredients JSONB DEFAULT '[]',
  recipe_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "meals_select_own" ON public.meals;
DROP POLICY IF EXISTS "meals_insert_own" ON public.meals;
DROP POLICY IF EXISTS "meals_update_own" ON public.meals;
DROP POLICY IF EXISTS "meals_delete_own" ON public.meals;
CREATE POLICY "meals_select_own" ON public.meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meals_insert_own" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meals_update_own" ON public.meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meals_delete_own" ON public.meals FOR DELETE USING (auth.uid() = user_id);

-- Progress records
CREATE TABLE IF NOT EXISTS public.progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC,
  body_fat_pct NUMERIC,
  muscle_mass_kg NUMERIC,
  waist_cm NUMERIC,
  chest_cm NUMERIC,
  arm_cm NUMERIC,
  workouts_completed INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  notes TEXT,
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "progress_select_own" ON public.progress_records;
DROP POLICY IF EXISTS "progress_insert_own" ON public.progress_records;
DROP POLICY IF EXISTS "progress_update_own" ON public.progress_records;
DROP POLICY IF EXISTS "progress_delete_own" ON public.progress_records;
CREATE POLICY "progress_select_own" ON public.progress_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own" ON public.progress_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update_own" ON public.progress_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "progress_delete_own" ON public.progress_records FOR DELETE USING (auth.uid() = user_id);

-- Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  charity_points INTEGER DEFAULT 0
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "achievements_select_own" ON public.achievements;
DROP POLICY IF EXISTS "achievements_insert_own" ON public.achievements;
CREATE POLICY "achievements_select_own" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert_own" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat sessions for AROMI AI
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_sessions_select_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update_own" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete_own" ON public.chat_sessions;
CREATE POLICY "chat_sessions_select_own" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions_insert_own" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_sessions_update_own" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions_delete_own" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_own" ON public.chat_messages;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
