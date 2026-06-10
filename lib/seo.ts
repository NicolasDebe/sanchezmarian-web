import type { Metadata } from "next"
import { getContentBatch } from "@/lib/content"
import { SEO_PAGE, seoFallbacksFor } from "@/lib/seo-schema"

/**
 * Construye el objeto Metadata de una página leyendo su sección SEO editable
 * (page="seo", section=<seoSection>). Resiliente: getContentBatch nunca tira
 * excepción y ya trae los fallbacks, así que el build jamás rompe por Supabase.
 */
export async function buildMetadata(
  seoSection: string,
  url?: string,
): Promise<Metadata> {
  const c = await getContentBatch(SEO_PAGE, seoSection, seoFallbacksFor(seoSection))
  return {
    title: c.title,
    description: c.description,
    openGraph: {
      title: c.title,
      description: c.description,
      ...(url ? { url } : {}),
    },
  }
}
