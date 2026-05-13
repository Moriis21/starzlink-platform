-- Admin Pro Grants
CREATE TABLE IF NOT EXISTS admin_pro_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by_admin_id UUID REFERENCES auth.users(id),
  plan_type TEXT DEFAULT 'pro_manual' CHECK (plan_type IN ('pro_manual','pro_lifetime')),
  access_type TEXT DEFAULT 'manual' CHECK (access_type IN ('manual','lifetime')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pro Access Audit Logs
CREATE TABLE IF NOT EXISTS pro_access_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('grant','revoke','extend','modify')),
  old_plan TEXT,
  new_plan TEXT,
  old_expiry_date TIMESTAMPTZ,
  new_expiry_date TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Credits
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits_balance INTEGER DEFAULT 5,
  credits_used INTEGER DEFAULT 0,
  last_credit_use_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('free_signup_credit','cv_analysis_usage','admin_credit_adjustment','refund')),
  credits_amount INTEGER NOT NULL,
  reason TEXT,
  related_cv_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_pro_grants_user ON admin_pro_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_pro_grants_active ON admin_pro_grants(is_active);
CREATE INDEX IF NOT EXISTS idx_pro_audit_user ON pro_access_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON credit_transactions(user_id);

-- RLS
ALTER TABLE admin_pro_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_access_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY apg_admin_all ON admin_pro_grants FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY pal_admin_all ON pro_access_audit_logs FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY uc_own ON user_credits FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY uc_admin ON user_credits FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY ct_own ON credit_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY ct_insert ON credit_transactions FOR INSERT TO authenticated WITH CHECK (TRUE);
