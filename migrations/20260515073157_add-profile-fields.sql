-- Add missing profile fields to the profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email                TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number      TEXT,
  ADD COLUMN IF NOT EXISTS country              TEXT,
  ADD COLUMN IF NOT EXISTS county_state         TEXT,
  ADD COLUMN IF NOT EXISTS city_community       TEXT,
  ADD COLUMN IF NOT EXISTS current_location     TEXT,
  ADD COLUMN IF NOT EXISTS address_description  TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language   TEXT,
  ADD COLUMN IF NOT EXISTS occupation           TEXT,
  ADD COLUMN IF NOT EXISTS education_level      TEXT,
  ADD COLUMN IF NOT EXISTS institution_workplace TEXT,
  ADD COLUMN IF NOT EXISTS area_of_interest     TEXT,
  ADD COLUMN IF NOT EXISTS career_goal          TEXT,
  ADD COLUMN IF NOT EXISTS bio                  TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url           TEXT,
  ADD COLUMN IF NOT EXISTS profile_completed    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS account_status       TEXT DEFAULT 'active';

UPDATE public.profiles SET profile_completed = FALSE WHERE profile_completed IS NULL;
