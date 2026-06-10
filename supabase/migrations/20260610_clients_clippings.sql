-- ─────────────────────────────────────────────────────────────────────────────
-- Clippings de /casos-de-exito — tablas clients + clippings
--
-- CÓMO EJECUTAR: copiar TODO este archivo y pegarlo en el SQL Editor del
-- dashboard de Supabase (https://supabase.com/dashboard → proyecto → SQL Editor
-- → New query → pegar → Run). Es idempotente: se puede correr más de una vez.
--
-- Después correr el seed:  npx tsx scripts/seed-clippings.ts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  order_position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read clients publicly" ON clients;
CREATE POLICY "Read clients publicly"
  ON clients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users edit clients" ON clients;
CREATE POLICY "Auth users edit clients"
  ON clients FOR ALL USING (auth.role() = 'authenticated');

-- `format` no estaba en el diseño original pero es necesario: define el color
-- del borde de cada card en la página pública (Digital/Gráfico/TV/Radio/Streaming).
CREATE TABLE IF NOT EXISTS clippings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id)
    ON DELETE CASCADE,
  medium TEXT NOT NULL,
  title TEXT NOT NULL,
  published_at DATE NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN
    ('local','nacional','regional','internacional')),
  format TEXT NOT NULL DEFAULT 'Digital' CHECK (format IN
    ('Digital','Gráfico','TV','Radio','Streaming')),
  url TEXT NOT NULL,
  order_position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_clippings_client
  ON clippings(client_id, published_at DESC);

ALTER TABLE clippings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read clippings publicly" ON clippings;
CREATE POLICY "Read clippings publicly"
  ON clippings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users edit clippings" ON clippings;
CREATE POLICY "Auth users edit clippings"
  ON clippings FOR ALL USING (auth.role() = 'authenticated');
