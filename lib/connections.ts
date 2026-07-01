import { supabase } from "@/lib/supabase"

/**
 * Sección CONEXIONES del home — alianzas/disciplinas con las que se lleva a cabo
 * cada proyecto. CRUD dinámico (tabla `connections`), NO content_blocks de texto
 * fijo. La lectura pública es resiliente: si Supabase falla o la tabla aún no
 * existe, se devuelven los valores semilla para que el sitio nunca se rompa.
 */

export interface Connection {
  id: string
  label: string
  is_active: boolean
  position: number
}

/** Valores iniciales, en orden. Fuente del seed y del fallback público. */
export const CONNECTIONS_SEED: string[] = [
  "Marketing y ventas",
  "Producción audiovisual",
  "Programación",
  "Automatización",
  "Diseño",
  "Redes sociales",
  "Recursos Humanos",
  "Locución",
]

/** Fallback para el público: los labels semilla como conexiones activas. */
function fallbackConnections(): Pick<Connection, "id" | "label">[] {
  return CONNECTIONS_SEED.map((label, i) => ({ id: `seed-${i}`, label }))
}

/**
 * Conexiones ACTIVAS para el sitio público, ordenadas por `position`.
 * Nunca tira excepción: ante cualquier error o lista vacía cae al fallback.
 */
export async function getActiveConnections(): Promise<Pick<Connection, "id" | "label">[]> {
  try {
    const { data, error } = await supabase
      .from("connections")
      .select("id, label")
      .eq("is_active", true)
      .order("position", { ascending: true })

    if (error || !data || data.length === 0) return fallbackConnections()
    return data as Pick<Connection, "id" | "label">[]
  } catch {
    return fallbackConnections()
  }
}
