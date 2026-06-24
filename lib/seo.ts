import type { Metadata } from "next"
import { getContentBatch } from "@/lib/content"
import { SEO_PAGE, seoFallbacksFor } from "@/lib/seo-schema"
import { GLOBAL_PAGE, globalFallbacksFor } from "@/lib/global-schema"

/**
 * URL base del sitio. CON `www`: es el dominio canónico real (el apex
 * sanchezmarian.com hace 307 → www.sanchezmarian.com en Vercel). Usar www
 * evita un salto de redirect en og:url/canonical y que los scrapers de OG
 * (FB/Twitter/LinkedIn) tengan que seguir el redirect de la imagen.
 * Las imágenes OG deben ser ABSOLUTAS.
 */
export const SITE_URL = "https://www.sanchezmarian.com"

/** Convierte una URL relativa ("/og/x.jpg") en absoluta; deja intactas las http(s). */
export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return ""
  return pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`
}

const STORAGE_PUBLIC_PREFIX = "/storage/v1/object/public/"

/**
 * Prepara una imagen para compartir (og:image) garantizando que pese <600KB
 * (límite duro de WhatsApp, que descarta sin avisar cualquier imagen mayor) y
 * que se sirva como JPEG (formato que WhatsApp sí muestra). Hay dos orígenes:
 *
 * 1. Supabase Storage (fotos subidas con el PhotoManager, suelen ser .webp de
 *    >1MB) → pasa por el transform endpoint de Supabase Image (render/image)
 *    a 1200×630 cover, calidad 80 → JPEG ~150-200KB.
 * 2. Imágenes locales de /public/images/* (las campañas del seed referencian
 *    fotos del repo, algunas de 2-3MB) → pasa por el optimizador de Next
 *    (/_next/image) a 1200px de ancho, calidad 75 → JPEG ~30-100KB. Con un
 *    Accept sin webp (como mandan los scrapers de WhatsApp/Facebook) Next
 *    devuelve JPEG.
 *
 * Cualquier otra URL (p. ej. /og/default.jpg, ya optimizada a 66KB) se
 * devuelve absoluta tal cual.
 */
export function ogImageUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return ""

  if (pathOrUrl.includes(STORAGE_PUBLIC_PREFIX)) {
    const transformed = absoluteUrl(pathOrUrl).replace(
      STORAGE_PUBLIC_PREFIX,
      "/storage/v1/render/image/public/",
    )
    const sep = transformed.includes("?") ? "&" : "?"
    return `${transformed}${sep}width=1200&height=630&resize=cover&quality=80`
  }

  if (pathOrUrl.startsWith("/images/")) {
    return `${SITE_URL}/_next/image?url=${encodeURIComponent(pathOrUrl)}&w=1200&q=75`
  }

  return absoluteUrl(pathOrUrl)
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

  const imageUrl = ogImageUrl(c.og_image?.trim() || g.og_default_image)
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
