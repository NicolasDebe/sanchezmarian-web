"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase"

export type ConnectionResult = { success: true } | { success: false; error: string }

/** Límite duro del label (misma filosofía que maxChars del CMS de texto). */
const LABEL_MAX = 60

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

/** Revalida el home (única ruta pública que muestra las conexiones) + el admin. */
function revalidate() {
  revalidatePath("/")
  revalidatePath("/admin/conexiones")
}

export async function createConnection(label: string): Promise<ConnectionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }

  const clean = (label ?? "").trim()
  if (!clean) return { success: false, error: "Escribí un nombre para la conexión." }
  if (clean.length > LABEL_MAX)
    return { success: false, error: `El nombre supera el máximo (${clean.length}/${LABEL_MAX}).` }

  try {
    const admin = createAdminClient()

    // Nueva conexión al final: mayor position + 1.
    const { data: maxRow } = await admin
      .from("connections")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await admin.from("connections").insert({
      label: clean,
      is_active: true,
      position: (maxRow?.position ?? -1) + 1,
    })

    if (error) {
      console.error("[createConnection] insert error:", error)
      return { success: false, error: `No se pudo guardar: ${error.message}` }
    }
  } catch (err) {
    console.error("[createConnection] throw:", err)
    return { success: false, error: "Ocurrió un error al guardar. Intentá de nuevo." }
  }

  revalidate()
  return { success: true }
}

export async function deleteConnection(id: string): Promise<ConnectionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }
  if (!id) return { success: false, error: "Falta el identificador." }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from("connections").delete().eq("id", id)
    if (error) return { success: false, error: "No se pudo eliminar. Intentá de nuevo." }
  } catch {
    return { success: false, error: "Ocurrió un error al eliminar. Intentá de nuevo." }
  }

  revalidate()
  return { success: true }
}

export async function toggleConnectionActive(
  id: string,
  isActive: boolean,
): Promise<ConnectionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." }
  if (!id) return { success: false, error: "Falta el identificador." }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from("connections")
      .update({ is_active: isActive })
      .eq("id", id)
    if (error) return { success: false, error: "No se pudo actualizar. Intentá de nuevo." }
  } catch {
    return { success: false, error: "Ocurrió un error al actualizar. Intentá de nuevo." }
  }

  revalidate()
  return { success: true }
}

export async function reorderConnections(orderedIds: string[]): Promise<ConnectionResult> {
  const user = await requireUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, error: "Lista vacía." }
  }

  try {
    const admin = createAdminClient()

    // Un update por fila: Supabase no hace bulk update con valores distintos por
    // fila. Con pocas conexiones va de sobra. Espaciado *10 (deja huecos).
    const results = await Promise.all(
      orderedIds.map((id, idx) =>
        admin
          .from("connections")
          .update({ position: (idx + 1) * 10 })
          .eq("id", id),
      ),
    )

    const failed = results.filter((r) => r.error)
    if (failed.length > 0) {
      console.error("[reorderConnections] updates fallidos:", failed.map((f) => f.error))
      return { success: false, error: "No se pudo guardar el orden. Intentá de nuevo." }
    }
  } catch (err) {
    console.error("[reorderConnections] throw:", err)
    return { success: false, error: "Ocurrió un error al guardar el orden." }
  }

  revalidate()
  return { success: true }
}
