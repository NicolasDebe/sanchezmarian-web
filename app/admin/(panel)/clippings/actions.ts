"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase"
import { SCOPES, FORMATS, type ClippingScope, type ClippingFormat } from "@/lib/clippings"
import {
  audioFileError,
  safeAudioName,
  audioPathFromPublicUrl,
} from "@/lib/audio"
import {
  fetchUrlMetadata,
  isHttpUrl,
  EMPTY_METADATA,
  type UrlMetadata,
} from "@/lib/extract-metadata"

const AUDIO_BUCKET = "clipping-audios"

export type ClippingResult = { success: true } | { success: false; error: string }

export interface ClippingInput {
  client_id: string
  medium: string
  title: string
  /** yyyy-mm-dd */
  published_at: string
  scope: ClippingScope
  format: ClippingFormat
  /** Opcional: un clipping puede tener solo audio. */
  url: string | null
  /** Opcional: URL pública del audio en Storage. */
  audio_url?: string | null
  /** Opcional: duración del audio en segundos. */
  audio_duration_seconds?: number | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireUser(): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    return { id: user.id, email: user.email ?? "" }
  } catch {
    return null
  }
}

function validateInput(data: ClippingInput): string | null {
  if (!data.client_id) return "Falta el cliente."
  if (!data.medium?.trim()) return "Completá el medio."
  if (!data.title?.trim()) return "Completá el título."
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.published_at ?? "")) return "La fecha no es válida."
  if (!SCOPES.includes(data.scope)) return "Elegí un alcance válido."
  if (!FORMATS.includes(data.format)) return "Elegí un formato válido."
  // URL ahora es opcional: un clipping puede tener solo audio. Mínimo uno.
  const hasUrl = !!data.url?.trim()
  const hasAudio = !!data.audio_url?.trim()
  if (!hasUrl && !hasAudio) return "Agregá una URL o un audio (al menos uno)."
  if (hasUrl && !isHttpUrl(data.url!.trim())) {
    return "La URL debe empezar con http:// o https://."
  }
  return null
}

/**
 * Campos de audio para insert/update. Solo se incluyen cuando hay valor: así,
 * mientras la migración 20260628 no se haya corrido (columnas inexistentes),
 * los clippings de solo-URL siguen guardándose sin tocar columnas que no existen.
 */
function audioFields(data: ClippingInput): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (data.audio_url !== undefined) out.audio_url = data.audio_url || null
  if (data.audio_duration_seconds !== undefined) {
    out.audio_duration_seconds = data.audio_duration_seconds ?? null
  }
  return out
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createClipping(data: ClippingInput): Promise<ClippingResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  const invalid = validateInput(data)
  if (invalid) return { success: false, error: invalid }

  try {
    const admin = createAdminClient()

    // Dentro de una misma fecha, mayor order_position = más nuevo (queda arriba).
    const { data: maxRow } = await admin
      .from("clippings")
      .select("order_position")
      .eq("client_id", data.client_id)
      .order("order_position", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await admin.from("clippings").insert({
      client_id: data.client_id,
      medium: data.medium.trim(),
      title: data.title.trim(),
      published_at: data.published_at,
      scope: data.scope,
      format: data.format,
      url: data.url?.trim() || null,
      ...audioFields(data),
      order_position: (maxRow?.order_position ?? -1) + 1,
      created_by: user.email || user.id,
      updated_by: user.email || user.id,
    })

    if (error) {
      console.error("[createClipping] supabase insert error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return { success: false, error: `No se pudo guardar: ${error.message}` }
    }
  } catch (err) {
    console.error("[createClipping] throw:", err)
    const msg = err instanceof Error ? err.message : "error desconocido"
    return { success: false, error: `Ocurrió un error al guardar: ${msg}` }
  }

  revalidatePath("/casos-de-exito")
  return { success: true }
}

export async function updateClipping(
  id: string,
  data: ClippingInput,
): Promise<ClippingResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  const invalid = validateInput(data)
  if (invalid) return { success: false, error: invalid }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("clippings")
      .update({
        medium: data.medium.trim(),
        title: data.title.trim(),
        published_at: data.published_at,
        scope: data.scope,
        format: data.format,
        url: data.url?.trim() || null,
        ...audioFields(data),
        updated_at: new Date().toISOString(),
        updated_by: user.email || user.id,
      })
      .eq("id", id)

    if (error) {
      console.error("[updateClipping] supabase update error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return { success: false, error: `No se pudo guardar: ${error.message}` }
    }
  } catch (err) {
    console.error("[updateClipping] throw:", err)
    const msg = err instanceof Error ? err.message : "error desconocido"
    return { success: false, error: `Ocurrió un error al guardar: ${msg}` }
  }

  revalidatePath("/casos-de-exito")
  return { success: true }
}

