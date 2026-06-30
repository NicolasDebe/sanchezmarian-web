import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CampanaDetail } from "@/components/campana-detail"
import { getCampaignBySlug } from "@/lib/campaigns"
import { createClient } from "@/lib/supabase/server"
import { ogImageUrl, getOgDefaults, SITE_URL } from "@/lib/seo"

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

  // Primera imagen de la campaña (images viene ordenada por position ASC en
  // getCampaignBySlug). Si no tiene fotos, cae a la imagen OG global.
  // ogImageUrl pasa la foto de Supabase Storage por el transform endpoint
  // (1200×630, JPEG, <600KB) para que WhatsApp no la descarte por peso.
  const g = await getOgDefaults()
  const firstImage = campaign.images?.[0]?.url
  const imageUrl = ogImageUrl(firstImage || g.og_default_image)
  const title = `${campaign.title} — Marian Sánchez`

  return {
    title,
    description: campaign.description,
    openGraph: {
      type: "article",
      title,
      description: campaign.description,
      url: `${SITE_URL}/campanas/${campaign.slug}`,
      siteName: g.og_site_name,
      locale: "es_AR",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: campaign.description,
      images: [imageUrl],
      ...(g.twitter_handle?.trim() ? { creator: g.twitter_handle.trim(), site: g.twitter_handle.trim() } : {}),
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
        style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.14em", color: "var(--color-hueso)" }}
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
