-- ============================================================
-- StarzLink Advanced Features Migration
-- Skill Gap, Match Score, Essay Helper, Activity, Ads,
-- Portfolio, Skills Assessment, Reviews, Alerts, Assistance, WhatsApp
-- ============================================================

-- 1. Skill Gap Analyses
CREATE TABLE IF NOT EXISTS public.skill_gap_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  opportunity_type TEXT NOT NULL DEFAULT 'job',
  opportunity_title TEXT,
  user_skills TEXT[],
  required_skills TEXT[],
  missing_skills TEXT[],
  match_percentage INTEGER DEFAULT 0,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Opportunity Match Scores
CREATE TABLE IF NOT EXISTS public.opportunity_match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  opportunity_type TEXT NOT NULL DEFAULT 'job',
  score INTEGER DEFAULT 0,
  label TEXT DEFAULT 'Low Match',
  breakdown JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id, opportunity_type)
);

-- 3. Essay Drafts
CREATE TABLE IF NOT EXISTS public.essay_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  essay_type TEXT DEFAULT 'scholarship_essay',
  content TEXT,
  prompt TEXT,
  tone TEXT DEFAULT 'professional',
  word_count INTEGER DEFAULT 0,
  target_word_count INTEGER DEFAULT 500,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scholarship Assistance Requests
CREATE TABLE IF NOT EXISTS public.scholarship_assistance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  scholarship_name TEXT NOT NULL,
  scholarship_url TEXT,
  package TEXT NOT NULL DEFAULT 'basic_review',
  documents JSONB DEFAULT '[]',
  notes TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  payment_reference TEXT,
  assigned_expert TEXT,
  expert_notes TEXT,
  admin_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Activity Events
CREATE TABLE IF NOT EXISTS public.user_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  opportunity_id TEXT,
  opportunity_type TEXT,
  opportunity_title TEXT,
  keyword TEXT,
  category TEXT,
  country TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON public.user_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_created ON public.user_activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_opp ON public.user_activity_events(opportunity_id);

-- 6. Ads
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  business_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL DEFAULT 'homepage_banner',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ad Impressions
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  session_id TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Ad Clicks
CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  session_id TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE,
  headline TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  linkedin TEXT,
  github TEXT,
  twitter TEXT,
  is_public BOOLEAN DEFAULT true,
  template TEXT DEFAULT 'default',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Portfolio Projects
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  tags TEXT[],
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Portfolio Certifications
CREATE TABLE IF NOT EXISTS public.portfolio_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_url TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Portfolio Awards
CREATE TABLE IF NOT EXISTS public.portfolio_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT,
  date DATE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Skill Assessments (Tests)
CREATE TABLE IF NOT EXISTS public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  pass_mark INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Skill Questions
CREATE TABLE IF NOT EXISTS public.skill_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.skill_assessments(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 15. Skill Results
CREATE TABLE IF NOT EXISTS public.skill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.skill_assessments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '[]',
  time_taken_seconds INTEGER,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, assessment_id, attempt_number)
);

-- 16. Verified Skills
CREATE TABLE IF NOT EXISTS public.verified_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  assessment_id UUID REFERENCES public.skill_assessments(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- 17. Opportunity Reviews
CREATE TABLE IF NOT EXISTS public.opportunity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  opportunity_type TEXT NOT NULL,
  opportunity_title TEXT,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  process_rating INTEGER CHECK (process_rating BETWEEN 1 AND 5),
  response_rating INTEGER CHECK (response_rating BETWEEN 1 AND 5),
  trust_rating INTEGER CHECK (trust_rating BETWEEN 1 AND 5),
  review_text TEXT,
  is_verified_applicant BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id, opportunity_type)
);
CREATE INDEX IF NOT EXISTS idx_reviews_opportunity ON public.opportunity_reviews(opportunity_id, opportunity_type);

-- 18. Deadline Alerts
CREATE TABLE IF NOT EXISTS public.deadline_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  opportunity_type TEXT NOT NULL,
  opportunity_title TEXT,
  deadline DATE,
  alert_days INTEGER[] DEFAULT '{7,3,1}',
  last_sent_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id, opportunity_type)
);

-- 19. Notification Logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in_app',
  title TEXT,
  body TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. WhatsApp Bot Messages
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_number TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_in TEXT NOT NULL,
  message_out TEXT,
  intent TEXT,
  results_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_from ON public.whatsapp_bot_messages(from_number);

-- ── Seed skill assessments ──────────────────────────────────────────────────
INSERT INTO public.skill_assessments (skill_name, category, description, pass_mark, time_limit_minutes) VALUES
('Microsoft Excel', 'Technology', 'Test your knowledge of Excel formulas, pivot tables, and data analysis', 70, 10),
('Public Speaking', 'Communication', 'Assess your understanding of effective public speaking techniques', 70, 8),
('Professional Writing', 'Communication', 'Evaluate your business writing and communication skills', 70, 10),
('Data Analysis', 'Technology', 'Test your data analysis concepts and methodology knowledge', 70, 12),
('Digital Marketing', 'Marketing', 'Assess your knowledge of SEO, social media, and digital strategy', 70, 10),
('Project Management', 'Management', 'Evaluate project planning, execution, and monitoring skills', 70, 12),
('Customer Service', 'Business', 'Test your customer service principles and best practices', 70, 8),
('Web Development', 'Technology', 'Assess your HTML, CSS, JavaScript, and web concepts knowledge', 70, 15),
('Graphic Design', 'Creative', 'Evaluate your design principles, color theory, and tools knowledge', 70, 10),
('Communication Skills', 'Soft Skills', 'Test interpersonal and workplace communication skills', 70, 8)
ON CONFLICT (skill_name) DO NOTHING;

-- ── Seed sample questions for Excel ────────────────────────────────────────
DO $$
DECLARE assessment_id UUID;
BEGIN
  SELECT id INTO assessment_id FROM public.skill_assessments WHERE skill_name = 'Microsoft Excel';
  IF assessment_id IS NOT NULL THEN
    INSERT INTO public.skill_questions (assessment_id, question, options, correct_answer, explanation, sort_order) VALUES
    (assessment_id, 'Which Excel function calculates the sum of a range of cells?', '["COUNT","SUM","AVERAGE","MAX"]', 1, 'SUM adds all values in a specified range', 1),
    (assessment_id, 'What does VLOOKUP stand for?', '["Variable Lookup","Vertical Lookup","Value Lookup","Visual Lookup"]', 1, 'VLOOKUP searches for a value in the first column of a table vertically', 2),
    (assessment_id, 'Which shortcut creates a new line within a cell in Excel?', '["Enter","Shift+Enter","Alt+Enter","Ctrl+Enter"]', 2, 'Alt+Enter inserts a line break within a cell', 3),
    (assessment_id, 'What is a Pivot Table used for?', '["Creating charts","Summarizing large datasets","Formatting cells","Writing macros"]', 1, 'Pivot Tables help summarize and analyze large amounts of data quickly', 4),
    (assessment_id, 'Which function returns the number of cells containing numbers?', '["SUM","COUNT","COUNTA","COUNTIF"]', 1, 'COUNT returns the count of cells that contain numbers', 5)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
