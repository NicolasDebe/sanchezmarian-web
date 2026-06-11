"use server"

import { revalidatePath } from "next/cache"
import slugify from "slugify"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase"
import { legacyStatus, type CampaignStatus } from "@/lib/types/campaign"

const BUCKET = "campaign-images"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"]
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const MIGRATION_HINT =
  "La base todavía no acepta borradores. Pedile a Nico que corra la migración " +
  "supabase/migrations/20260611_campaigns_status.sql en el SQL Editor de Supabase."

export interface CampaignInput {
  title: string
  brand: string
  description: string
  content: string
  slug?: string
  status: CampaignStatus
  date: string
}

export interface StagedImage {
  url: string
  path?: string
  alt?: string
}

export type ActionResult<T = object> =
  | ({ success: true } & T)
  | { success: false; error: string }

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

function makeSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: "es", trim: true })
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function validateInput(data: CampaignInput): string | null {
  const title = data.title?.trim() ?? ""
  if (title.length < 5 || title.length > 100)
    return "El título tiene que tener entre 5 y 100 caracteres."
  if (!data.brand?.trim()) return "Completá la marca o cliente."
  const desc = data.description?.trim() ?? ""
  if (desc.length < 50 || desc.length > 200)
    return "La descripción corta tiene que tener entre 50 y 200 caracteres."
  if (stripHtml(data.content ?? "").length < 100)
    return "El contenido expandido tiene que tener al menos 100 caracteres."
  if (!["draft", "active", "finished"].includes(data.status))
    return "El estado no es válido."
  if (!data.date?.trim()) return "Completá la fecha."
  if (data.slug && !SLUG_RE.test(data.slug))
    return "El slug solo puede tener minúsculas, números y guiones."
  return null
}

