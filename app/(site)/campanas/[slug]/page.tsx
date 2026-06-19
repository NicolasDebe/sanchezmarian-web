import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CampanaDetail } from "@/components/campana-detail"
import { getCampaignBySlug } from "@/lib/campaigns"
import { createClient } from "@/lib/supabase/server"

// Siempre fresca: lee Supabase en request time, nunca en build time,
// y el preview de borradores depende de cookies de sesión.
export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const campaign = await getCampaignBySlug(slug)
  if (!campaign || campaign.status === "draft") {
    return { title: "Campaña — Marian Sánchez" }
  }
  return {
    title: `${campaign.title} — Marian Sánchez`,
    description: campaign.description,
    openGraph: {
      title: `${campaign.title} — Marian Sánchez`,
      description: campaign.description,
      url: `https://sanchezmarian.com/campanas/${campaign.slug}`,
    },
  }
}

async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return !!user
  } catch {
    return false
  }
}

function DraftBanner() {
  return (
    <div
      className="text-center"
      style={{ background: "var(--color-bordo-oscuro)", padding: "10px 16px" }}
    >
      <p
        className="font-mono uppercase"
        style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--color-hueso)" }}
      >
        Borrador — Vista previa, no es pública todavía
      </p>
    </div>
  )
}

export default async function CampanaPage({ params, searchParams }: Props) {
  const [{ slug }, { preview }] = await Promise.all([params, searchParams])

  const campaign = await getCampaignBySlug(slug)
  if (!campaign) notFound()

  const isDraft = campaign.status === "draft"
  if (isDraft) {
    const allowed = preview === "true" && (await isAuthenticated())
    if (!allowed) notFound()
  }

  return (
    <>
      {isDraft && <DraftBanner />}
      <CampanaDetail campaign={campaign} />
    </>
  )
}
