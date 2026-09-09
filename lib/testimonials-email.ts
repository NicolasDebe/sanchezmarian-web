/**
 * Mail del sistema de reseñas (Resend). SOLO SERVIDOR.
 *
 * Queda uno solo: el aviso al equipo de que llegó una reseña para moderar. Es
 * interno y best-effort — si falla se loguea y listo, nunca puede afectar lo
 * que ve quien acaba de mandar su reseña, y la reseña igual está guardada y
 * contada en el badge del panel. No lanza excepción.
 *
 * (Antes había un segundo mail, el de confirmación al autor. Se sacó junto con
 * el paso de doble opt-in el 2026-09-09: era donde más gente abandonaba, y el
 * filtro que decide es la moderación manual.)
 *
 * Sin RESEND_API_KEY no se manda nada y todo lo demás sigue funcionando.
 */

import { Resend } from "resend"
import { SITE_URL } from "@/lib/seo"
import { SITE_EMAIL } from "@/lib/constants"
import { REVIEWER_TYPE_LABELS } from "@/lib/testimonials-schema"
import type { TestimonialModerationNotice } from "@/lib/testimonials"

/**
 * Remitente de TODOS los mails de reseñas.
 *
 * Sale de SITE_EMAIL (info@sanchezmarian.com), la misma casilla que figura en
 * el footer, en los formularios y en el "escribinos a…" de los propios mails:
 * es una casilla real que alguien lee. Si el remitente fuera una dirección
 * aparte (resenas@…), quien conteste el mail de confirmación —que es lo que
 * hace la gente— le escribiría a un buzón que nadie mira.
 *
 * En Resend hay que verificar el DOMINIO sanchezmarian.com para poder mandar
 * desde esta dirección.
 */
const FROM = `Marian Sánchez <${SITE_EMAIL}>`

/** Paleta de la marca, en hex literal: los mails no leen las CSS vars del sitio. */
const C = {
  bordo: "#66001F",
  bordoOscuro: "#3D000F",
  hueso: "#FEFCEF",
  arena: "#F0E8D8",
  grisBordo: "#4A3040",
  dorado: "#C9A882",
  negroBordo: "#1A0008",
} as const

/**
 * Base pública del sitio. NEXT_PUBLIC_SITE_URL permite apuntar los links a un
 * preview; sin ella cae al dominio canónico de lib/seo.ts.
 */
function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, "")
}

/**
 * Cliente de Resend. Devuelve null si falta la API key, para que el llamador
 * trate "sin configurar" igual que "falló el envío" en vez de explotar en el
 * constructor.
 */
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error("[testimonials-email] Falta RESEND_API_KEY: no se envía nada.")
    return null
  }
  return new Resend(key)
}

/** Escapa texto de usuario antes de meterlo en el HTML del mail. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// ─── Aviso de moderación (al equipo) ──────────────────────────────────────

/** Exportada para poder previsualizarla sin mandar nada (scripts/preview-emails.ts). */
export function moderationHtml(
  t: TestimonialModerationNotice,
  adminUrl: string,
): string {
  const stars = "★".repeat(t.rating) + "☆".repeat(5 - t.rating)
  // Los saltos de línea de la reseña se respetan: el texto se muestra tal cual
  // lo escribieron, que es lo que después se publica.
  const body = esc(t.body).replace(/\r?\n/g, "<br>")

  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.arena};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.arena};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${C.hueso};border-radius:16px;overflow:hidden;">

        <tr><td style="background:${C.bordoOscuro};padding:22px 32px;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${C.dorado};">Reseña nueva para revisar</p>
        </td></tr>

        <tr><td style="padding:30px 32px 6px;">
          <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${C.negroBordo};">${esc(t.author_name)}</p>
          <p style="margin:0 0 2px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${C.grisBordo};">${esc(t.author_role)} · ${esc(t.author_brand)}</p>
          <p style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${C.grisBordo};">${REVIEWER_TYPE_LABELS[t.reviewer_type]}</p>
          <p style="margin:0 0 20px;font-size:18px;color:${C.dorado};letter-spacing:.12em;">${stars} <span style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${C.grisBordo};letter-spacing:0;">${t.rating} de 5</span></p>
        </td></tr>

        <tr><td style="padding:0 32px 26px;">
          <div style="border-left:3px solid ${C.dorado};padding:2px 0 2px 16px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.7;color:${C.negroBordo};">${body}</p>
          </div>
        </td></tr>

        <tr><td align="center" style="padding:0 32px 32px;">
          <a href="${adminUrl}" style="display:inline-block;background:${C.bordo};color:${C.hueso};font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:14px 30px;border-radius:999px;">
            Revisar en el panel
          </a>
          <p style="margin:16px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:${C.grisBordo};">
            El autor ya confirmó su mail. No se publica hasta que la apruebes.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Le avisa al equipo que hay una reseña esperando moderación.
 *
 * Nunca tira ni devuelve error: es un aviso interno y no puede afectar lo que
 * ve la persona que acaba de confirmar su reseña. Va a MODERATION_NOTIFY_EMAIL
 * si está seteada y, si no, a la casilla del sitio.
 */
export async function sendModerationNotice(
  t: TestimonialModerationNotice,
): Promise<void> {
  // Sin la env var el aviso igual llega: cae en la casilla del sitio, que es
  // la que se lee todos los días. MODERATION_NOTIFY_EMAIL solo sirve para
  // desviarlo a otro lado (por ejemplo, a la casilla de Nico mientras se
  // prueba). Antes, sin la variable, la reseña quedaba esperando en el panel
  // sin que nadie se enterara.
  const to = process.env.MODERATION_NOTIFY_EMAIL?.trim() || SITE_EMAIL

  const resend = client()
  if (!resend) return

  const adminUrl = `${siteUrl()}/admin/resenas`
  const stars = "★".repeat(t.rating) + "☆".repeat(5 - t.rating)

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Reseña nueva para revisar · ${t.author_name} de ${t.author_brand}`,
      html: moderationHtml(t, adminUrl),
      text: [
        `${t.author_name} — ${t.author_role} · ${t.author_brand}`,
        `${REVIEWER_TYPE_LABELS[t.reviewer_type]}`,
        `${stars} (${t.rating} de 5)`,
        "",
        t.body,
        "",
        `Revisar en el panel: ${adminUrl}`,
        "El autor ya confirmó su mail. No se publica hasta que la apruebes.",
      ].join("\n"),
    })

    if (error) console.error("[testimonials-email] aviso moderación:", error)
  } catch (e) {
    console.error("[testimonials-email] aviso moderación:", e)
  }
}
