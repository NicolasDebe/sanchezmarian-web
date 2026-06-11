export type CampaignStatus = "draft" | "active" | "finished"

export interface CampaignImage {
  id: string
  campaign_id: string
  url: string
  alt: string
  position: number
}

export interface Campaign {
  id: string
  slug: string
  brand: string
  title: string
  description: string
  content: string
  status: CampaignStatus
  date: string
  created_at: string
  updated_at: string
  images?: CampaignImage[]
}

export type CampaignInsert = Omit<Campaign, "id" | "created_at" | "updated_at" | "images">
export type CampaignUpdate = Partial<CampaignInsert>

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Borrador",
  active: "Activa",
  finished: "Finalizada",
}

/**
 * La base puede tener todavía los valores legacy en español
 * (hasta correr supabase/migrations/20260611_campaigns_status.sql).
 */
export function normalizeStatus(raw: string): CampaignStatus {
  if (raw === "active" || raw === "ACTIVA") return "active"
  if (raw === "finished" || raw === "FINALIZADA") return "finished"
  return "draft"
}

/** Valor legacy equivalente para escribir pre-migración. Draft no tiene. */
export function legacyStatus(status: CampaignStatus): string | null {
  if (status === "active") return "ACTIVA"
  if (status === "finished") return "FINALIZADA"
  return null
}

/**
 * El contenido legacy podía ser texto plano. Si no trae tags HTML,
 * lo envolvemos en <p> por párrafo para que .rich-content lo estilice.
 */
export function ensureHtml(content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) return content
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("\n")
}
