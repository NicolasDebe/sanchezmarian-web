"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase"
import { SCOPES, FORMATS, type ClippingScope, type ClippingFormat } from "@/lib/clippings"
import {
  fetchUrlMetadata,
  isHttpUrl,
  EMPTY_METADATA,
  type UrlMetadata,
} from "@/lib/extract-metadata"

export type ClippingResult = { success: true } | { success: false; error: string }

export interface ClippingInput {
  client_id: string
  medium: string
  title: string
  /** yyyy-mm-dd */
  published_at: string
  scope: ClippingScope
  format: ClippingFormat
  url: string
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
  if (!isHttpUrl(data.url ?? "")) return "La URL debe empezar con http:// o https://."
  return null
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
      url: data.url.trim(),
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
        url: data.url.trim(),
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

export type { UrlMetadata }

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
