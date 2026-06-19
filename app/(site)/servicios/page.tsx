import type { Metadata } from "next"
import { ServiciosPageSections } from "@/components/servicios-page-sections"
import { MobileCtaBar } from "@/components/ui/mobile-cta-bar"
import { getPageContent } from "@/lib/content"
import { SERVICIOS_SECTIONS } from "@/lib/servicios-schema"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("servicios", "https://sanchezmarian.com/servicios")
}

export default async function ServiciosPage() {
  const content = await getPageContent("servicios", SERVICIOS_SECTIONS)

  return (
    <>
      <ServiciosPageSections content={content} />
      <MobileCtaBar label="Hablemos de tu proyecto" />
    </>
  )
}
