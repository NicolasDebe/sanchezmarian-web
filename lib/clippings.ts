/**
 * Clippings de /casos-de-exito — tipos, lectura pública y fallback.
 *
 * Lectura pública SIEMPRE con fallback: si Supabase falla o las tablas
 * todavía no existen, la página se arma con los datos hardcoded de
 * data/clippings.ts y se ve idéntica. Nunca tira excepción.
 */

import { supabase } from "@/lib/supabase"
import { CLIPPINGS } from "@/data/clippings"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ClippingScope = "local" | "nacional" | "regional" | "internacional"
export type ClippingFormat = "Digital" | "Gráfico" | "TV" | "Radio" | "Streaming"

export interface DbClient {
  id: string
  slug: string
  name: string
  logo_url: string | null
  order_position: number
  is_active: boolean
}

export interface DbClipping {
  id: string
  client_id: string
  medium: string
  title: string
  /** Fecha ISO yyyy-mm-dd */
  published_at: string
  scope: ClippingScope
  format: ClippingFormat
  /** Ahora nullable: un clipping puede tener solo audio (radios sin web). */
  url: string | null
  /** URL pública del audio en Storage (bucket clipping-audios). */
  audio_url: string | null
  /** Duración del audio en segundos (persistida al subir). */
  audio_duration_seconds: number | null
  order_position: number
}

// Columnas leídas de la tabla `clippings`. Las de audio pueden no existir aún
// (la migración 20260628 se corre a mano en el dashboard): por eso las lecturas
// reintentan sin ellas. Ver SELECT_WITH_AUDIO / SELECT_LEGACY.
export const SELECT_WITH_AUDIO =
  "id, client_id, medium, title, published_at, scope, format, url, order_position, audio_url, audio_duration_seconds"
export const SELECT_LEGACY =
  "id, client_id, medium, title, published_at, scope, format, url, order_position"

export interface ClientWithClippings {
  client: DbClient
  clippings: DbClipping[]
}

export const SCOPE_LABELS: Record<ClippingScope, string> = {
  local: "Local",
  nacional: "Nacional",
  regional: "Regional",
  internacional: "Internacional",
}

export const SCOPES: ClippingScope[] = ["local", "nacional", "regional", "internacional"]
export const FORMATS: ClippingFormat[] = ["Digital", "Gráfico", "TV", "Radio", "Streaming"]

/**
 * Topes de largo de los campos editables de un clipping, alineados al render
 * público (/casos-de-exito): el título se recorta a 2 líneas y el medio es un
 * nombre corto en mono. Validados en el form (cliente) y en el server action.
 */
export const CLIPPING_LIMITS = { medium: 80, title: 220, url: 500 } as const

/** Año de un published_at sin pasar por Date (evita el corrimiento de timezone). */
export function clippingYear(publishedAt: string): string {
  return publishedAt.slice(0, 4)
}

// ─── Clientes — fuente única (seed + fallback) ────────────────────────────────
// `key` es el nombre con el que figura cada cliente en data/clippings.ts.

export interface ClientSeed {
  slug: string
  name: string
  key: string
  logo: string | null
}

export const CLIENT_SEED: ClientSeed[] = [
  { slug: "bolsa-comercio",    name: "Bolsa de Comercio",         key: "Bolsa de Comercio de Mendoza", logo: "/images/logos/logo-bolsa-comercio.png" },
  { slug: "colegio-notarial",  name: "Colegio Notarial",          key: "Colegio Notarial de Mendoza",  logo: "/images/logos/logo-colegio-notarial.png" },
  { slug: "grupo-presidente",  name: "Grupo Presidente",          key: "Grupo Presidente",             logo: "/images/logos/logo-presidente.png" },
  { slug: "capilla-acutis",    name: "Capilla Carlo Acutis",      key: "Capilla Carlo Acutis",         logo: "/images/logos/logo-capilla-acutis.png" },
  { slug: "dra-meneo",         name: "Dra. Elina Meneo",          key: "Dra. Elina Meneo",             logo: "/images/logos/logo-meneo.png" },
  { slug: "chakaymanta",       name: "Esc. Vendimia Chakaymanta", key: "Esc. Vendimia Chakaymanta",    logo: "/images/logos/logo-chakaymanta.png" },
  { slug: "quienvino",         name: "QuienVino App",             key: "QuienVino App",                logo: "/images/logos/logo-quienvino.png" },
  { slug: "agrocosecha",       name: "Agrocosecha",               key: "Agrocosecha",                  logo: "/images/logos/logo-agrocosecha.png" },
  { slug: "fuerza-silenciosa", name: "Fuerza Silenciosa",         key: "Fuerza Silenciosa",            logo: "/images/logos/logo-fuerza-silenciosa.jpg" },
  { slug: "mendoza-regenera",  name: "Mendoza Regenera",          key: "Mendoza Regenera",             logo: "/images/logos/logo-mendoza-regenera.png" },
  { slug: "flor-mouradian",    name: "Flor Mouradian",            key: "Flor Mouradian",               logo: "/images/logos/logo-mfmc.png" },
]

