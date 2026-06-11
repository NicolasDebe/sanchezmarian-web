-- ─────────────────────────────────────────────────────────────────────────────
-- Campañas: estandarizar status a draft / active / finished
--
-- Cómo correrla: copiar TODO este archivo y pegarlo en el SQL Editor del
-- dashboard de Supabase (https://supabase.com/dashboard → SQL Editor → Run).
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Hasta que no se corra, el admin puede crear/editar campañas Activas y
-- Finalizadas, pero NO borradores (la base los rechaza).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Migrar los valores legacy en español a los canónicos
UPDATE campaigns SET status = 'active'   WHERE status = 'ACTIVA';
UPDATE campaigns SET status = 'finished' WHERE status = 'FINALIZADA';

-- 2. Extender el CHECK constraint para aceptar borradores
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('draft', 'active', 'finished'));

-- 3. Las campañas nuevas nacen como borrador
ALTER TABLE campaigns ALTER COLUMN status SET DEFAULT 'draft';
