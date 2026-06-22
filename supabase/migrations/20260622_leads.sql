-- Tabla `leads`: captura simple de mails (nombre + email), sin source ni baja.
-- Idempotente: se puede pegar en el SQL Editor del dashboard o correr con
-- scripts/setup-leads-table.ts (si hay POSTGRES_URL_NON_POOLING).
-- RLS: insert público (lo usa el form), lectura solo autenticados (el admin
-- lee con el service role, que igualmente bypassea RLS).

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert público leads" ON leads;
CREATE POLICY "Insert público leads"
  ON leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Solo auth pueden leer leads" ON leads;
CREATE POLICY "Solo auth pueden leer leads"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');
