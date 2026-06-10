import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { ServiciosPageSections } from "@/components/servicios-page-sections"
import { getPageContent } from "@/lib/content"
import { SERVICIOS_SECTIONS } from "@/lib/servicios-schema"
import { getGlobalContent } from "@/lib/global-content"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("servicios", "https://sanchezmarian.com/servicios")
}

export default async function ServiciosPage() {
  const [global, content] = await Promise.all([
    getGlobalContent(),
    getPageContent("servicios", SERVICIOS_SECTIONS),
  ])

  return (
    <main>
      <Nav content={global.nav} />
      <ServiciosPageSections content={content} />
      <Footer content={global.footer} nav={global.nav} />
    </main>
  )
}
