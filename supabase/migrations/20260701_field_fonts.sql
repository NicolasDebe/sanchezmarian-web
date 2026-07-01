-- ─────────────────────────────────────────────────────────────────────────────
-- Fuente por campo — tabla field_fonts.
--
-- Permite que Marian cambie la TIPOGRAFÍA de un título o párrafo PUNTUAL desde
-- /admin, eligiendo SOLO entre las fuentes que ya usa el sitio (Playfair / DM
-- Sans / DM Mono) o dejando la original del diseño. AISLADA a propósito: NO toca
-- content_blocks ni text_sizes, así el contenido, los tamaños y el sitio público
-- nunca se rompen por esta feature.
--
-- CÓMO EJECUTAR: pegar TODO en el SQL Editor del dashboard de Supabase → Run.
-- Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS field_fonts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  field TEXT NOT NULL,
  -- Clave de FIELD_FONTS: default | playfair | sans | mono. NULL = default.
  font TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  UNIQUE (page, section, field)
);

ALTER TABLE field_fonts ENABLE ROW LEVEL SECURITY;

-- Lectura pública: el sitio anónimo aplica las fuentes al renderizar.
DROP POLICY IF EXISTS "Read field_fonts publicly" ON field_fonts;
CREATE POLICY "Read field_fonts publicly"
  ON field_fonts FOR SELECT USING (true);

-- Escritura solo autenticados (admin).
DROP POLICY IF EXISTS "Auth users edit field_fonts" ON field_fonts;
CREATE POLICY "Auth users edit field_fonts"
  ON field_fonts FOR ALL USING (auth.role() = 'authenticated');
