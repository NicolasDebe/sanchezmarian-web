import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CasosClient } from "./casos-client"
import { getPageContent } from "@/lib/content"
import { CASOS_SECTIONS } from "@/lib/casos-schema"
import { getGlobalContent } from "@/lib/global-content"
import { getClientsWithClippings } from "@/lib/clippings"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("casos_de_exito", "https://sanchezmarian.com/casos-de-exito")
}

export default async function CasosDeExitoPage() {
  const [global, content, clientsData] = await Promise.all([
    getGlobalContent(),
    getPageContent("casos_de_exito", CASOS_SECTIONS),
    getClientsWithClippings(),
  ])

  return (
    <main>
      <Nav content={global.nav} />
      <CasosClient content={content} clientsData={clientsData} />
      <Footer content={global.footer} nav={global.nav} />
    </main>
  )
}
