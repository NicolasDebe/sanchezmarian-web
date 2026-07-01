"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase"
import { htmlToPlainText } from "@/lib/rich-text"
import { PAGE_PATHS } from "@/lib/admin-paths"
import { isValidPreset, type DesignSettings, type ScalePresetKey } from "@/lib/design"
import { isValidTextSize, isValidFieldFont } from "@/lib/text-size"
import type { FieldDef, SectionDef } from "@/lib/content-schema"
import { HOME_SECTIONS } from "@/lib/home-schema"
import { SERVICIOS_SECTIONS } from "@/lib/servicios-schema"
import { MIS_VALORES_SECTIONS } from "@/lib/mis-valores-schema"
import { CASOS_SECTIONS } from "@/lib/casos-schema"
import { CONTACTO_SECTIONS } from "@/lib/contacto-schema"
import { GLOBAL_SECTIONS } from "@/lib/global-schema"
import { SEO_SECTIONS } from "@/lib/seo-schema"

const PAGE_DEFAULT = "home"

/** Esquema editable por cada `page`. Sirve para validar límites en el server. */
const SCHEMAS: Record<string, SectionDef[]> = {
  home: HOME_SECTIONS,
  servicios: SERVICIOS_SECTIONS,
  mis_valores: MIS_VALORES_SECTIONS,
  casos_de_exito: CASOS_SECTIONS,
  contacto: CONTACTO_SECTIONS,
  global: GLOBAL_SECTIONS,
  seo: SEO_SECTIONS,
}

/** ¿Este campo usa texto enriquecido (longtext con HTML)? */
function isRichField(f: FieldDef): boolean {
  return f.type === "longtext" && !f.plain
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthState = { error: string } | null

/**
 * Login con email + password. Usado con useActionState desde el form de login.
 * Devuelve { error } si falla, o redirige a /admin/dashboard si tiene éxito.
 */
export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Ingresá tu email y contraseña." }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: "Email o contraseña incorrectos." }
    }
  } catch {
    return { error: "No pudimos conectar. Probá de nuevo en un momento." }
  }

  // redirect() lanza una excepción de control de flujo: va FUERA del try/catch.
  redirect("/admin/dashboard")
}

/** Cierra la sesión y redirige al login. */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Ignoramos: igual mandamos al login.
  }
  redirect("/admin/login")
}

// ─── Guardado de contenido ──────────────────────────────────────────────────

export type SaveResult = { success: true } | { error: string }

/**
 * Guarda los campos de una sección del contenido editable.
 *
 * Flujo por campo:
 *  1. Verifica autenticación (getUser).
 *  2. Lee el valor actual de content_blocks.
 *  3. Si existe, hace backup del valor viejo en content_versions.
 *  4. Upsert del nuevo valor en content_blocks (incrementando version).
 *  5. revalidatePath('/') para refrescar el sitio.
 */
export async function saveContentSection(
  page: string,
  section: string,
  values: Record<string, { value: string; type: string }>,
): Promise<SaveResult> {
  // 1. Auth
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." }
    userId = user.id
  } catch {
    return { error: "No pudimos verificar tu sesión. Intentá de nuevo." }
  }

  // 1.5 Validación de límites (defensa final). Si la page no tiene schema,
  // dejamos pasar (retrocompat con páginas no migradas a maxChars).
  const schema = SCHEMAS[page]
  if (schema) {
    const sectionDef = schema.find((s) => s.section === section)
    if (sectionDef) {
      for (const [field, { value }] of Object.entries(values)) {
        const def = sectionDef.fields.find((f) => f.field === field)
        if (!def || def.maxChars == null) continue
        const len = isRichField(def)
          ? htmlToPlainText(value ?? "").length
          : (value ?? "").length
        if (len > def.maxChars) {
          return {
            error: `El campo «${def.label}» supera el máximo (${len}/${def.maxChars}). Acortalo y guardá de nuevo.`,
          }
        }
      }
    }
  }

  try {
    const admin = createAdminClient()
    const pageKey = page || PAGE_DEFAULT
    const fields = Object.keys(values)

    // 2. Leer valores actuales (de un saque) para hacer backup.
    const { data: current } = await admin
      .from("content_blocks")
      .select("id, field, value, value_long, version")
      .eq("page", pageKey)
      .eq("section", section)
      .in("field", fields)

    const currentByField = new Map(
      (current ?? []).map((row) => [row.field as string, row]),
    )

    // 3. Backup de los valores viejos en content_versions.
    const versionRows = []
    for (const field of fields) {
      const old = currentByField.get(field)
      if (old) {
        versionRows.push({
          content_block_id: old.id,
          value: old.value ?? old.value_long ?? "",
          value_long: old.value_long ?? null,
          version: old.version ?? 1,
          created_by: userId,
        })
      }
    }
    if (versionRows.length > 0) {
      await admin.from("content_versions").insert(versionRows)
    }

    // 4. Upsert de los nuevos valores.
    const upsertRows = fields.map((field) => {
      const old = currentByField.get(field)
      return {
        page: pageKey,
        section,
        field,
        value: values[field].value,
        value_long: null as string | null,
        field_type: values[field].type,
        version: (old?.version ?? 0) + 1,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }
    })

    const { error: upsertError } = await admin
      .from("content_blocks")
      .upsert(upsertRows, { onConflict: "page,section,field" })

    if (upsertError) {
      return { error: "No se pudo guardar. Intentá de nuevo." }
    }
  } catch {
    return { error: "Ocurrió un error al guardar. Intentá de nuevo." }
  }

  // 5. Refrescar el sitio público.
  revalidateForPage(page || PAGE_DEFAULT, section)
  return { success: true }
}

