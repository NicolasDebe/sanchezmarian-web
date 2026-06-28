"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase"
import { htmlToPlainText } from "@/lib/rich-text"
import { PAGE_PATHS } from "@/lib/admin-paths"
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
  const pageKey = page || PAGE_DEFAULT
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
  }
  return { success: true }
}
