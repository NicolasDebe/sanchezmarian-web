"use server"

import { createClient } from "@supabase/supabase-js"

export type CreateLeadResult =
  | { success: true }
  | { success: false; error: string }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

/**
 * Alta de un lead (nombre + email) desde el NewsletterCard. Valida en el server,
 * normaliza el email e inserta con el service role (bypass RLS). Sin source, sin
 * estado, sin doble opt-in: captura simple.
 */
export async function createLead(
  nombre: string,
  email: string,
): Promise<CreateLeadResult> {
  if (!nombre?.trim()) {
    return { success: false, error: "Ingresá tu nombre" }
  }

  if (!email?.trim()) {
    return { success: false, error: "Ingresá tu email" }
  }

  if (!isValidEmail(email.trim())) {
    return { success: false, error: "El email no es válido" }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("[leads] Faltan env vars")
    return { success: false, error: "Error de configuración del servidor" }
  }

  const admin = createClient(url, key, { auth: { persistSession: false } })

  const { error } = await admin.from("leads").insert({
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
  })

  if (error) {
    console.error("[createLead] supabase insert error:", error)
    return { success: false, error: "No se pudo registrar. Probá de nuevo." }
  }

  return { success: true }
}
