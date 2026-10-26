/**
 * Índice del buscador global (lupa del nav).
 *
 * Arma UN array plano de documentos con todo el contenido público del sitio:
 * campañas, gacetillas, reseñas y las páginas institucionales. El filtrado NO
 * pasa por acá: se hace en el browser con lib/search-match.ts, así escribir en
 * el buscador es instantáneo y no hay una request por tecla.
 *
 * REGLA CRÍTICA (igual que lib/content.ts y lib/campaigns.ts): NUNCA tira
 * excepción. Cada fuente va en su propio try/catch y cae a [] por separado, así
 * que si Supabase falla el buscador queda incompleto pero jamás rompe la página
 * ni el build de Vercel.
 *
 * QUÉ NO SE INDEXA, a propósito:
 *  - `leads` (privada), `author_email` de las reseñas y todo lo que la RLS de
 *    20260908_testimonials.sql no expone con la anon key.
 *  - las páginas `seo` y `global` de content_blocks (metadata, nav, footer):
 *    no son contenido navegable, solo ensucian los resultados.
 *  - `content_versions`, `text_sizes`, `field_fonts`, `design_settings`.
 */

import { supabase } from "@/lib/supabase"
import { getPublicCampaigns } from "@/lib/campaigns"
import { getClientsWithClippings, clippingYear } from "@/lib/clippings"
import { getPublishedTestimonials } from "@/lib/testimonials"
import { findClient } from "@/lib/client-logos"
import { htmlToPlainText } from "@/lib/rich-text"
import { PAGE_PATHS } from "@/lib/admin-paths"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type SearchKind = "campana" | "gacetilla" | "resena" | "pagina"

export interface SearchDoc {
  id: string
  kind: SearchKind
  /** Lo que se lee grande en el resultado. */
  title: string
  /** Cliente / medio / autor / bajada de la página. */
  subtitle: string
  /** Texto extra indexado pero no destacado en la fila. */
  body: string
  href: string
  /** Año, fecha o alcance: va a la derecha de la fila, en mono. */
  meta?: string
  /** true = abre en pestaña nueva (gacetillas que apuntan a un medio). */
  external?: boolean
}

export const KIND_LABELS: Record<SearchKind, string> = {
  campana: "Campañas",
  gacetilla: "Gacetillas",
  resena: "Reseñas",
  pagina: "Páginas",
}

/** Orden en que se muestran los grupos de resultados. */
export const KIND_ORDER: SearchKind[] = ["campana", "gacetilla", "resena", "pagina"]

/**
 * Tope de texto indexado por documento. Alcanza para que el matcher encuentre
 * cualquier término del cuerpo sin inflar el JSON que baja el browser.
 */
const BODY_MAX = 600

function clamp(text: string, max = BODY_MAX): string {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

// ─── Páginas institucionales ──────────────────────────────────────────────────

/**
 * Las páginas que se indexan, con el nombre con el que se muestran. Las claves
 * son los `page` de content_blocks; `seo` y `global` quedan deliberadamente
 * afuera. El href sale de PAGE_PATHS (lib/admin-paths.ts), que ya es la fuente
 * de verdad de página → ruta.
 */
const INDEXED_PAGES: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: "Inicio",
    subtitle: "Comunicación estratégica en Mendoza",
  },
  servicios: {
    title: "Servicios",
    subtitle: "Qué hago y cómo trabajo",
  },
  mis_valores: {
    title: "Mis valores",
    subtitle: "Quién soy y en qué creo",
  },
  casos_de_exito: {
    title: "Casos de éxito",
    subtitle: "Repercusión en medios",
  },
  contacto: {
    title: "Contacto",
    subtitle: "Cómo escribirme",
  },
  resenas: {
    title: "Reseñas",
    subtitle: "Lo que dicen marcas y periodistas",
  },
}

// ─── Fuentes ──────────────────────────────────────────────────────────────────

