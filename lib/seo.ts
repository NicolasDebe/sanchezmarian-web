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
 * Prepara una imagen para compartir (og:image). Si es una URL pública de
 * Supabase Storage, la pasa por el endpoint de transformación de Supabase
 * Image (render/image) para servirla a 1200×630, recorte centrado y calidad
 * 80. CLAVE para WhatsApp: el original (subido como .webp por el PhotoManager)
 * puede pesar >1MB, y WhatsApp descarta sin avisar cualquier og:image >600KB.
 * La versión transformada ronda los ~180KB en JPEG (formato que WhatsApp sí
 * muestra). Cualquier otra URL (p. ej. /og/default.jpg local) se devuelve
 * absoluta tal cual.
 */
export function ogImageUrl(pathOrUrl: string): string {
  const url = absoluteUrl(pathOrUrl)
  if (!url) return ""
  if (!url.includes(STORAGE_PUBLIC_PREFIX)) return url

  const transformed = url.replace(STORAGE_PUBLIC_PREFIX, "/storage/v1/render/image/public/")
  const sep = transformed.includes("?") ? "&" : "?"
  return `${transformed}${sep}width=1200&height=630&resize=cover&quality=80`
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
