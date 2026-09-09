"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  publishTestimonial,
  rejectTestimonial,
  unpublishTestimonial,
} from "@/lib/testimonials"

/**
 * Acciones del panel de moderación de reseñas.
 *
 * OJO: las funciones de lib/testimonials.ts escriben con el service role, que
 * se saltea la RLS. La única barrera es el chequeo de sesión de acá, así que
 * NINGUNA acción puede tocar la base antes de pasar por `requireAdminEmail`.
 * (proxy.ts ya protege /admin/*, pero un server action se puede invocar por
 * POST directo sin pasar por la página: la defensa tiene que estar en la acción.)
 *
 * El `adminEmail` que queda registrado en la fila sale de la sesión, con
 * `getUser()` —que valida el token contra Supabase— y NUNCA de un parámetro
 * mandado por el cliente: si viniera del browser, cualquiera podría firmar una
 * moderación con el mail de otra persona.
 *
 * Lo que NO hay acá, a propósito: editar el texto, el puntaje o los datos del
 * autor, y borrar filas. El contenido de una reseña es inmutable; si no va, se
 * rechaza y queda el registro.
 */

export type ModerationActionResult =
  | { success: true }
  | { success: false; error: string }

const NO_SESSION: ModerationActionResult = {
  success: false,
  error: "Se cerró la sesión. Volvé a entrar para seguir moderando.",
}

/** Mail del admin logueado, o null si no hay sesión. Queda en `moderated_by`. */
async function requireAdminEmail(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user?.email ?? null
  } catch {
    return null
  }
}

/**
 * Las tres rutas que muestran reseñas publicadas. Cualquier cambio de estado
 * altera lo que se ve en todas: /resenas es la lista completa, y el bloque de
 * adelanto está en el home y al final de /servicios.
 */
function revalidateResenas() {
  revalidatePath("/resenas")
  revalidatePath("/")
  revalidatePath("/servicios")
}

/** Publica una reseña, venga de la cola de revisión o de una rechazada. */
export async function publicarResena(
  id: string,
): Promise<ModerationActionResult> {
  const email = await requireAdminEmail()
  if (!email) return NO_SESSION

  const result = await publishTestimonial(id, email)
  if (!result.ok) return { success: false, error: result.error }

  revalidateResenas()
  return { success: true }
}

/**
 * Rechaza una reseña que estaba esperando revisión. Decisión tomada: no se
 * publica. `note` es el motivo (obligatorio, mínimo validado en el lib) y es de
 * uso interno: no se muestra en público ni se le manda al autor.
 */
export async function rechazarResena(
  id: string,
  note: string,
): Promise<ModerationActionResult> {
  const email = await requireAdminEmail()
  if (!email) return NO_SESSION

  const result = await rejectTestimonial(id, note, email)
  if (!result.ok) return { success: false, error: result.error }

  revalidateResenas()
  return { success: true }
}

/**
 * Baja del sitio una reseña publicada y la devuelve a la cola de revisión.
 * No es un rechazo: la decisión queda abierta y la reseña vuelve a contar en el
 * badge de pendientes.
 */
export async function despublicarResena(
  id: string,
  note: string,
): Promise<ModerationActionResult> {
  const email = await requireAdminEmail()
  if (!email) return NO_SESSION

  const result = await unpublishTestimonial(id, note, email)
  if (!result.ok) return { success: false, error: result.error }

  revalidateResenas()
  return { success: true }
}
