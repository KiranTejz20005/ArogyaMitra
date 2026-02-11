-- Extend health_assessments for comprehensive health assessment module
-- Adds columns for: age, gender, height, weight, fitness level/goal, workout preferences,
-- medical history, health conditions, injuries, allergies, medications, google_calendar_sync, status

ALTER TABLE public.health_assessments
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS fitness_level TEXT,
ADD COLUMN IF NOT EXISTS fitness_goal TEXT,
ADD COLUMN IF NOT EXISTS workout_preference TEXT,
ADD COLUMN IF NOT EXISTS workout_time_preference TEXT,
ADD COLUMN IF NOT EXISTS medical_history TEXT,
ADD COLUMN IF NOT EXISTS health_conditions_text TEXT,
ADD COLUMN IF NOT EXISTS injuries_text TEXT,
ADD COLUMN IF NOT EXISTS food_allergies TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_sync BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
