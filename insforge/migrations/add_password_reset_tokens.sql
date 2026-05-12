-- Migration: password_reset_tokens for OTP-based password reset

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_prt_code  ON password_reset_tokens(code);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated users) can INSERT a token (generated on forgot-password page)
CREATE POLICY prt_insert_anon ON password_reset_tokens FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY prt_insert_auth ON password_reset_tokens FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Only authenticated (or service role via edge function) can read/update
CREATE POLICY prt_select ON password_reset_tokens FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY prt_update ON password_reset_tokens FOR UPDATE TO authenticated USING (TRUE);
