CREATE TABLE IF NOT EXISTS platform_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category TEXT NOT NULL CHECK (category IN ('opportunity_quality','application_experience','platform_usefulness','overall_satisfaction')),
  title TEXT,
  body TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_display_name TEXT NOT NULL,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('scholarship_won','internship_secured','job_hired','course_completed','letter_sent','cv_improved','other')),
  outcome_title TEXT NOT NULL,
  outcome_description TEXT NOT NULL,
  organization TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pr_category ON platform_reviews(category);
CREATE INDEX IF NOT EXISTS idx_pr_published ON platform_reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_ss_type ON success_stories(outcome_type);
CREATE INDEX IF NOT EXISTS idx_ss_published ON success_stories(is_published);

ALTER TABLE platform_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY pr_public_read ON platform_reviews FOR SELECT TO public USING (is_published = TRUE);
CREATE POLICY pr_own_write ON platform_reviews FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY pr_admin_all ON platform_reviews FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY ss_public_read ON success_stories FOR SELECT TO public USING (is_published = TRUE);
CREATE POLICY ss_own_write ON success_stories FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY ss_admin_all ON success_stories FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
