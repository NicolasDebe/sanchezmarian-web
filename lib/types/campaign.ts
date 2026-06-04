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
  status: "ACTIVA" | "FINALIZADA"
  date: string
  created_at: string
  updated_at: string
  images?: CampaignImage[]
}

export type CampaignInsert = Omit<Campaign, "id" | "created_at" | "updated_at" | "images">
export type CampaignUpdate = Partial<CampaignInsert>
