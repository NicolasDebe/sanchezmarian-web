import type { Metadata } from "next"
import { getContentBatch } from "@/lib/content"
import { SEO_PAGE, seoFallbacksFor } from "@/lib/seo-schema"
import { GLOBAL_PAGE, globalFallbacksFor } from "@/lib/global-schema"

/**
 * URL base del sitio. Sin `www` para que coincida con el canonical existente
 * (evita mismatch canonical ↔ OG). Las imágenes OG deben ser ABSOLUTAS.
 */
export const SITE_URL = "https://sanchezmarian.com"

/** Convierte una URL relativa ("/og/x.jpg") en absoluta; deja intactas las http(s). */
export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return ""
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`
}

/** Defaults OG globales (global/metadata), editables desde /admin/edit/global. */
export async function getOgDefaults() {
  return getContentBatch(GLOBAL_PAGE, "metadata", globalFallbacksFor("metadata"))
}

/**
 * Construye el Metadata de una página leyendo su sección SEO editable
 * (page="seo", section=<seoSection>) y combinándola con los defaults OG
 * globales. Resiliente: getContentBatch nunca tira excepción y trae los
 * fallbacks, así que el build jamás rompe por Supabase.
 *
 * - title/description: de la sección SEO de la página (siempre presentes).
 * - imagen al compartir: og_image de la página si está; si no, la global.
 * - emite openGraph + twitter (summary_large_image) con URL de imagen ABSOLUTA.
 */
export async function buildMetadata(
  seoSection: string,
  url?: string,
): Promise<Metadata> {
  const [c, g] = await Promise.all([
    getContentBatch(SEO_PAGE, seoSection, seoFallbacksFor(seoSection)),
    getOgDefaults(),
  ])

  const imageUrl = absoluteUrl(c.og_image?.trim() || g.og_default_image)
  const handle = g.twitter_handle?.trim()

  return {
    title: c.title,
    description: c.description,
    openGraph: {
      title: c.title,
      description: c.description,
      siteName: g.og_site_name,
      locale: "es_AR",
      type: "website",
      ...(url ? { url } : {}),
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: [imageUrl],
      ...(handle ? { creator: handle, site: handle } : {}),
    },
  }
}
