/**
 * POST /api/resenas — alta de una reseña desde el formulario público.
 *
 * Orden de los filtros (importa: el más barato primero, y ninguno le cuenta al
 * atacante qué lo frenó):
 *   1. honeypot   → 200 con éxito simulado, no inserta nada
 *   2. rate limit → 3 reseñas por IP cada 24h
 *   3. zod        → errores por campo, los pinta el formulario
 *   4. insert     → status pending_review, directo a la cola de moderación
 *   5. aviso      → mail interno al equipo, después de responder
 *
 * NO hay confirmación por mail del autor: la reseña entra derecho a moderación.
 * El filtro real es que Marian aprueba una por una y que cada reseña trae un
 * link a un perfil público para chequear quién la firma.
 *
 * Nunca devuelve un stack ni un error de Supabase al cliente.
 */

import { after } from "next/server"
import type { NextRequest } from "next/server"
import {
  createTestimonial,
  hashTestimonialIp,
  countRecentSubmissionsByIp,
} from "@/lib/testimonials"
import { sendModerationNotice } from "@/lib/testimonials-email"
import { SITE_EMAIL } from "@/lib/constants"
import type { TestimonialFieldErrors } from "@/lib/testimonials-schema"

export const dynamic = "force-dynamic"

/** Máximo de reseñas por IP en la ventana de RATE_LIMIT_HOURS. */
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_HOURS = 24

/**
 * Lo que se le responde a un envío bueno. Es el MISMO texto que devuelve el
 * honeypot: si el bot recibiera algo distinto, aprendería que lo detectamos.
 */
const SUCCESS_MESSAGE = "Recibimos tu reseña. Marian la revisa antes de publicarla."

export type ResenaApiResponse = {
  ok: boolean
  message?: string
  error?: string
  fieldErrors?: TestimonialFieldErrors
}

/**
 * IP del cliente. En Vercel viene en x-forwarded-for como lista
 * "cliente, proxy1, proxy2": el primero es el real.
 */
function clientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return req.headers.get("x-real-ip")?.trim() || null
}

function json(body: ResenaApiResponse, status = 200) {
  return Response.json(body, { status })
}

export async function POST(req: NextRequest) {
  let payload: unknown

  try {
    payload = await req.json()
  } catch {
    return json({ ok: false, error: "No pudimos leer el formulario." }, 400)
  }

  if (typeof payload !== "object" || payload === null) {
    return json({ ok: false, error: "No pudimos leer el formulario." }, 400)
  }

  const { website, ...input } = payload as Record<string, unknown>

  // 1. Honeypot. Un humano nunca ve este campo, así que si viene con algo es un
  // bot: le devolvemos el mismo 200 que a un envío bueno para que no aprenda
  // que lo detectamos, y no insertamos nada.
  if (typeof website === "string" && website.trim() !== "") {
    console.warn("[api/resenas] honeypot activado, descartado")
    return json({ ok: true, message: SUCCESS_MESSAGE })
  }

  // 2. Rate limit por IP. El hash es el mismo que se guarda en la fila.
  const ipHash = hashTestimonialIp(clientIp(req))
  if (ipHash) {
    const recent = await countRecentSubmissionsByIp(ipHash, RATE_LIMIT_HOURS)
    if (recent >= RATE_LIMIT_MAX) {
      return json(
        {
          ok: false,
          error:
            "Ya recibimos varias reseñas desde esta conexión en las últimas horas. Si te faltó algo, escribinos a " +
            SITE_EMAIL +
            " y lo resolvemos.",
        },
        429,
      )
    }
  }

  // 3 y 4. Valida e inserta (createTestimonial hace las dos cosas).
  const result = await createTestimonial(input, {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent"),
  })

  if (!result.ok) {
    return json(
      { ok: false, error: result.error, fieldErrors: result.fieldErrors },
      result.fieldErrors ? 422 : 500,
    )
  }

  // 5. Aviso al equipo. Va con after(): se manda DESPUÉS de responderle a la
  // persona, así el formulario no espera a Resend. Si el mail falla no pasa
  // nada grave —la reseña ya está guardada y el badge del panel la cuenta—,
  // por eso sendModerationNotice nunca tira.
  after(() => sendModerationNotice(result.testimonial))

  return json({ ok: true, message: SUCCESS_MESSAGE })
}
