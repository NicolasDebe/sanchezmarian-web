import { getContentBatch } from "@/lib/content"
import { GLOBAL_PAGE, globalFallbacksFor } from "@/lib/global-schema"

/**
 * Lee el contenido global (Nav + Footer) de Supabase con fallbacks. Se llama en
 * cada page.tsx (server) y se pasa por props a <Nav> y <Footer>. Nunca rompe.
 */
export async function getGlobalContent(): Promise<{
  nav: Record<string, string>
  footer: Record<string, string>
}> {
  const [nav, footer] = await Promise.all([
    getContentBatch(GLOBAL_PAGE, "nav", globalFallbacksFor("nav")),
    getContentBatch(GLOBAL_PAGE, "footer", globalFallbacksFor("footer")),
  ])
  return { nav, footer }
}

/**
 * Copy del NewsletterCard (page="global", section="newsletter"). Editable desde
 * /admin/edit/global. Resiliente: trae los fallbacks del esquema si Supabase falla.
 */
export async function getNewsletterContent(): Promise<Record<string, string>> {
  return getContentBatch(GLOBAL_PAGE, "newsletter", globalFallbacksFor("newsletter"))
}
