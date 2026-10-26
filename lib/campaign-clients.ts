/**
 * Agrupado de campañas por cliente, para los chips de filtro de /campanas.
 *
 * El cliente de una campaña es su columna `brand` (TEXT libre, con naming
 * inconsistente entre campañas: "QuienVino" vs "QuienVino App"). El nombre
 * canónico sale del catálogo de lib/client-logos.ts vía findClient, que ya
 * empareja por aliases; si la marca no está en el catálogo se usa tal cual.
 *
 * Los grupos se DERIVAN de las campañas que existen, nunca de CLIENT_LOGOS:
 * así un cliente nuevo aparece solo al cargar su primera campaña, y no se
 * muestran chips de clientes sin campañas.
 *
 * Módulo puro, sin imports de Supabase, para poder usarlo en componentes
 * cliente.
 */

import { findClient, findClientLogo } from "@/lib/client-logos"
import type { Campaign } from "@/lib/types/campaign"

export interface CampaignClientGroup {
  /** clave normalizada, para el estado del chip */
  key: string
  /** nombre canónico a mostrar */
  name: string
  logo: string | null
  count: number
}

/** minúsculas, sin acentos, espacios y puntuación colapsados. */
function normalizeKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** Nombre canónico del cliente de una campaña. */
function clientName(campaign: Campaign): string {
  return findClient(campaign.brand)?.name ?? (campaign.brand ?? "").trim()
}

/** Clave del cliente canónico de una campaña (para filtrar). */
export function campaignClientKey(campaign: Campaign): string {
  return normalizeKey(clientName(campaign))
}

/** Grupos ordenados por cantidad de campañas DESC, luego nombre (localeCompare "es"). */
export function groupCampaignsByClient(campaigns: Campaign[]): CampaignClientGroup[] {
  const groups = new Map<string, CampaignClientGroup>()

  for (const campaign of campaigns) {
    const name = clientName(campaign)
    const key = normalizeKey(name)
    // Una campaña sin marca no genera chip: no hay cliente al que filtrar.
    if (!key) continue

    const existing = groups.get(key)
    if (existing) {
      existing.count += 1
    } else {
      groups.set(key, {
        key,
        name,
        logo: findClientLogo(campaign.brand),
        count: 1,
      })
    }
  }

  return [...groups.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"),
  )
}