// ─── Tamaños de texto por campo (tabla text_sizes) ────────────────────────────

export type TextSizeEntry = {
  section: string
  field: string
  scale_mobile: string
  scale_desktop: string
}

/**
 * Persiste los tamaños de texto elegidos para campos "resizable" de una página.
 * Aislado de content_blocks: si la tabla text_sizes no existe todavía, devuelve
 * error suave (el guardado de contenido NO se ve afectado). Upsert por
 * (page, section, field). Revalida la ruta pública de la página.
 */
export async function saveTextSizes(
  page: string,
  entries: TextSizeEntry[],
): Promise<SaveResult> {
  let userEmail: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." }
    userEmail = user.email ?? null
  } catch {
    return { error: "No pudimos verificar tu sesión. Intentá de nuevo." }
  }

  if (!Array.isArray(entries) || entries.length === 0) return { success: true }

  // Validación: solo presets conocidos (defensa final).
  for (const e of entries) {
    if (!isValidTextSize(e.scale_mobile) || !isValidTextSize(e.scale_desktop)) {
      return { error: "Tamaño de texto inválido." }
    }
  }

  try {
    const admin = createAdminClient()
    const pageKey = page || PAGE_DEFAULT
    const rows = entries.map((e) => ({
      page: pageKey,
      section: e.section,
      field: e.field,
      scale_mobile: e.scale_mobile,
      scale_desktop: e.scale_desktop,
      updated_at: new Date().toISOString(),
      updated_by: userEmail,
    }))

    const { error } = await admin
      .from("text_sizes")
      .upsert(rows, { onConflict: "page,section,field" })

    if (error) {
      // Tabla inexistente u otro error: no rompemos, informamos suave.
      return { error: "No se pudieron guardar los tamaños (¿falta correr la migración text_sizes?)." }
    }
  } catch {
    return { error: "Ocurrió un error al guardar los tamaños." }
  }

  const path = PAGE_PATHS[page || PAGE_DEFAULT]
  if (path) revalidatePath(path)
  if ((page || PAGE_DEFAULT) === "servicios") revalidatePath("/")
  return { success: true }
}

// ─── Fuentes por campo (tabla field_fonts) ────────────────────────────────────

export type FieldFontEntry = {
  section: string
  field: string
  font: string
}

/**
 * Persiste la fuente elegida para campos "resizable" (SOLO las 3 del sitio, ver
 * FIELD_FONTS). Independiente de text_sizes y content_blocks: si la tabla
 * field_fonts no existe todavía, error suave (nada más se ve afectado). Upsert
 * por (page, section, field). Revalida la ruta pública de la página.
 */
export async function saveFieldFonts(
  page: string,
  entries: FieldFontEntry[],
): Promise<SaveResult> {
  let userEmail: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." }
    userEmail = user.email ?? null
  } catch {
    return { error: "No pudimos verificar tu sesión. Intentá de nuevo." }
  }

  if (!Array.isArray(entries) || entries.length === 0) return { success: true }

  // Validación: solo fuentes conocidas del sitio (defensa final).
  for (const e of entries) {
    if (!isValidFieldFont(e.font)) return { error: "Fuente inválida." }
  }

  try {
    const admin = createAdminClient()
    const pageKey = page || PAGE_DEFAULT
    const rows = entries.map((e) => ({
      page: pageKey,
      section: e.section,
      field: e.field,
      font: e.font,
      updated_at: new Date().toISOString(),
      updated_by: userEmail,
    }))

    const { error } = await admin
      .from("field_fonts")
      .upsert(rows, { onConflict: "page,section,field" })

    if (error) {
      return { error: "No se pudieron guardar las fuentes (¿falta correr la migración field_fonts?)." }
    }
  } catch {
    return { error: "Ocurrió un error al guardar las fuentes." }
  }

  const path = PAGE_PATHS[page || PAGE_DEFAULT]
  if (path) revalidatePath(path)
  if ((page || PAGE_DEFAULT) === "servicios") revalidatePath("/")
  return { success: true }
}