export async function reorderClients(orderedIds: string[]): Promise<ClippingResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "No autenticado" }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, error: "Lista de clientes vacía." }
  }

  try {
    const admin = createAdminClient()

    // Update individual por id: Supabase no soporta bulk update con valores
    // distintos por fila en una sola query. Con <50 clientes va de sobra.
    const results = await Promise.all(
      orderedIds.map((id, idx) =>
        admin
          .from("clients")
          .update({ order_position: (idx + 1) * 10 })
          .eq("id", id),
      ),
    )

    const failed = results
      .map((r, i) => ({ r, id: orderedIds[i] }))
      .filter(({ r }) => r.error)

    if (failed.length > 0) {
      for (const f of failed) {
        console.error("[reorderClients] update fallido:", {
          id: f.id,
          code: f.r.error?.code,
          message: f.r.error?.message,
          details: f.r.error?.details,
        })
      }
      return {
        success: false,
        error: `No se pudo guardar el orden de ${failed.length} cliente${failed.length === 1 ? "" : "s"}.`,
      }
    }
  } catch (err) {
    console.error("[reorderClients] throw:", err)
    const msg = err instanceof Error ? err.message : "error desconocido"
    return { success: false, error: `Ocurrió un error al guardar: ${msg}` }
  }

  revalidatePath("/casos-de-exito")
  revalidatePath("/admin/clippings")
  return { success: true }
}

export async function deleteClipping(id: string): Promise<ClippingResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from("clippings").delete().eq("id", id)
    if (error) return { success: false, error: "No se pudo eliminar. Intentá de nuevo." }
  } catch {
    return { success: false, error: "Ocurrió un error al eliminar. Intentá de nuevo." }
  }

  revalidatePath("/casos-de-exito")
  return { success: true }
}

// ─── Auto-completar desde URL ─────────────────────────────────────────────────

// OJO: no re-exportar tipos desde este archivo. Es "use server": el build de
// producción (Turbopack) convierte `export type { X }` en una referencia de
// runtime a un identificador que no existe y TODO el módulo crashea con
// "ReferenceError: X is not defined" (HTTP 500 en cada server action).
// Importar UrlMetadata directo desde "@/lib/extract-metadata".

/**
 * Lee la nota y extrae medio / título / fecha desde los meta tags
 * (Open Graph, application-name, article:published_time y JSON-LD).
 * Nunca tira excepción: ante cualquier falla devuelve los campos en null.
 */
export async function extractMetadataFromURL(url: string): Promise<UrlMetadata> {
  const user = await requireUser()
  if (!user) return EMPTY_METADATA
  return fetchUrlMetadata(url)
}

// ─── Audio (Storage) ────────────────────────────────────────────────────────

export type AudioUploadResult =
  | { success: true; url: string; path: string }
  | { success: false; error: string }

/**
 * Sube un audio al bucket `clipping-audios` (service role) y devuelve la URL
 * pública. Si viene `clipping_id`, además asocia el audio al clipping.
 * Para clippings NUEVOS no hay id todavía: el form guarda la URL devuelta y la
 * manda en createClipping.
 */
