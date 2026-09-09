/**
 * Reseñas con moderación — capa de datos (tabla `testimonials`).
 *
 * SOLO SERVIDOR. Varias funciones usan el service role; ninguna debe importarse
 * desde un componente cliente.
 *
 * FLUJO DE ESTADOS
 *   pending_verification → el autor todavía no confirmó su mail
 *   pending_review       → mail confirmado, esperando moderación de Marian
 *   published            → visible en el sitio
 *   rejected             → descartada (moderation_note = motivo, uso interno)
 *
 * DOS REGLAS QUE NO SE ROMPEN
 * 1. Las lecturas públicas nunca tiran excepción: si Supabase falla, devuelven
 *    vacío y la página se arma igual (mismo criterio que getContent/clippings).
 * 2. El contenido de una reseña es INMUTABLE. Ninguna función de este archivo
 *    actualiza body, rating ni los datos del autor: solo status y campos de
 *    moderación/verificación. Lo que la persona escribió queda como lo mandó.
 */

import { createHash } from "node:crypto"
import { supabase, createAdminClient } from "@/lib/supabase"
import {
  testimonialInputSchema,
  toFieldErrors,
  type ReviewerType,
  type TestimonialFieldErrors,
} from "@/lib/testimonials-schema"

export type { ReviewerType }

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TestimonialStatus =
  | "pending_verification"
  | "pending_review"
  | "published"
  | "rejected"

export const TESTIMONIAL_STATUS_LABELS: Record<TestimonialStatus, string> = {
  pending_verification: "Sin verificar",
  pending_review: "Para moderar",
  published: "Publicada",
  rejected: "Rechazada",
}

/** Lo que ve el sitio público. Sin email, sin ip_hash, sin token. */
export interface PublicTestimonial {
  id: string
  reviewer_type: ReviewerType
  author_name: string
  author_role: string
  author_brand: string
  author_url: string
  rating: number
  body: string
  published_at: string | null
}

/** Lo que ve el admin: todo menos el token de verificación (es un secreto). */
export interface AdminTestimonial extends PublicTestimonial {
  author_email: string
  status: TestimonialStatus
  moderation_note: string | null
  moderated_at: string | null
  moderated_by: string | null
  verification_expires_at: string
  verified_at: string | null
  created_at: string
  ip_hash: string | null
  user_agent: string | null
}

export interface RatingSummary {
  /** Promedio sobre TODAS las publicadas, redondeado a un decimal. */
  average: number | null
  count: number
  countMarcas: number
  countPeriodistas: number
}

// Columnas seguras para el público. Ojo al tocarlas: la migración
// 20260908_testimonials.sql da GRANT SELECT por columna, así que pedir una que
// no esté en esa lista devuelve error de permisos con la anon key.
const PUBLIC_COLUMNS =
  "id, reviewer_type, author_name, author_role, author_brand, author_url, rating, body, published_at"