/** Revalida la(s) ruta(s) públicas afectadas por un cambio en (page, section). */
function revalidateForPage(pageKey: string, section: string) {
  if (pageKey === "global") {
    // Nav y Footer aparecen en todas las páginas (comparten el root layout).
    revalidatePath("/", "layout")
  } else if (pageKey === "seo") {
    // El SEO se guarda como page="seo", section=<slug de la página afectada>.
    const path = PAGE_PATHS[section]
    if (path) revalidatePath(path)
  } else {
    const path = PAGE_PATHS[pageKey]
    if (path) revalidatePath(path)
    // La vidriera del home espeja (resumidos) los servicio_01…04 de /servicios,
    // así que un cambio en «servicios» debe revalidar también la home.
    if (pageKey === "servicios") revalidatePath("/")
  }
}

// ─── Deshacer último cambio ───────────────────────────────────────────────────

/** Formatea una fecha ISO al estilo rioplatense: "12/06 a las 15:43". */
function formatBackupDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(",", " a las")
}

export type LastVersionInfo = { exists: false } | { exists: true; date: string }

/**
 * Devuelve la fecha del último backup de una sección (para el modal de undo).
 * No modifica nada: solo informa si hay algo para deshacer y de qué fecha.
 */
export async function getLastVersionDate(
  page: string,
  section: string,
): Promise<LastVersionInfo> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { exists: false }

    const admin = createAdminClient()
    const pageKey = page || PAGE_DEFAULT
    const { data: blocks } = await admin
      .from("content_blocks")
      .select("id")
      .eq("page", pageKey)
      .eq("section", section)
    const ids = (blocks ?? []).map((b) => b.id as string)
    if (ids.length === 0) return { exists: false }

    const { data: versions } = await admin
      .from("content_versions")
      .select("created_at")
      .in("content_block_id", ids)
      .order("created_at", { ascending: false })
      .limit(1)

    const last = versions?.[0]
    if (!last) return { exists: false }
    return { exists: true, date: formatBackupDate(last.created_at as string) }
  } catch {
    return { exists: false }
  }
}

export type RestoreResult =
  | { success: true; values: Record<string, string>; date: string }
  | { error: string }

/**
 * Restaura una sección al estado anterior al último guardado, leyendo el último
 * backup de cada campo en content_versions. El valor actual se respalda ANTES de
 * sobrescribir, así "deshacer" es a su vez deshacible. Revalida el sitio público
 * y devuelve los valores restaurados para que el editor refresque sus campos.
 */
