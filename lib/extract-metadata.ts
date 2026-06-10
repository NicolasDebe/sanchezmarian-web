/**
 * Extracción de metadata de una nota de prensa a partir de su URL.
 * Usado por el server action de /admin/clippings (que antepone el check de auth)
 * y testeable de forma aislada con scripts.
 *
 * Nunca tira excepción: ante cualquier falla devuelve los campos en null.
 */

import * as cheerio from "cheerio"

export interface UrlMetadata {
  medium: string | null
  title: string | null
  /** yyyy-mm-dd */
  published_at: string | null
}

export const EMPTY_METADATA: UrlMetadata = { medium: null, title: null, published_at: null }

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

/** Normaliza cualquier fecha parseable a yyyy-mm-dd, o null. */
function toIsoDate(raw: string | undefined | null): string | null {
  if (!raw) return null
  // Algunos medios (ej. Mendovoz) publican fechas sin padding ("2026-5-8T16:21:00"),
  // que new Date() rechaza. Las normalizamos directo a yyyy-mm-dd.
  const loose = raw.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})([T\s]|$)/)
  if (loose) {
    return `${loose[1]}-${loose[2].padStart(2, "0")}-${loose[3].padStart(2, "0")}`
  }
  const d = new Date(raw)
  if (isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  if (!isHttpUrl(url)) return EMPTY_METADATA

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    let html: string
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        },
      })
      if (!res.ok) return EMPTY_METADATA
      html = await res.text()
    } finally {
      clearTimeout(timer)
    }

    const $ = cheerio.load(html)
    const meta = (selector: string) => $(selector).first().attr("content")?.trim() || null

    let medium =
      meta('meta[property="og:site_name"]') ?? meta('meta[name="application-name"]')
    let title = meta('meta[property="og:title"]') ?? ($("title").first().text().trim() || null)
    let published =
      toIsoDate(meta('meta[property="article:published_time"]')) ??
      toIsoDate(meta('meta[property="og:updated_time"]')) ??
      toIsoDate(meta('meta[name="date"]'))

    // JSON-LD (NewsArticle): suele tener datePublished y publisher.name.
    if (!published || !medium) {
      $('script[type="application/ld+json"]').each((_, el) => {
        if (published && medium) return
        try {
          const parsed = JSON.parse($(el).text())
          const nodes = Array.isArray(parsed) ? parsed : (parsed["@graph"] ?? [parsed])
          for (const node of nodes) {
            if (!node || typeof node !== "object") continue
            if (!published) published = toIsoDate(node.datePublished ?? node.dateCreated)
            if (!medium && typeof node.publisher === "object" && node.publisher?.name) {
              medium = String(node.publisher.name).trim() || null
            }
            if (!title && node.headline) title = String(node.headline).trim() || null
          }
        } catch {
          // JSON-LD malformado: se ignora.
        }
      })
    }

    return { medium, title, published_at: published }
  } catch {
    return EMPTY_METADATA
  }
}
