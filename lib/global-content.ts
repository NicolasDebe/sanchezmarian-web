import { getContentBatch, getTextScales } from "@/lib/content"
import { GLOBAL_PAGE, globalFallbacksFor } from "@/lib/global-schema"
import type { FieldScaleMap } from "@/lib/text-size"

/**
 * Lee el contenido global (Nav + Footer) de Supabase con fallbacks. Se llama en
 * cada page.tsx (server) y se pasa por props a <Nav> y <Footer>. Nunca rompe.
 */
export async function getGlobalContent(): Promise<{
  nav: Record<string, string>
  footer: Record<string, string>
  scales: FieldScaleMap
}> {
  const [nav, footer, scales] = await Promise.all([
    getContentBatch(GLOBAL_PAGE, "nav", globalFallbacksFor("nav")),
    getContentBatch(GLOBAL_PAGE, "footer", globalFallbacksFor("footer")),
    // Tamaños/fuentes por campo de los bloques globales (nav, footer, newsletter).
    getGlobalScales(),
  ])
  return { nav, footer, scales }
}

/**
 * Copy del NewsletterCard (page="global", section="newsletter"). Editable desde
 * /admin/edit/global. Resiliente: trae los fallbacks del esquema si Supabase falla.
 */
export async function getNewsletterContent(): Promise<Record<string, string>> {
  return getContentBatch(GLOBAL_PAGE, "newsletter", globalFallbacksFor("newsletter"))
}

/** Tamaños/fuentes por campo de page="global". Nunca tira excepción. */
export async function getGlobalScales(): Promise<FieldScaleMap> {
  return getTextScales(GLOBAL_PAGE)
}
