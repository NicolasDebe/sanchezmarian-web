import type { Metadata } from "next"
import { CampanasContent } from "@/components/campanas-content"
import { MobileCtaBar } from "@/components/ui/mobile-cta-bar"
import { getPublicCampaigns } from "@/lib/campaigns"
import { buildMetadata, SITE_URL } from "@/lib/seo"

// Igual que el home: estática con revalidación. getPublicCampaigns nunca
// tira excepción (fallback hardcoded), así el build jamás rompe por Supabase.
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("campanas", `${SITE_URL}/campanas`)
}

export default async function CampanasPage() {
  const campaigns = await getPublicCampaigns()

  return (
    <>
      <CampanasContent campaigns={campaigns} />
      <MobileCtaBar label="Hablemos" />
    </>
  )
}
