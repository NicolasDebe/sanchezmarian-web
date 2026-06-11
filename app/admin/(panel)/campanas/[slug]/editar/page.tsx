import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase"
import { normalizeStatus, type Campaign, type CampaignImage } from "@/lib/types/campaign"
import { CampaignForm } from "@/components/admin/campaign-form"

export const dynamic = "force-dynamic"

export default async function EditarCampanaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let campaign: Campaign | null = null
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from("campaigns")
      .select("*, images:campaign_images(*)")
      .eq("slug", slug)
      .maybeSingle()

    if (data) {
      campaign = {
        ...data,
        status: normalizeStatus(data.status as string),
        images: ((data.images ?? []) as CampaignImage[])
          .slice()
          .sort((a, b) => a.position - b.position),
      } as Campaign
    }
  } catch {
    campaign = null
  }

  if (!campaign) notFound()

  return <CampaignForm initial={campaign} />
}
