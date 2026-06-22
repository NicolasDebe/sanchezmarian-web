import type { Metadata } from "next"
import { CasosClient } from "./casos-client"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { NewsletterSection } from "@/components/newsletter-section"
import { getPageContent } from "@/lib/content"
import { CASOS_SECTIONS } from "@/lib/casos-schema"
import { getClientsWithClippings } from "@/lib/clippings"
import { buildMetadata, SITE_URL } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("casos_de_exito", `${SITE_URL}/casos-de-exito`)
}

export default async function CasosDeExitoPage() {
  const [content, clientsData] = await Promise.all([
    getPageContent("casos_de_exito", CASOS_SECTIONS),
    getClientsWithClippings(),
  ])

  return (
    <>
      <ScrollProgress />
      <CasosClient content={content} clientsData={clientsData} />
      <NewsletterSection />
    </>
  )
}
