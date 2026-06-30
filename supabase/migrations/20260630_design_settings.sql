-- Sistema de presets tipográficos — singleton + historial
CREATE TABLE IF NOT EXISTS design_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_lock boolean NOT NULL DEFAULT true UNIQUE,
  text_scale_mobile text NOT NULL DEFAULT 'equilibrado',
  text_scale_desktop text NOT NULL DEFAULT 'equilibrado',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text,
  CHECK (text_scale_mobile IN ('denso','compacto','ajustado','comodo','equilibrado','amplio','generoso','editorial')),
  CHECK (text_scale_desktop IN ('denso','compacto','ajustado','comodo','equilibrado','amplio','generoso','editorial'))
);

CREATE TABLE IF NOT EXISTS design_settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_scale_mobile text NOT NULL,
  text_scale_desktop text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text
);

INSERT INTO design_settings (singleton_lock, text_scale_mobile, text_scale_desktop)
VALUES (true, 'equilibrado', 'equilibrado')
ON CONFLICT (singleton_lock) DO NOTHING;