export async function restoreLastVersion(
  page: string,
  section: string,
): Promise<RestoreResult> {
  let userId: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." }
    userId = user.id
  } catch {
    return { error: "No pudimos verificar tu sesión. Intentá de nuevo." }
  }

  try {
    const admin = createAdminClient()
    const pageKey = page || PAGE_DEFAULT

    const { data: blocks } = await admin
      .from("content_blocks")
      .select("id, field, value, value_long, field_type, version")
      .eq("page", pageKey)
      .eq("section", section)
    if (!blocks || blocks.length === 0) {
      return { error: "No hay un cambio anterior para deshacer en esta sección." }
    }

    const ids = blocks.map((b) => b.id as string)
    const { data: versions } = await admin
      .from("content_versions")
      .select("content_block_id, value, value_long, created_at")
      .in("content_block_id", ids)
      .order("created_at", { ascending: false })

    if (!versions || versions.length === 0) {
      return { error: "Todavía no hay un cambio anterior para restaurar." }
    }

    // Último backup por bloque (el primero que aparece dado el orden desc).
    const latest = new Map<string, { value: string | null; value_long: string | null }>()
    for (const v of versions) {
      const key = v.content_block_id as string
      if (!latest.has(key)) {
        latest.set(key, {
          value: v.value as string | null,
          value_long: v.value_long as string | null,
        })
      }
    }
    const refDate = formatBackupDate(versions[0].created_at as string)

    const blockById = new Map(blocks.map((b) => [b.id as string, b]))
    const versionRows: Record<string, unknown>[] = []
    const upsertRows: Record<string, unknown>[] = []
    const restoredValues: Record<string, string> = {}

    for (const [id, ver] of latest) {
      const b = blockById.get(id)
      if (!b) continue
      const restored = ver.value ?? ver.value_long ?? ""
      // Backup del valor ACTUAL antes de pisarlo (undo de undo).
      versionRows.push({
        content_block_id: id,
        value: b.value ?? b.value_long ?? "",
        value_long: b.value_long ?? null,
        version: b.version ?? 1,
        created_by: userId,
      })
      upsertRows.push({
        page: pageKey,
        section,
        field: b.field,
        value: restored,
        value_long: null,
        field_type: b.field_type,
        version: (b.version ?? 0) + 1,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      restoredValues[b.field as string] = restored
    }

    if (versionRows.length > 0) {
      await admin.from("content_versions").insert(versionRows)
    }
    const { error: upsertError } = await admin
      .from("content_blocks")
      .upsert(upsertRows, { onConflict: "page,section,field" })
    if (upsertError) {
      return { error: "No se pudo restaurar. Intentá de nuevo." }
    }

    revalidateForPage(pageKey, section)
    return { success: true, values: restoredValues, date: refDate }
  } catch {
    return { error: "Ocurrió un error al restaurar. Intentá de nuevo." }
  }
}

// ─── Escala tipográfica (/admin/tipografia) ───────────────────────────────────

/**
 * Lee el singleton de `design_settings` (preset mobile + desktop). Si la fila no
 * existe o falla la lectura, cae a "equilibrado" (factor 1.00, diseño base).
 */
export async function getDesignSettings(): Promise<DesignSettings> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from("design_settings")
      .select("text_scale_mobile, text_scale_desktop")
      .eq("singleton_lock", true)
      .single()
    return {
      text_scale_mobile: (data?.text_scale_mobile ?? "equilibrado") as ScalePresetKey,
      text_scale_desktop: (data?.text_scale_desktop ?? "equilibrado") as ScalePresetKey,
    }
  } catch {
    return { text_scale_mobile: "equilibrado", text_scale_desktop: "equilibrado" }
  }
}

export type SaveDesignResult = { ok: true } | { error: string }

/**
 * Persiste los presets mobile/desktop en el singleton de `design_settings`.
 * Respalda el valor previo en `design_settings_history` y revalida todo el
 * sitio (layout) para que la nueva escala se aplique en público.
 */
export async function saveDesignSettings(
  mobile: string,
  desktop: string,
): Promise<SaveDesignResult> {
  // Auth
  let userEmail: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: "Tu sesión expiró. Volvé a iniciar sesión." }
    userEmail = user.email ?? null
  } catch {
    return { error: "No pudimos verificar tu sesión. Intentá de nuevo." }
  }

  // Validación
  if (!isValidPreset(mobile) || !isValidPreset(desktop)) {
    return { error: "Preset inválido." }
  }

  try {
    const admin = createAdminClient()

    // Backup del estado actual antes de pisarlo.
    const { data: current } = await admin
      .from("design_settings")
      .select("text_scale_mobile, text_scale_desktop")
      .eq("singleton_lock", true)
      .single()
    if (current) {
      await admin.from("design_settings_history").insert({
        text_scale_mobile: current.text_scale_mobile,
        text_scale_desktop: current.text_scale_desktop,
        changed_by: userEmail,
      })
    }

    const { error } = await admin
      .from("design_settings")
      .update({
        text_scale_mobile: mobile,
        text_scale_desktop: desktop,
        updated_at: new Date().toISOString(),
        updated_by: userEmail,
      })
      .eq("singleton_lock", true)

    if (error) return { error: "No se pudo guardar. Intentá de nuevo." }

    // Trim del historial a las últimas 100 entradas.
    const { data: oldRows } = await admin
      .from("design_settings_history")
      .select("id")
      .order("changed_at", { ascending: false })
      .range(100, 999)
    if (oldRows && oldRows.length > 0) {
      await admin
        .from("design_settings_history")
        .delete()
        .in("id", oldRows.map((r) => r.id))
    }
  } catch {
    return { error: "Ocurrió un error al guardar. Intentá de nuevo." }
  }

  revalidatePath("/", "layout")
  return { ok: true }
}

export type DesignHistoryRow = {
  id: string
  text_scale_mobile: string
  text_scale_desktop: string
  changed_at: string
  changed_by: string | null
}

/** Últimas N entradas del historial de cambios de tipografía (más recientes primero). */
export async function getDesignHistory(limit = 20): Promise<DesignHistoryRow[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from("design_settings_history")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(limit)
    return (data ?? []) as DesignHistoryRow[]
  } catch {
    return []
  }
}

/** Restablece la escala a "equilibrado/equilibrado" (factor 1.00, diseño base). */
export async function resetDesignToDefault(): Promise<SaveDesignResult> {
  return saveDesignSettings("equilibrado", "equilibrado")
}