/** Slug único: si ya existe, prueba con -2, -3, ... */
async function uniqueSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const admin = createAdminClient()
  let query = admin.from("campaigns").select("id, slug").like("slug", `${base}%`)
  if (excludeId) query = query.neq("id", excludeId)
  const { data } = await query
  const taken = new Set((data ?? []).map((r) => r.slug as string))
  if (!taken.has(base)) return base
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`
    if (!taken.has(candidate)) return candidate
  }
}

/**
 * Inserta/actualiza manejando el CHECK constraint legacy: hasta que se corra
 * la migración, la base solo acepta 'ACTIVA'/'FINALIZADA'. Si rechaza el valor
 * canónico, se reintenta con el legacy; los borradores no tienen equivalente.
 */
function isCheckViolation(error: { code?: string } | null): boolean {
  return error?.code === "23514"
}

function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length))
}

// ─── 4.1 createCampaign ───────────────────────────────────────────────────────

export async function createCampaign(
  data: CampaignInput,
  images: StagedImage[] = [],
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  const invalid = validateInput(data)
  if (invalid) return { success: false, error: invalid }

  if (data.status !== "draft" && images.length === 0)
    return { success: false, error: "Necesitás al menos una foto para publicar." }

  try {
    const admin = createAdminClient()
    const base = data.slug?.trim() || makeSlug(data.title)
    if (!base) return { success: false, error: "No se pudo generar el slug desde el título." }
    const slug = await uniqueSlug(base)

    const payload = {
      slug,
      brand: data.brand.trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      content: data.content,
      status: data.status as string,
      date: data.date.trim(),
    }

    let { data: inserted, error } = await admin
      .from("campaigns")
      .insert(payload)
      .select()
      .single()

    if (isCheckViolation(error)) {
      const legacy = legacyStatus(data.status)
      if (!legacy) return { success: false, error: MIGRATION_HINT }
      const retry = await admin
        .from("campaigns")
        .insert({ ...payload, status: legacy })
        .select()
        .single()
      inserted = retry.data
      error = retry.error
    }

    if (error || !inserted)
      return { success: false, error: "No se pudo guardar la campaña. Intentá de nuevo." }

    if (images.length > 0) {
      const rows = images.map((img, i) => ({
        campaign_id: inserted.id,
        url: img.url,
        alt: img.alt?.trim() || data.title.trim(),
        position: i,
      }))
      const { error: imgErr } = await admin.from("campaign_images").insert(rows)
      if (imgErr)
        return {
          success: false,
          error: "La campaña se guardó pero las fotos no se pudieron asociar. Editala para reintentarlo.",
        }
    }

    revalidatePath("/campanas")
    revalidatePath(`/campanas/${slug}`)
    return { success: true, slug }
  } catch {
    return { success: false, error: "Ocurrió un error al guardar. Intentá de nuevo." }
  }
}

// ─── 4.2 updateCampaign ───────────────────────────────────────────────────────

export async function updateCampaign(
  id: string,
  data: CampaignInput,
): Promise<ActionResult<{ slug: string }>> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  const invalid = validateInput(data)
  if (invalid) return { success: false, error: invalid }

  try {
    const admin = createAdminClient()

    const { data: current } = await admin
      .from("campaigns")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle()
    if (!current) return { success: false, error: "La campaña ya no existe." }

    if (data.status !== "draft") {
      const { count } = await admin
        .from("campaign_images")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", id)
      if ((count ?? 0) === 0)
        return { success: false, error: "Necesitás al menos una foto para publicar." }
    }

    let slug = current.slug as string
    if (data.slug && data.slug !== current.slug) {
      const { data: clash } = await admin
        .from("campaigns")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", id)
        .maybeSingle()
      if (clash) return { success: false, error: "Ese slug ya está en uso por otra campaña." }
      slug = data.slug
    }

    const payload = {
      slug,
      brand: data.brand.trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      content: data.content,
      status: data.status as string,
      date: data.date.trim(),
      updated_at: new Date().toISOString(),
    }

    let { error } = await admin.from("campaigns").update(payload).eq("id", id)

    if (isCheckViolation(error)) {
      const legacy = legacyStatus(data.status)
      if (!legacy) return { success: false, error: MIGRATION_HINT }
      const retry = await admin
        .from("campaigns")
        .update({ ...payload, status: legacy })
        .eq("id", id)
      error = retry.error
    }

    if (error) return { success: false, error: "No se pudo guardar. Intentá de nuevo." }

    revalidatePath("/campanas")
    revalidatePath(`/campanas/${current.slug}`)
    if (slug !== current.slug) revalidatePath(`/campanas/${slug}`)
    return { success: true, slug }
  } catch {
    return { success: false, error: "Ocurrió un error al guardar. Intentá de nuevo." }
  }
}

// ─── 4.3 deleteCampaign ───────────────────────────────────────────────────────

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  try {
    const admin = createAdminClient()

    const { data: campaign } = await admin
      .from("campaigns")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle()
    if (!campaign) return { success: false, error: "La campaña ya no existe." }

    // Fotos del bucket primero (las legacy en /images/ no están en Storage).
    const { data: imgs } = await admin
      .from("campaign_images")
      .select("url")
      .eq("campaign_id", id)

    const paths = (imgs ?? [])
      .map((i) => storagePathFromUrl(i.url as string))
      .filter((p): p is string => !!p)

    // También lo que quede colgado en la carpeta del slug.
    const { data: folder } = await admin.storage.from(BUCKET).list(campaign.slug as string)
    for (const f of folder ?? []) paths.push(`${campaign.slug}/${f.name}`)

    if (paths.length > 0) {
      await admin.storage.from(BUCKET).remove([...new Set(paths)])
    }

    // Por si el FK no tiene cascade, borramos las filas de imágenes explícitamente.
    await admin.from("campaign_images").delete().eq("campaign_id", id)
    const { error } = await admin.from("campaigns").delete().eq("id", id)
    if (error) return { success: false, error: "No se pudo eliminar. Intentá de nuevo." }

    revalidatePath("/campanas")
    revalidatePath(`/campanas/${campaign.slug}`)
    return { success: true }
  } catch {
    return { success: false, error: "Ocurrió un error al eliminar. Intentá de nuevo." }
  }
}

// ─── 4.4 uploadCampaignImage ──────────────────────────────────────────────────

/**
 * Sube una foto al bucket. Si viene campaignId (modo edición) también inserta
 * la fila en campaign_images; si no (campaña nueva, todavía sin fila en la
 * base), devuelve url+path y las filas se crean en createCampaign.
 */
export async function uploadCampaignImage(
  formData: FormData,
): Promise<ActionResult<{ url: string; path: string; id?: string }>> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  try {
    const file = formData.get("file") as File | null
    const slug = (formData.get("slug") as string | null)?.trim()
    const campaignId = (formData.get("campaignId") as string | null)?.trim() || undefined

    if (!file || !slug) return { success: false, error: "Falta el archivo o el slug." }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT.includes(ext))
      return { success: false, error: "Formato no soportado. Usá JPG, PNG o WebP." }
    if (file.size > MAX_FILE_SIZE)
      return { success: false, error: "La foto pesa más de 5MB. Comprimila e intentá de nuevo." }

    const safeName = makeSlug(file.name.replace(/\.[^.]+$/, "")).slice(0, 40) || "foto"
    const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`

    const admin = createAdminClient()
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (upErr) return { success: false, error: "No se pudo subir la foto. Intentá de nuevo." }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
    const url = pub.publicUrl

    if (!campaignId) return { success: true, url, path }

    const { data: maxRow } = await admin
      .from("campaign_images")
      .select("position")
      .eq("campaign_id", campaignId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: row, error: insErr } = await admin
      .from("campaign_images")
      .insert({
        campaign_id: campaignId,
        url,
        alt: "",
        position: (maxRow?.position ?? -1) + 1,
      })
      .select()
      .single()

    if (insErr || !row) {
      await admin.storage.from(BUCKET).remove([path])
      return { success: false, error: "No se pudo registrar la foto. Intentá de nuevo." }
    }

    revalidatePath("/campanas")
    return { success: true, url, path, id: row.id as string }
  } catch {
    return { success: false, error: "Ocurrió un error al subir la foto. Intentá de nuevo." }
  }
}

