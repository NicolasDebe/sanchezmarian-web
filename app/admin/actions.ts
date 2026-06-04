"use server"

import { createAdminClient } from "@/lib/supabase"
import type { CampaignInsert, CampaignUpdate, Campaign, CampaignImage } from "@/lib/types/campaign"

export async function createCampaignAction(data: CampaignInsert): Promise<Campaign> {
  const admin = createAdminClient()
  const { data: campaign, error } = await admin
    .from("campaigns")
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return campaign as Campaign
}

export async function updateCampaignAction(id: string, data: CampaignUpdate): Promise<Campaign> {
  const admin = createAdminClient()
  const { data: campaign, error } = await admin
    .from("campaigns")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return campaign as Campaign
}

export async function deleteCampaignImageAction(imageId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from("campaign_images")
    .delete()
    .eq("id", imageId)

  if (error) throw new Error(error.message)
}

export async function addCampaignImageAction(
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

  if (error) throw new Error(error.message)
  return data as CampaignImage
}