export async function uploadClippingAudio(
  formData: FormData,
): Promise<AudioUploadResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  const file = formData.get("audio") as File | null
  const clippingId = (formData.get("clipping_id") as string | null) || null
  const clientSlug = (formData.get("client_slug") as string | null) || null

  if (!file) return { success: false, error: "No se seleccionó archivo." }
  if (!clientSlug) return { success: false, error: "Falta el cliente." }

  // Validación de tipo y tamaño (misma lógica que en el cliente).
  const invalid = audioFileError({ name: file.name, type: file.type, size: file.size })
  if (invalid) return { success: false, error: invalid }

  const path = `${clientSlug}/${Date.now()}-${safeAudioName(file.name)}`

  try {
    const admin = createAdminClient()

    const { error: uploadErr } = await admin.storage
      .from(AUDIO_BUCKET)
      .upload(path, file, {
        contentType: file.type || "audio/mpeg",
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadErr) {
      console.error("[uploadClippingAudio] upload error:", uploadErr)
      return { success: false, error: "No se pudo subir el archivo." }
    }

    const { data: publicData } = admin.storage.from(AUDIO_BUCKET).getPublicUrl(path)
    const publicUrl = publicData.publicUrl

    if (clippingId) {
      const { error: updateErr } = await admin
        .from("clippings")
        .update({ audio_url: publicUrl })
        .eq("id", clippingId)
      if (updateErr) {
        console.error("[uploadClippingAudio] update error:", updateErr)
        return {
          success: false,
          error: "Audio subido, pero no se pudo asociar al clipping.",
        }
      }
      revalidatePath("/casos-de-exito")
    }

    return { success: true, url: publicUrl, path }
  } catch (err) {
    console.error("[uploadClippingAudio] throw:", err)
    return { success: false, error: "Ocurrió un error al subir el audio." }
  }
}

/**
 * Borra el audio del Storage y limpia la referencia del clipping.
 * `audioUrl` es opcional: si no hay clipping todavía (alta), solo borra el
 * archivo subido del bucket.
 */
export async function removeClippingAudio(
  clippingId: string | null,
  audioUrl: string,
): Promise<ClippingResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  try {
    const admin = createAdminClient()

    const path = audioPathFromPublicUrl(audioUrl)
    if (path) {
      const { error: removeErr } = await admin.storage.from(AUDIO_BUCKET).remove([path])
      if (removeErr) {
        // No bloquea: igual limpiamos la referencia del clipping.
        console.error("[removeClippingAudio] storage remove error:", removeErr)
      }
    }

    if (clippingId) {
      const { error: updateErr } = await admin
        .from("clippings")
        .update({ audio_url: null, audio_duration_seconds: null })
        .eq("id", clippingId)
      if (updateErr) {
        console.error("[removeClippingAudio] update error:", updateErr)
        return { success: false, error: "No se pudo eliminar el audio." }
      }
      revalidatePath("/casos-de-exito")
    }

    return { success: true }
  } catch (err) {
    console.error("[removeClippingAudio] throw:", err)
    return { success: false, error: "Ocurrió un error al eliminar el audio." }
  }
}

/** Persiste la duración del audio (segundos) calculada en el cliente. */
export async function updateAudioDuration(
  clippingId: string,
  durationSeconds: number,
): Promise<ClippingResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "No autenticado" }

  if (!Number.isFinite(durationSeconds) || durationSeconds < 0 || durationSeconds > 7200) {
    return { success: false, error: "Duración inválida" }
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("clippings")
      .update({ audio_duration_seconds: Math.round(durationSeconds) })
      .eq("id", clippingId)
    if (error) {
      console.error("[updateAudioDuration] error:", error)
      return { success: false, error: "No se pudo guardar la duración." }
    }
  } catch (err) {
    console.error("[updateAudioDuration] throw:", err)
    return { success: false, error: "Ocurrió un error al guardar la duración." }
  }

  revalidatePath("/casos-de-exito")
  return { success: true }
}
