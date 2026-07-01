import type { Metadata } from "next"
import { ServiciosPageSections } from "@/components/servicios-page-sections"
import { MobileCtaBar } from "@/components/ui/mobile-cta-bar"
import { getPageContent } from "@/lib/content"
import { getActiveConnections } from "@/lib/connections"
import { SERVICIOS_SECTIONS } from "@/lib/servicios-schema"
import { buildMetadata, SITE_URL } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("servicios", `${SITE_URL}/servicios`)
}

export default async function ServiciosPage() {
  const [content, connections] = await Promise.all([
    getPageContent("servicios", SERVICIOS_SECTIONS),
    getActiveConnections(),
  ])

  return (
    <>
      <ServiciosPageSections content={content} connections={connections} />
      <MobileCtaBar label="Hablemos de tu proyecto" />
    </>
  )
}
