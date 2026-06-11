import { createAdminClient } from "@/lib/supabase"
import { normalizeStatus, type Campaign, type CampaignImage } from "@/lib/types/campaign"
import { CampaignsList, type CampaignFilter } from "./campaigns-list"

export const dynamic = "force-dynamic"

const FILTERS = ["todas", "draft", "active", "finished"] as const

export default async function AdminCampanasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter: CampaignFilter = (FILTERS as readonly string[]).includes(status ?? "")
    ? (status as CampaignFilter)
    : "todas"

  let campaigns: Campaign[] = []
  let loadError = false

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("campaigns")
      .select("*, images:campaign_images(*)")
      .order("created_at", { ascending: false })
    if (error) throw error
    campaigns = (data ?? []).map((row) => ({
      ...row,
      status: normalizeStatus(row.status as string),
      images: ((row.images ?? []) as CampaignImage[])
        .slice()
        .sort((a, b) => a.position - b.position),
    })) as Campaign[]
  } catch {
    loadError = true
  }

  const counts = {
    todas: campaigns.length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    active: campaigns.filter((c) => c.status === "active").length,
    finished: campaigns.filter((c) => c.status === "finished").length,
  }

  const visible =
    filter === "todas" ? campaigns : campaigns.filter((c) => c.status === filter)

  return (
    <CampaignsList
      campaigns={visible}
      filter={filter}
      counts={counts}
      loadError={loadError}
    />
  )
}
