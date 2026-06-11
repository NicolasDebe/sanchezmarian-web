import { supabase } from "@/lib/supabase"
import { FALLBACK_CAMPAIGNS } from "@/data/campaigns-fallback"
import { normalizeStatus, type Campaign, type CampaignImage } from "@/lib/types/campaign"

/**
 * Lecturas públicas de campañas (anon key). Igual que lib/content.ts:
 * NUNCA tiran excepción — si Supabase falla, devuelven el fallback hardcoded
 * y el build de Vercel jamás rompe por Supabase.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCampaign(row: any): Campaign {
  const images = ((row.images ?? []) as CampaignImage[])
    .slice()
    .sort((a, b) => a.position - b.position)
  return { ...row, status: normalizeStatus(row.status), images } as Campaign
}

/** Campañas visibles en /campanas: activas y finalizadas (sin borradores). */
export async function getPublicCampaigns(): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*, images:campaign_images(*)")
      .order("created_at", { ascending: false })

    if (error) throw error
    return (data ?? [])
      .map(normalizeCampaign)
      .filter((c) => c.status === "active" || c.status === "finished")
  } catch {
    return FALLBACK_CAMPAIGNS
  }
}

/** Una campaña por slug, cualquier status (el caller decide qué hacer con drafts). */
export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*, images:campaign_images(*)")
      .eq("slug", slug)
      .maybeSingle()

    if (error) throw error
    return data ? normalizeCampaign(data) : null
  } catch {
    return FALLBACK_CAMPAIGNS.find((c) => c.slug === slug) ?? null
  }
}
