-- Audios de clippings (2026-06-28)
-- Idempotente. Pegar en Supabase Dashboard → SQL Editor si la conexión directa
-- de Postgres no está disponible (POSTGRES_URL_NON_POOLING redactada).
--
-- El bucket público "clipping-audios" se crea aparte con
-- `npx tsx scripts/setup-clipping-audios.ts` (vía service role).

ALTER TABLE clippings ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE clippings ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER;

-- Algunos clippings (radios sin web) solo tienen audio.
ALTER TABLE clippings ALTER COLUMN url DROP NOT NULL;

-- Un clipping debe tener al menos una fuente de contenido: url O audio_url.
ALTER TABLE clippings DROP CONSTRAINT IF EXISTS clipping_has_content;
ALTER TABLE clippings
  ADD CONSTRAINT clipping_has_content
  CHECK (url IS NOT NULL OR audio_url IS NOT NULL);
