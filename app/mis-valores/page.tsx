import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { MisValoresSections } from "@/components/mis-valores-sections"
import { getPageContent } from "@/lib/content"
import { MIS_VALORES_SECTIONS } from "@/lib/mis-valores-schema"
import { getGlobalContent } from "@/lib/global-content"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("mis_valores", "https://sanchezmarian.com/mis-valores")
}

export default async function MisValoresPage() {
  const [global, content] = await Promise.all([
    getGlobalContent(),
    getPageContent("mis_valores", MIS_VALORES_SECTIONS),
  ])

  return (
    <main>
      <Nav content={global.nav} />
      <MisValoresSections content={content} />
      <Footer content={global.footer} nav={global.nav} />
    </main>
  )
}