async function campaignDocs(): Promise<SearchDoc[]> {
  try {
    const campaigns = await getPublicCampaigns()
    return campaigns.map((c) => ({
      id: `campana-${c.id}`,
      kind: "campana" as const,
      title: c.title,
      // El cliente canónico: colapsa el naming inconsistente de `brand`
      // ("QuienVino" / "QuienVino App") al nombre del catálogo.
      subtitle: findClient(c.brand)?.name ?? c.brand.trim(),
      body: clamp(`${htmlToPlainText(c.description)} ${htmlToPlainText(c.content)}`),
      href: `/campanas/${c.slug}`,
      meta: c.date,
    }))
  } catch {
    return []
  }
}

async function clippingDocs(): Promise<SearchDoc[]> {
  try {
    const groups = await getClientsWithClippings()
    return groups.flatMap(({ client, clippings }) =>
      clippings.map((k) => ({
        id: `gacetilla-${k.id}`,
        kind: "gacetilla" as const,
        title: k.title,
        // Mismo nombre canónico que las campañas: la tabla `clients` guarda
        // "QuienVino App" y el catálogo "QuienVino", y en una lista de
        // resultados mezclada eso se lee como dos clientes distintos.
        subtitle: `${findClient(client.name)?.name ?? client.name} · ${k.medium}`,
        body: "",
        // Las gacetillas de radio sin web no tienen `url`: en ese caso el
        // resultado lleva al bloque del cliente en /casos-de-exito, que es el
        // ancla que ya renderiza casos-client.tsx (id="cliente-{slug}").
        href: k.url ?? `/casos-de-exito#cliente-${client.slug}`,
        meta: clippingYear(k.published_at),
        external: !!k.url,
      })),
    )
  } catch {
    return []
  }
}

async function testimonialDocs(): Promise<SearchDoc[]> {
  try {
    const resenas = await getPublishedTestimonials()
    return resenas.map((r) => ({
      id: `resena-${r.id}`,
      kind: "resena" as const,
      title: r.author_name,
      subtitle: [r.author_role, r.author_brand].filter(Boolean).join(" · "),
      body: clamp(r.body),
      href: "/resenas",
      meta: `${r.rating}★`,
    }))
  } catch {
    return []
  }
}

/**
 * Un documento POR PÁGINA, no por bloque: todo el copy de la página se
 * concatena en un solo `body`. Si no, buscar "prensa" devolvía cinco filas de
 * la misma página (una por cada bloque donde aparece la palabra).
 */
async function pageDocs(): Promise<SearchDoc[]> {
  try {
    const { data, error } = await supabase
      .from("content_blocks")
      .select("page, value, value_long")
      .in("page", Object.keys(INDEXED_PAGES))

    if (error || !data) return []

    const textByPage = new Map<string, string[]>()
    for (const row of data) {
      const raw = (row.value_long ?? row.value) as string | null
      if (!raw) continue
      const page = row.page as string
      if (!textByPage.has(page)) textByPage.set(page, [])
      textByPage.get(page)!.push(htmlToPlainText(raw))
    }

    return Object.entries(INDEXED_PAGES).flatMap(([page, info]) => {
      const href = PAGE_PATHS[page]
      if (!href) return []
      return [{
        id: `pagina-${page}`,
        kind: "pagina" as const,
        title: info.title,
        subtitle: info.subtitle,
        // Las páginas se indexan con más cuerpo que el resto: son el único
        // documento de toda su página y es donde viven términos como
        // "vocería" o "gacetilla" que la gente va a buscar.
        body: clamp((textByPage.get(page) ?? []).join(" "), 2000),
        href,
      }]
    })
  } catch {
    return []
  }
}

// ─── Índice completo ──────────────────────────────────────────────────────────

/**
 * Todo el contenido público, listo para serializar. Las cuatro fuentes van en
 * paralelo y son independientes: si una falla, las otras tres siguen.
 */
export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const [campanas, gacetillas, resenas, paginas] = await Promise.all([
    campaignDocs(),
    clippingDocs(),
    testimonialDocs(),
    pageDocs(),
  ])
  return [...campanas, ...gacetillas, ...resenas, ...paginas]
}
