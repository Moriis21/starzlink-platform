-- Migration: Add partners table to StarzLink
-- Run this in your InsForge SQL editor

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'university' CHECK (type IN ('university', 'organization', 'ngo', 'government', 'corporate')),
  scope TEXT NOT NULL DEFAULT 'local' CHECK (scope IN ('local', 'international')),
  location TEXT,
  country TEXT NOT NULL DEFAULT 'Liberia',
  founded TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  color TEXT NOT NULL DEFAULT '#1a3c8f',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Public can read active partners
CREATE POLICY "partners_public_read" ON partners
  FOR SELECT TO public
  USING (is_active = TRUE);

-- Authenticated admins can do everything
CREATE POLICY "partners_admin_all" ON partners
  FOR ALL TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_partners_scope ON partners(scope);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);

-- Seed: Liberian Universities
INSERT INTO partners (name, abbreviation, type, scope, location, country, founded, website, description, color, is_active) VALUES
  ('University of Liberia', 'UL', 'university', 'local', 'Monrovia', 'Liberia', '1862', 'https://www.ul.edu.lr', 'The oldest and largest public university in Liberia, offering undergraduate and graduate programs across multiple disciplines.', '#1a3c8f', TRUE),
  ('Cuttington University', 'CU', 'university', 'local', 'Suakoko, Bong County', 'Liberia', '1889', 'https://www.cuttington.org', 'A private Episcopal university founded in 1889, one of the oldest private universities in sub-Saharan Africa.', '#7c3aed', TRUE),
  ('African Methodist Episcopal University', 'AMEU', 'university', 'local', 'Monrovia', 'Liberia', '1997', 'https://ameu.edu.lr', 'A private university with a strong focus on liberal arts and professional education across Liberia.', '#059669', TRUE),
  ('United Methodist University', 'UMU', 'university', 'local', 'Monrovia', 'Liberia', '1996', 'https://www.umu.edu.lr', 'A private university affiliated with the United Methodist Church, providing quality education across various fields.', '#d97706', TRUE),
  ('Tubman University', 'TU', 'university', 'local', 'Harper, Maryland County', 'Liberia', '2009', 'https://www.tubmanu.edu.lr', 'A public university serving the south-eastern region of Liberia with degree programs in education, business and sciences.', '#0891b2', TRUE),
  ('Booker Washington Institute', 'BWI', 'university', 'local', 'Kakata, Margibi County', 'Liberia', '1929', 'https://www.bwi.edu.lr', 'A technical and vocational institution providing hands-on training in technical trades and agriculture.', '#16a34a', TRUE),
  ('Stella Maris Polytechnic', 'SMP', 'university', 'local', 'Monrovia', 'Liberia', '1977', 'https://www.stellamarispolytechnic.edu.lr', 'A Catholic polytechnic institution offering technical and professional education programs.', '#dc2626', TRUE),
  ('Grand Kru Technical Community College', 'GKTCC', 'university', 'local', 'Barclayville, Grand Kru County', 'Liberia', '2011', NULL, 'A technical community college serving the Grand Kru County region with vocational and technical programs.', '#9333ea', TRUE),
  ('Bong Mines Technical Community College', 'BMTCC', 'university', 'local', 'Bong Mines, Bong County', 'Liberia', '2012', NULL, 'Technical community college offering vocational training and associate degree programs in Bong County.', '#0369a1', TRUE),
  ('Mother Patern College of Health Sciences', 'MPCHS', 'university', 'local', 'Monrovia', 'Liberia', '1971', NULL, 'A Catholic institution specializing in health sciences, nursing, and public health education.', '#be185d', TRUE),
  ('A.M.E. Zion University College', 'AMEZUC', 'university', 'local', 'Monrovia', 'Liberia', '2000', NULL, 'An African Methodist Episcopal Zion university offering undergraduate programs in arts, sciences and education.', '#b45309', TRUE),
  ('Riva Kaikia College', 'RKC', 'university', 'local', 'Monrovia', 'Liberia', '2005', NULL, 'A private college providing programs in business administration, education and information technology.', '#0f766e', TRUE)
ON CONFLICT DO NOTHING;
