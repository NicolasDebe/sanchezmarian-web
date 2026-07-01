-- ─────────────────────────────────────────────────────────────────────────────
-- Sección CONEXIONES del home — tabla connections (alianzas / disciplinas).
--
-- CÓMO EJECUTAR: copiar TODO este archivo y pegarlo en el SQL Editor del
-- dashboard de Supabase (https://supabase.com/dashboard → proyecto → SQL Editor
-- → New query → pegar → Run). Es idempotente: se puede correr más de una vez.
--
-- Después correr el seed:  npx tsx scripts/seed-connections.ts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connections_position
  ON connections(position ASC);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el sitio anónimo lista las conexiones activas).
DROP POLICY IF EXISTS "Read connections publicly" ON connections;
CREATE POLICY "Read connections publicly"
  ON connections FOR SELECT USING (true);

-- Escritura solo para usuarios autenticados (admin).
DROP POLICY IF EXISTS "Auth users edit connections" ON connections;
CREATE POLICY "Auth users edit connections"
  ON connections FOR ALL USING (auth.role() = 'authenticated');
