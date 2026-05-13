-- 1. opportunities table (covers internships, grants, competitions, volunteer, study_abroad, research)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('internship','grant','competition','volunteer','study_abroad','research')),
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  category TEXT,
  description TEXT NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  deadline DATE,
  application_link TEXT,
  eligibility TEXT,
  benefits TEXT,
  duration TEXT,
  stipend TEXT,
  amount TEXT,
  prize TEXT,
  destination_country TEXT,
  commitment_hours TEXT,
  research_field TEXT,
  team_size TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','draft')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'other' CHECK (event_type IN ('deadline','webinar','career_fair','campus_event','workshop','other')),
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  organizer TEXT,
  registration_link TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','past','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. point_transactions
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id),
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. email_campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  preview_text TEXT,
  body TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all','students','graduates','professionals','newsletter_only')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sent','failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Alter profiles for new features
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"new_jobs":true,"new_scholarships":true,"new_trainings":true,"new_opportunities":true,"campus_updates":true,"events":true,"newsletter":true}'::jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opp_type ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opp_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opp_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_pt_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ref_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_content ON analytics_events(content_type, content_id);

-- RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opp_public_read" ON opportunities FOR SELECT TO public USING (status = 'active');
CREATE POLICY "opp_admin_all" ON opportunities FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "events_public_read" ON events FOR SELECT TO public USING (status IN ('upcoming','ongoing'));
CREATE POLICY "events_admin_all" ON events FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "pt_user_read" ON point_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "pt_insert" ON point_transactions FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "ref_user_read" ON referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());
CREATE POLICY "ref_insert" ON referrals FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "ref_insert_auth" ON referrals FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "analytics_insert" ON analytics_events FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "analytics_insert_auth" ON analytics_events FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "analytics_admin_read" ON analytics_events FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "campaigns_admin_all" ON email_campaigns FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
