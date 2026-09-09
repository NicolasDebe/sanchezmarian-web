/**
 * POST /api/resenas — alta de una reseña desde el formulario público.
 *
 * Orden de los filtros (importa: el más barato primero, y ninguno le cuenta al
 * atacante qué lo frenó):
 *   1. honeypot   → 200 con éxito simulado, no inserta nada
 *   2. rate limit → 3 reseñas por IP cada 24h
 *   3. zod        → errores por campo, los pinta el formulario
 *   4. insert     → status pending_verification
 *   5. mail       → si falla, la reseña YA está guardada y se avisa distinto
 *
 * Nunca devuelve un stack ni un error de Supabase al cliente.
 */

import type { NextRequest } from "next/server"
import {
  createTestimonial,
  hashTestimonialIp,
  countRecentSubmissionsByIp,
} from "@/lib/testimonials"
import { sendVerificationEmail } from "@/lib/testimonials-email"
import { SITE_EMAIL } from "@/lib/constants"
import type { TestimonialFieldErrors } from "@/lib/testimonials-schema"

export const dynamic = "force-dynamic"

/** Máximo de reseñas por IP en la ventana de RATE_LIMIT_HOURS. */
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_HOURS = 24

export type ResenaApiResponse = {
  ok: boolean
  /** true = quedó guardada pero el mail no salió; hay que avisar por otro lado. */
  emailFailed?: boolean
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
    return json({ ok: true, message: "Listo. Revisá tu correo." })
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

  // 5. Mail de verificación. El token NO sale en la respuesta: solo viaja al
  // mail del autor, que es justamente lo que prueba que la casilla es suya.
  const emailOk = await sendVerificationEmail(
    result.email,
    result.name,
    result.token,
  )

  if (!emailOk) {
    return json({
      ok: true,
      emailFailed: true,
      message:
        "Guardamos tu reseña, pero no pudimos mandarte el mail de confirmación. Escribinos a " +
        SITE_EMAIL +
        " y la confirmamos a mano.",
    })
  }

  return json({
    ok: true,
    message: "Te mandamos un mail para confirmar que la reseña es tuya.",
  })
}