const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, author_email, status, moderation_note, moderated_at, moderated_by, verification_expires_at, verified_at, created_at, ip_hash, user_agent`

const EMPTY_SUMMARY: RatingSummary = {
  average: null,
  count: 0,
  countMarcas: 0,
  countPeriodistas: 0,
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ─── Lectura pública ─────────────────────────────────────────────────────────

/**
 * Reseñas publicadas, de la más reciente a la más vieja.
 *
 * @param limit        máximo de reseñas (sin límite si se omite)
 * @param reviewerType filtra por 'marca' o 'periodista' (todas si se omite)
 *
 * Nunca tira excepción: ante cualquier error devuelve `[]`.
 */
export async function getPublishedTestimonials(
  limit?: number,
  reviewerType?: ReviewerType,
): Promise<PublicTestimonial[]> {
  try {
    let query = supabase
      .from("testimonials")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (reviewerType) query = query.eq("reviewer_type", reviewerType)
    if (typeof limit === "number" && limit > 0) query = query.limit(limit)

    const { data, error } = await query

    if (error || !data) {
      if (error) console.error("[testimonials] getPublished:", error.message)
      return []
    }

    return data as unknown as PublicTestimonial[]
  } catch (e) {
    console.error("[testimonials] getPublished:", e)
    return []
  }
}

/**
 * Promedio y conteos sobre las reseñas PUBLICADAS. El promedio se calcula
 * sobre todas juntas, sin distinguir marca de periodista, y se redondea a un
 * decimal (4.67 → 4.7). Si algo falla, devuelve el resumen vacío.
 */
export async function getRatingSummary(): Promise<RatingSummary> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("rating, reviewer_type")
      .eq("status", "published")

    if (error || !data || data.length === 0) {
      if (error) console.error("[testimonials] getRatingSummary:", error.message)
      return EMPTY_SUMMARY
    }

    const rows = data as unknown as {
      rating: number
      reviewer_type: ReviewerType
    }[]

    const total = rows.reduce((acc, r) => acc + r.rating, 0)

    return {
      average: Math.round((total / rows.length) * 10) / 10,
      count: rows.length,
      countMarcas: rows.filter((r) => r.reviewer_type === "marca").length,
      countPeriodistas: rows.filter((r) => r.reviewer_type === "periodista")
        .length,
    }
  } catch (e) {
    console.error("[testimonials] getRatingSummary:", e)
    return EMPTY_SUMMARY
  }
}

// ─── Alta ────────────────────────────────────────────────────────────────────

export type CreateTestimonialResult =
  | {
      ok: true
      id: string
      /** Token del link de verificación. NO exponerlo en la respuesta HTTP. */
      token: string
      /**
       * Email y nombre YA normalizados por zod (trim, minúsculas). El mail de
       * confirmación tiene que usar estos, no lo que vino crudo del formulario:
       * un " Nico@X.com " sin recortar hace que Resend rechace el envío.
       */
      email: string
      name: string
    }
  | { ok: false; error: string; fieldErrors?: TestimonialFieldErrors }

/** Metadatos de la request, para antiabuso. Los saca el route handler de los headers. */
export interface TestimonialRequestMeta {
  ip?: string | null
  userAgent?: string | null
}

/**
 * Hash del IP. Nunca se guarda el IP en claro: sirve para detectar spam, no
 * para identificar a nadie. Sin TESTIMONIAL_IP_SALT no se hashea (un salt vacío
 * haría el hash reversible con un diccionario de IPs).
 *
 * Exportada para que el route handler pueda hacer el rate limit ANTES de
 * insertar, usando exactamente el mismo hash que se guarda en la fila.
 */
export function hashTestimonialIp(ip: string | null | undefined): string | null {
  if (!ip) return null

  const salt = process.env.TESTIMONIAL_IP_SALT
  if (!salt) {
    console.warn(
      "[testimonials] Falta TESTIMONIAL_IP_SALT: se guarda ip_hash en null.",
    )
    return null
  }

  return createHash("sha256").update(`${ip}${salt}`).digest("hex")
}

/**
 * Alta de una reseña. Valida, hashea el IP e inserta con status
 * `pending_verification`. Devuelve el token para armar el link de confirmación
 * que se manda por mail.
 *
 * El `input` llega sin tipar a propósito: viene del formulario y lo valida zod.
 */
export async function createTestimonial(
  input: unknown,
  meta: TestimonialRequestMeta = {},
): Promise<CreateTestimonialResult> {
  const parsed = testimonialInputSchema.safeParse(input)

  if (!parsed.success) {
    const fieldErrors = toFieldErrors(parsed.error)
    return {
      ok: false,
      error:
        Object.values(fieldErrors)[0] ?? "Revisá los datos del formulario.",
      fieldErrors,
    }
  }

  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from("testimonials")
      .insert({
        ...parsed.data,
        status: "pending_verification",
        ip_hash: hashTestimonialIp(meta.ip),
        user_agent: meta.userAgent?.slice(0, 500) ?? null,
      })
      .select("id, verification_token")
      .single()

    if (error || !data) {
      console.error("[testimonials] createTestimonial:", error?.message)
      return {
        ok: false,
        error: "No pudimos guardar tu reseña. Probá de nuevo en un momento.",
      }
    }

    return {
      ok: true,
      id: data.id,
      token: data.verification_token,
      email: parsed.data.author_email,
      name: parsed.data.author_name,
    }
  } catch (e) {
    console.error("[testimonials] createTestimonial:", e)
    return {
      ok: false,
      error: "No pudimos guardar tu reseña. Probá de nuevo en un momento.",
    }
  }
}

/**
 * Cuántas reseñas se mandaron desde el mismo IP en las últimas `hours` horas.
 * Es el rate limit del formulario público.
 *
 * Ante error devuelve 0 (deja pasar): preferimos una reseña de spam de más
 * antes que bloquear a alguien real porque Supabase tuvo un hipo. La moderación
 * es el filtro que importa.
 */
export async function countRecentSubmissionsByIp(
  ipHash: string,
  hours = 24,
): Promise<number> {
  if (!ipHash) return 0

  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { count, error } = await admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since)

    if (error) {
      console.error("[testimonials] countRecentByIp:", error.message)
      return 0
    }

    return count ?? 0
  } catch (e) {
    console.error("[testimonials] countRecentByIp:", e)
    return 0
  }
}

// ─── Verificación por mail ───────────────────────────────────────────────────

/** Datos mínimos para armar el aviso de moderación. Sin email ni ip_hash. */
export interface TestimonialModerationNotice {
  id: string
  reviewer_type: ReviewerType
  author_name: string
  author_role: string
  author_brand: string
  rating: number
  body: string
}

export type VerifyTestimonialResult =
  /**
   * Recién verificada: pasó a pending_review y espera moderación.
   * Trae los datos de la reseña para poder avisarle al equipo sin una segunda
   * consulta. Solo viene en la transición real, no cuando el link se reusa,
   * así que el aviso se manda una sola vez.
   */
  | { status: "ok"; testimonial: TestimonialModerationNotice }
  /** El link ya se había usado. No se distingue en qué estado quedó después. */
  | { status: "already_verified" }
  | { status: "expired" }
  | { status: "not_found" }
  | { status: "error" }

/**
 * Confirma el mail de una reseña a partir del token del link.
 *
 * NO PUBLICA: deja la reseña en `pending_review` para que Marian la modere.
 * Devuelve un resultado tipado; nunca lanza excepción.
 */
export async function verifyTestimonial(
  token: string,
): Promise<VerifyTestimonialResult> {
  // Sin este chequeo un token basura llega a Postgres como uuid inválido
  // (22P02) y sale por el catch como "error" en vez de "not found".
  if (!token || !UUID_RE.test(token)) return { status: "not_found" }

  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from("testimonials")
      .select("id, status, verification_expires_at")
      .eq("verification_token", token)
      .maybeSingle()

    if (error) {
      console.error("[testimonials] verify (select):", error.message)
      return { status: "error" }
    }
    if (!data) return { status: "not_found" }

    if (data.status !== "pending_verification") {
      return { status: "already_verified" }
    }

    if (new Date(data.verification_expires_at).getTime() <= Date.now()) {
      return { status: "expired" }
    }

    const now = new Date().toISOString()

    // El .eq de status hace el update idempotente: si entran dos clics al
    // mismo tiempo, el segundo no matchea ninguna fila y no pisa verified_at.
    const { data: updated, error: updateError } = await admin
      .from("testimonials")
      .update({ status: "pending_review", verified_at: now })
      .eq("id", data.id)
      .eq("status", "pending_verification")
      .select(
        "id, reviewer_type, author_name, author_role, author_brand, rating, body",
      )
      .maybeSingle()

    if (updateError) {
      console.error("[testimonials] verify (update):", updateError.message)
      return { status: "error" }
    }
    if (!updated) return { status: "already_verified" }

    return {
      status: "ok",
      testimonial: updated as unknown as TestimonialModerationNotice,
    }
  } catch (e) {
    console.error("[testimonials] verify:", e)
    return { status: "error" }
  }
}

// ─── Admin: lectura ──────────────────────────────────────────────────────────

/**
 * Todas las reseñas, en cualquier estado, para el panel de moderación.
 * Ordenadas por fecha de envío (la más nueva primero).
 *
 * Tampoco tira excepción, pero a diferencia de las lecturas públicas devuelve
 * `ok` junto con las filas: en el panel NO da lo mismo "no llegó ninguna
 * reseña" que "no pude leer la base". Si falla y mostráramos el estado vacío,
 * Marian creería que nadie le escribió mientras hay reseñas esperando.
 */
export async function getAllTestimonials(): Promise<{
  rows: AdminTestimonial[]
  ok: boolean
}> {
  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from("testimonials")
      .select(ADMIN_COLUMNS)
      .order("created_at", { ascending: false })

    if (error || !data) {
      if (error) console.error("[testimonials] getAll:", error.message)
      return { rows: [], ok: false }
    }

    return { rows: data as unknown as AdminTestimonial[], ok: true }
  } catch (e) {
    console.error("[testimonials] getAll:", e)
    return { rows: [], ok: false }
  }
}

/** Cuántas esperan moderación. Para el badge del sidebar del admin. 0 si falla. */
export async function getPendingCount(): Promise<number> {
  try {
    const admin = createAdminClient()

    const { count, error } = await admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review")

    if (error) {
      console.error("[testimonials] getPendingCount:", error.message)
      return 0
    }

    return count ?? 0
  } catch (e) {
    console.error("[testimonials] getPendingCount:", e)
    return 0
  }
}

// ─── Admin: moderación ───────────────────────────────────────────────────────

export type ModerationResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Mínimo de caracteres del motivo de moderación. Es la fuente de verdad: el
 * diálogo del admin deshabilita el botón con menos, pero el que decide es el
 * servidor. Un motivo de dos letras ("no") no le sirve a nadie dentro de seis
 * meses, y este texto es el único registro de por qué se bajó una reseña.
 */
export const MODERATION_NOTE_MIN = 10

/** Valida el motivo. Devuelve el texto limpio o un error listo para mostrar. */
function cleanNote(note: string): { ok: true; note: string } | { ok: false; error: string } {
  const clean = note?.trim() ?? ""
  if (!clean) return { ok: false, error: "Escribí el motivo." }
  if (clean.length < MODERATION_NOTE_MIN) {
    return {
      ok: false,
      error: `Contá un poco más: el motivo necesita al menos ${MODERATION_NOTE_MIN} caracteres.`,
    }
  }
  return { ok: true, note: clean.slice(0, 1000) }
}

/**
 * Publica una reseña: la hace visible en el sitio y deja registro de quién y
 * cuándo la aprobó.
 *
 * No se puede publicar algo en `pending_verification`: sin mail confirmado no
 * hay forma de saber que la reseña es de quien dice ser.
 */
export async function publishTestimonial(
  id: string,
  adminEmail: string,
): Promise<ModerationResult> {
  if (!id || !UUID_RE.test(id)) return { ok: false, error: "Reseña inválida." }

  try {
    const admin = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await admin
      .from("testimonials")
      .update({
        status: "published",
        published_at: now,
        moderated_at: now,
        moderated_by: adminEmail,
      })
      .eq("id", id)
      .in("status", ["pending_review", "rejected"])
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("[testimonials] publish:", error.message)
      return { ok: false, error: "No se pudo publicar la reseña." }
    }
    if (!data) {
      return {
        ok: false,
        error:
          "No se pudo publicar: la reseña ya está publicada o el autor todavía no confirmó su mail.",
      }
    }

    return { ok: true }
  } catch (e) {
    console.error("[testimonials] publish:", e)
    return { ok: false, error: "No se pudo publicar la reseña." }
  }
}

/**
 * Rechaza una reseña. `note` es el motivo, de uso interno: no se muestra en
 * público ni se le manda al autor. Si la reseña estaba publicada, la baja del
 * sitio (queda el published_at anterior como registro de que estuvo online).
 */
export async function rejectTestimonial(
  id: string,
  note: string,
  adminEmail: string,
): Promise<ModerationResult> {
  if (!id || !UUID_RE.test(id)) return { ok: false, error: "Reseña inválida." }

  const parsedNote = cleanNote(note)
  if (!parsedNote.ok) return parsedNote

  try {
    const admin = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await admin
      .from("testimonials")
      .update({
        status: "rejected",
        moderation_note: parsedNote.note,
        moderated_at: now,
        moderated_by: adminEmail,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("[testimonials] reject:", error.message)
      return { ok: false, error: "No se pudo rechazar la reseña." }
    }
    if (!data) return { ok: false, error: "No se encontró la reseña." }

    return { ok: true }
  } catch (e) {
    console.error("[testimonials] reject:", e)
    return { ok: false, error: "No se pudo rechazar la reseña." }
  }
}

/**
 * Despublica una reseña: la baja del sitio y la devuelve a `pending_review`.
 *
 * NO es lo mismo que rechazarla. Rechazar es una decisión tomada ("esta no va");
 * despublicar la vuelve a poner en la cola de moderación, que es lo que hace
 * falta cuando se baja algo para revisarlo —el autor pidió corregir un dato, se
 * discute internamente— sin cerrar la puerta. Por eso la reseña vuelve a contar
 * en el badge de pendientes: queda una decisión abierta.
 *
 * El motivo es obligatorio igual que en el rechazo: es el registro de por qué
 * dejó de verse algo que ya estaba publicado.
 *
 * `published_at` NO se borra: queda como registro de que estuvo online. No
 * afecta a nadie, porque todas las lecturas públicas filtran por status.
 */
export async function unpublishTestimonial(
  id: string,
  note: string,
  adminEmail: string,
): Promise<ModerationResult> {
  if (!id || !UUID_RE.test(id)) return { ok: false, error: "Reseña inválida." }

  const parsedNote = cleanNote(note)
  if (!parsedNote.ok) return parsedNote

  try {
    const admin = createAdminClient()
    const now = new Date().toISOString()

    // El .eq de status acota la acción a lo que está publicado: si alguien ya
    // la bajó desde otra pestaña, esto no matchea nada y avisa en vez de
    // pisar una decisión más nueva.
    const { data, error } = await admin
      .from("testimonials")
      .update({
        status: "pending_review",
        moderation_note: parsedNote.note,
        moderated_at: now,
        moderated_by: adminEmail,
      })
      .eq("id", id)
      .eq("status", "published")
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("[testimonials] unpublish:", error.message)
      return { ok: false, error: "No se pudo despublicar la reseña." }
    }
    if (!data) {
      return {
        ok: false,
        error: "No se pudo despublicar: la reseña ya no estaba publicada.",
      }
    }

    return { ok: true }
  } catch (e) {
    console.error("[testimonials] unpublish:", e)
    return { ok: false, error: "No se pudo despublicar la reseña." }
  }
}
