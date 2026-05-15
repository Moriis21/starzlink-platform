-- Add expiry/visibility fields to all opportunity tables

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS expired_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS public_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS restored_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS extension_reason TEXT;

ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS expired_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS public_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS restored_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS extension_reason TEXT;

ALTER TABLE public.trainings
  ADD COLUMN IF NOT EXISTS expired_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS public_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS deadline      DATE,
  ADD COLUMN IF NOT EXISTS restored_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS extension_reason TEXT;

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS expired_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS public_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS restored_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS extension_reason TEXT;

-- All existing active records are publicly visible
UPDATE public.jobs         SET public_visible = TRUE WHERE public_visible IS NULL;
UPDATE public.scholarships SET public_visible = TRUE WHERE public_visible IS NULL;
UPDATE public.trainings    SET public_visible = TRUE WHERE public_visible IS NULL;
UPDATE public.opportunities SET public_visible = TRUE WHERE public_visible IS NULL;
