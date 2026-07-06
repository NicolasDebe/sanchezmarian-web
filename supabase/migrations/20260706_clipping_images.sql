-- Imagen por clipping (2026-07-06)
-- Idempotente. Pegar en Supabase Dashboard → SQL Editor si la conexión directa
-- de Postgres no está disponible (POSTGRES_URL_NON_POOLING redactada).
--
-- Una sola columna image_url: la llena el auto-completar con la imagen Open
-- Graph del enlace, o una imagen propia subida desde /admin. Si queda NULL,
-- la tarjeta se renderiza sin imagen (diseño histórico).
--
-- El bucket público "clipping-images" se crea aparte con
-- `npx tsx scripts/setup-clipping-images.ts` (vía service role).

ALTER TABLE clippings ADD COLUMN IF NOT EXISTS image_url TEXT;
