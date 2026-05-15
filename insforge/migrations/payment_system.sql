CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription','resource_purchase')),
  item_type TEXT NOT NULL CHECK (item_type IN ('pro_monthly','pro_yearly','template','ebook','digital_resource','course','other')),
  item_id TEXT,
  plan_type TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('orange_money','mobile_money','credit_card','paypal','bank_transfer')),
  transaction_reference TEXT,
  proof_file_url TEXT,
  card_last4 TEXT,
  paypal_email TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (payment_status IN ('pending_verification','pending_admin_approval','verified','failed','rejected')),
  admin_approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (admin_approval_status IN ('pending','approved','rejected')),
  approved_by_admin_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by_admin_id UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  user_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_payment_id UUID REFERENCES payments(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  payment_id UUID REFERENCES payments(id),
  access_status TEXT NOT NULL DEFAULT 'pending' CHECK (access_status IN ('locked','pending','unlocked','revoked')),
  approved_by_admin_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_approval ON payments(admin_approval_status);
CREATE INDEX IF NOT EXISTS idx_admin_notif_admin ON admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_resource_pur_user ON resource_purchases(user_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY pay_own_read ON payments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY pay_own_insert ON payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY pay_admin_all ON payments FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY notif_admin ON admin_notifications FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY rp_own ON resource_purchases FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY rp_insert ON resource_purchases FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY rp_admin ON resource_purchases FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
