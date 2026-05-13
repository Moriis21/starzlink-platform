-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','monthly','yearly')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','inactive','expired','cancelled')),
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  started_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV Uploads
CREATE TABLE IF NOT EXISTS cv_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT,
  file_url TEXT,
  extracted_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','analyzed','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CV Analysis
CREATE TABLE IF NOT EXISTS cv_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES cv_uploads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER,
  ats_score INTEGER,
  strengths JSONB,
  weak_areas JSONB,
  missing_keywords JSONB,
  formatting_issues JSONB,
  grammar_issues JSONB,
  section_review JSONB,
  recommended_job_titles JSONB,
  career_advice TEXT,
  raw_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Improved CVs
CREATE TABLE IF NOT EXISTS improved_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES cv_uploads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  improved_content TEXT NOT NULL,
  improvement_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  questions JSONB,
  answers JSONB,
  tips JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Letters
CREATE TABLE IF NOT EXISTS application_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  letter_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LinkedIn Reviews
CREATE TABLE IF NOT EXISTS linkedin_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_headline TEXT,
  headline_suggestions JSONB,
  about_rewrite TEXT,
  skills_suggestions JSONB,
  keyword_suggestions JSONB,
  profile_tips JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cv_uploads_user ON cv_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_analysis_user ON cv_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE improved_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_reviews ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY sub_own ON subscriptions USING (user_id = auth.uid());
CREATE POLICY cv_up_own ON cv_uploads USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY cv_an_own ON cv_analysis USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY imp_cv_own ON improved_cvs USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY int_own ON interview_sessions USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY app_own ON application_letters USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY lin_own ON linkedin_reviews USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
