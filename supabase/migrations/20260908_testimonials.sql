-- ─────────────────────────────────────────────────────────────────────────────
-- Reseñas con moderación — tabla `testimonials`.
--
-- CÓMO EJECUTAR: copiar TODO este archivo y pegarlo en el SQL Editor del
-- dashboard de Supabase (https://supabase.com/dashboard → proyecto → SQL Editor
-- → New query → pegar → Run). Es idempotente: se puede correr más de una vez.
--
-- FLUJO DE ESTADOS
--   pending_verification  → recién enviada; falta que el autor confirme el mail
--   pending_review        → mail confirmado; espera moderación de Marian
--   published             → visible en el sitio público
--   rejected              → descartada (moderation_note guarda el motivo, interno)
--
-- ESCRITURAS: ninguna. No hay policy de INSERT ni de UPDATE para anon.
-- Todo lo que escribe pasa por route handlers con createAdminClient() y
-- SUPABASE_SERVICE_ROLE_KEY (el service role bypassea RLS), igual que el resto
-- del proyecto.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Quién reseña: una marca/cliente o un periodista.
  reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('marca', 'periodista')),

  -- Datos del autor (públicos, se muestran en la tarjeta).
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  -- Marca u organización; si es periodista, el medio.
  author_brand TEXT NOT NULL,
  -- LinkedIn, web de la marca o perfil en el medio.
  author_url TEXT NOT NULL,

  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,

  -- NUNCA se muestra en público. Sirve para el doble opt-in y para contactar.
  author_email TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('pending_verification', 'pending_review', 'published', 'rejected')),

  -- Moderación (uso interno).
  moderation_note TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by TEXT,

  -- Verificación por mail.
  verification_token UUID NOT NULL DEFAULT gen_random_uuid(),
  verification_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  verified_at TIMESTAMPTZ,

  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Antiabuso. El IP nunca se guarda en claro: se hashea con sha256(ip + salt).
  ip_hash TEXT,
  user_agent TEXT
);

-- ─── Índices ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_testimonials_status
  ON testimonials(status);

CREATE INDEX IF NOT EXISTS idx_testimonials_published_at
  ON testimonials(published_at DESC);

-- UNIQUE y no un índice común: el token es la clave de búsqueda del link de
-- verificación; una colisión verificaría la reseña equivocada.
CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_verification_token
  ON testimonials(verification_token);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- ÚNICA policy: lectura pública de las publicadas. Sin INSERT, sin UPDATE,
-- sin DELETE para anon ni para authenticated.
DROP POLICY IF EXISTS "Read published testimonials" ON testimonials;
CREATE POLICY "Read published testimonials"
  ON testimonials FOR SELECT
  USING (status = 'published');

-- ─── Permisos por columna ────────────────────────────────────────────────────
-- La policy de arriba deja pasar la FILA entera. Como la anon key es pública
-- (viaja al navegador), sin esto cualquiera podría pedir author_email, ip_hash
-- o verification_token de las reseñas publicadas. Los grants por columna
-- limitan qué se puede leer aunque la fila sea visible.
REVOKE SELECT ON testimonials FROM anon, authenticated;
GRANT SELECT (
  id,
  reviewer_type,
  author_name,
  author_role,
  author_brand,
  author_url,
  rating,
  body,
  status,
  published_at,
  created_at
) ON testimonials TO anon, authenticated;
