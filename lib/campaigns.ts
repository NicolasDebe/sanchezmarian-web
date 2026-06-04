import { supabase, createAdminClient } from "@/lib/supabase"
import type { Campaign, CampaignImage, CampaignInsert, CampaignUpdate } from "@/lib/types/campaign"

// ─── Lectura (anon key) ───────────────────────────────────────────────────────

export async function getAllCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, images:campaign_images(*)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Campaign[]
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, images:campaign_images(*)")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as Campaign
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, images:campaign_images(*)")
    .eq("slug", slug)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as Campaign
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, images:campaign_images(*)")
    .eq("status", "ACTIVA")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Campaign[]
}

// ─── Escritura (service_role — solo server-side) ──────────────────────────────

export async function createCampaign(payload: CampaignInsert): Promise<Campaign> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("campaigns")
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as Campaign
}

export async function updateCampaign(id: string, payload: CampaignUpdate): Promise<Campaign> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("campaigns")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Campaign
}

export async function deleteCampaign(id: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from("campaigns").delete().eq("id", id)
  if (error) throw error
}

export async function addCampaignImage(
  campaignId: string,
  url: string,
  alt: string,
  position: number,
): Promise<CampaignImage> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("campaign_images")
    .insert({ campaign_id: campaignId, url, alt, position })
    .select()
    .single()

  if (error) throw error
  return data as CampaignImage
}

export async function removeCampaignImage(id: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from("campaign_images").delete().eq("id", id)
  if (error) throw error
}

export async function uploadImage(file: File, campaignSlug: string): Promise<string> {
  const admin = createAdminClient()
  const path  = `${campaignSlug}/${Date.now()}-${file.name}`

  const { error: uploadError } = await admin.storage
    .from("campaign-images")
    .upload(path, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data } = admin.storage.from("campaign-images").getPublicUrl(path)
  return data.publicUrl
}
