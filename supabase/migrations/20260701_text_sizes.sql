-- ─────────────────────────────────────────────────────────────────────────────
-- Tamaños de texto por campo — tabla text_sizes.
--
-- Permite que Marian agrande/achique un párrafo o título PUNTUAL desde /admin,
-- con tamaños PREDEFINIDOS (normal/grande/mas_grande/maximo), independientes
-- mobile/desktop. AISLADA a propósito: NO toca content_blocks, así el guardado
-- de contenido y el sitio público nunca se rompen por esta feature.
--
-- CÓMO EJECUTAR: pegar TODO en el SQL Editor del dashboard de Supabase → Run.
-- Idempotente.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS text_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  field TEXT NOT NULL,
  -- Clave de preset: normal | grande | mas_grande | maximo. NULL = normal.
  scale_mobile TEXT,
  scale_desktop TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  UNIQUE (page, section, field)
);

ALTER TABLE text_sizes ENABLE ROW LEVEL SECURITY;

-- Lectura pública: el sitio anónimo aplica los tamaños al renderizar.
DROP POLICY IF EXISTS "Read text_sizes publicly" ON text_sizes;
CREATE POLICY "Read text_sizes publicly"
  ON text_sizes FOR SELECT USING (true);

-- Escritura solo autenticados (admin).
DROP POLICY IF EXISTS "Auth users edit text_sizes" ON text_sizes;
CREATE POLICY "Auth users edit text_sizes"
  ON text_sizes FOR ALL USING (auth.role() = 'authenticated');
