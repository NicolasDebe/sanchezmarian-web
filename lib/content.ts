import { supabase } from "@/lib/supabase"

/**
 * Helpers de lectura pública de contenido editable.
 *
 * REGLAS CRÍTICAS:
 *  - Usan el cliente legacy de lib/supabase.ts (anon key) — NO el server client
 *    de @supabase/ssr (ese es solo para el admin).
 *  - NUNCA tiran excepción. Si Supabase falla por cualquier razón, devuelven el
 *    fallback hardcodeado. El build de Vercel jamás puede romper por Supabase.
 */

interface GetContentArgs {
  page: string
  section: string
  field: string
  fallback: string
}

/**
 * Lee un único campo de content_blocks. Devuelve el fallback ante cualquier
 * error o si el campo no existe / está vacío.
 */
export async function getContent({
  page,
  section,
  field,
  fallback,
}: GetContentArgs): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("value, value_long")
      .eq("page", page)
      .eq("section", section)
      .eq("field", field)
      .maybeSingle()

    if (error || !data) return fallback
    const value = data.value_long ?? data.value
    return value != null && value !== "" ? value : fallback
  } catch {
    return fallback
  }
}

/**
 * Lee todos los campos de una sección de una sola vez.
 * Devuelve un Record<field, string> con los fallbacks para los campos que no
 * existan en la base. NUNCA tira excepción.
 */
export async function getContentBatch(
  page: string,
  section: string,
  fallbacks: Record<string, string>,
): Promise<Record<string, string>> {
  // Arrancamos con los fallbacks: si algo falla, ya está cubierto.
  const result: Record<string, string> = { ...fallbacks }

  try {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("field, value, value_long")
      .eq("page", page)
      .eq("section", section)

    if (error || !data) return result

    for (const row of data) {
      const value = row.value_long ?? row.value
      // Solo pisamos el fallback si el campo está en el esquema y trae contenido.
      if (row.field in result && value != null && value !== "") {
        result[row.field] = value
      }
    }
    return result
  } catch {
    return result
  }
}