// ─── 4.5 deleteCampaignImage ──────────────────────────────────────────────────

export async function deleteCampaignImage(imageId: string): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  try {
    const admin = createAdminClient()

    const { data: img } = await admin
      .from("campaign_images")
      .select("id, campaign_id, url")
      .eq("id", imageId)
      .maybeSingle()
    if (!img) return { success: true } // ya no existe

    const path = storagePathFromUrl(img.url as string)
    if (path) await admin.storage.from(BUCKET).remove([path])

    const { error } = await admin.from("campaign_images").delete().eq("id", imageId)
    if (error) return { success: false, error: "No se pudo eliminar la foto. Intentá de nuevo." }

    // Compactar posiciones (0..n sin huecos).
    const { data: rest } = await admin
      .from("campaign_images")
      .select("id, position")
      .eq("campaign_id", img.campaign_id)
      .order("position", { ascending: true })

    for (const [i, r] of (rest ?? []).entries()) {
      if (r.position !== i) {
        await admin.from("campaign_images").update({ position: i }).eq("id", r.id)
      }
    }

    revalidatePath("/campanas")
    return { success: true }
  } catch {
    return { success: false, error: "Ocurrió un error al eliminar la foto. Intentá de nuevo." }
  }
}

// ─── updateImageAlt ───────────────────────────────────────────────────────────

export async function updateImageAlt(
  imageId: string,
  alt: string,
): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  const clean = alt.trim()
  if (clean.length > 200)
    return { success: false, error: "El texto alternativo no puede superar los 200 caracteres." }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("campaign_images")
      .update({ alt: clean })
      .eq("id", imageId)
    if (error)
      return { success: false, error: "No se pudo guardar el texto alternativo. Intentá de nuevo." }
    return { success: true }
  } catch {
    return { success: false, error: "Ocurrió un error al guardar. Intentá de nuevo." }
  }
}

// ─── reorderImages ────────────────────────────────────────────────────────────

/**
 * Reordena las fotos de una campaña: position = índice en orderedIds.
 * supabase-js no expone transacciones, así que se usa un upsert en batch
 * (una sola sentencia) con las filas completas.
 */
export async function reorderImages(
  campaignId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  try {
    const admin = createAdminClient()

    const { data: campaign } = await admin
      .from("campaigns")
      .select("slug")
      .eq("id", campaignId)
      .maybeSingle()
    if (!campaign) return { success: false, error: "La campaña ya no existe." }

    const { data: rows } = await admin
      .from("campaign_images")
      .select("id, campaign_id, url, alt")
      .eq("campaign_id", campaignId)
    const byId = new Map((rows ?? []).map((r) => [r.id as string, r]))

    if (orderedIds.length !== byId.size || orderedIds.some((id) => !byId.has(id)))
      return {
        success: false,
        error: "El orden no coincide con las fotos guardadas. Recargá la página e intentá de nuevo.",
      }

    const upserts = orderedIds.map((id, i) => ({ ...byId.get(id)!, position: i }))
    const { error } = await admin.from("campaign_images").upsert(upserts)
    if (error) return { success: false, error: "No se pudo guardar el orden. Intentá de nuevo." }

    revalidatePath("/campanas")
    revalidatePath(`/campanas/${campaign.slug}`)
    return { success: true }
  } catch {
    return { success: false, error: "Ocurrió un error al reordenar. Intentá de nuevo." }
  }
}

/** Foto staged de una campaña que todavía no se guardó: solo borra el archivo. */
export async function deleteStagedImage(path: string): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }
  try {
    const admin = createAdminClient()
    await admin.storage.from(BUCKET).remove([path])
    return { success: true }
  } catch {
    return { success: false, error: "No se pudo eliminar la foto." }
  }
}

// ─── 4.6 checkSlugAvailability ────────────────────────────────────────────────

export async function checkSlugAvailability(
  slug: string,
  excludeId?: string,
): Promise<{ available: boolean; reason?: string }> {
  const user = await requireUser()
  if (!user) return { available: false, reason: "Sesión expirada." }

  const clean = slug.trim()
  if (!SLUG_RE.test(clean))
    return { available: false, reason: "Solo minúsculas, números y guiones." }

  try {
    const admin = createAdminClient()
    let query = admin.from("campaigns").select("id").eq("slug", clean)
    if (excludeId) query = query.neq("id", excludeId)
    const { data } = await query.maybeSingle()
    return data
      ? { available: false, reason: "Ya está en uso por otra campaña." }
      : { available: true }
  } catch {
    return { available: false, reason: "No se pudo verificar. Intentá de nuevo." }
  }
}