// ─── Fallback desde data/clippings.ts ─────────────────────────────────────────

const LEGACY_SCOPE: Record<string, ClippingScope> = {
  Local: "local",
  Regional: "regional",
  Nacional: "nacional",
  Internacional: "internacional",
}

export function legacyPublishedAt(año: number, mes?: number): string {
  return `${año}-${String(mes ?? 1).padStart(2, "0")}-01`
}

function buildFallback(): ClientWithClippings[] {
  return CLIENT_SEED.map((seed, idx) => ({
    client: {
      id: seed.slug,
      slug: seed.slug,
      name: seed.name,
      logo_url: seed.logo,
      order_position: idx,
      is_active: true,
    },
    clippings: CLIPPINGS.filter((c) => c.cliente === seed.key)
      .map((c, i) => ({
        id: `fallback-${c.id}`,
        client_id: seed.slug,
        medium: c.medio,
        title: c.titular,
        published_at: legacyPublishedAt(c.año, c.mes),
        scope: LEGACY_SCOPE[c.alcance] ?? "local",
        format: c.formato as ClippingFormat,
        url: c.link,
        audio_url: null,
        audio_duration_seconds: null,
        order_position: i,
      }))
      // Mismo orden que la versión hardcoded: año desc, entradas nuevas primero.
      .sort((a, b) =>
        a.published_at !== b.published_at
          ? b.published_at.localeCompare(a.published_at)
          : b.order_position - a.order_position,
      ),
  }))
}

// ─── Lectura pública ──────────────────────────────────────────────────────────

/**
 * Clientes activos con sus clippings ordenados por fecha DESC.
 * Si Supabase falla o no hay datos, devuelve el fallback hardcoded.
 */
export async function getClientsWithClippings(): Promise<ClientWithClippings[]> {
  try {
    const clippingsQuery = async () => {
      // Intento con columnas de audio; si todavía no existen, reintento legacy.
      const withAudio = await supabase
        .from("clippings")
        .select(SELECT_WITH_AUDIO)
        .order("published_at", { ascending: false })
        .order("order_position", { ascending: false })
      if (!withAudio.error) return withAudio
      const legacy = await supabase
        .from("clippings")
        .select(SELECT_LEGACY)
        .order("published_at", { ascending: false })
        .order("order_position", { ascending: false })
      return legacy
    }

    const [clientsRes, clippingsRes] = await Promise.all([
      supabase
        .from("clients")
        .select("id, slug, name, logo_url, order_position, is_active")
        .eq("is_active", true)
        .order("order_position", { ascending: true }),
      clippingsQuery(),
    ])

    if (clientsRes.error || clippingsRes.error || !clientsRes.data?.length) {
      return buildFallback()
    }

    const byClient = new Map<string, DbClipping[]>()
    for (const raw of clippingsRes.data ?? []) {
      // El select legacy no trae audio_*: normalizamos a null.
      const k = {
        audio_url: null,
        audio_duration_seconds: null,
        ...(raw as Record<string, unknown>),
      } as unknown as DbClipping
      if (!byClient.has(k.client_id)) byClient.set(k.client_id, [])
      byClient.get(k.client_id)!.push(k)
    }

    return (clientsRes.data as DbClient[]).map((client) => ({
      client,
      clippings: byClient.get(client.id) ?? [],
    }))
  } catch {
    return buildFallback()
  }
}
