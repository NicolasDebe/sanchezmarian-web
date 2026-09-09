import type { Metadata } from "next"
import { ServiciosPageSections } from "@/components/servicios-page-sections"
import { MobileCtaBar } from "@/components/ui/mobile-cta-bar"
import { getPageContent, getContentBatch, getTextScales } from "@/lib/content"
import { getActiveConnections } from "@/lib/connections"
import { getPublishedTestimonials } from "@/lib/testimonials"
import { SERVICIOS_SECTIONS } from "@/lib/servicios-schema"
import { fallbacksFor as resenasFallbacksFor, RESENAS_PAGE } from "@/lib/resenas-schema"
import { buildMetadata, SITE_URL } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("servicios", `${SITE_URL}/servicios`)
}

export default async function ServiciosPage() {
  const [content, connections, resenas, resenasCopy, resenasScales, scales] =
    await Promise.all([
      getPageContent("servicios", SERVICIOS_SECTIONS),
      getActiveConnections(),
      // Todas las publicadas: la regla del adelanto necesita saber si hay
      // alguna de periodista fuera de las 3 más recientes.
      getPublishedTestimonials(),
      getContentBatch(RESENAS_PAGE, "preview", resenasFallbacksFor("preview")),
      getTextScales(RESENAS_PAGE),
      getTextScales("servicios"),
    ])

  return (
    <>
      <ServiciosPageSections
        content={content}
        connections={connections}
        resenas={resenas}
        resenasCopy={resenasCopy}
        resenasScales={resenasScales}
        scales={scales}
      />
      <MobileCtaBar label="Hablemos de tu proyecto" />
    </>
  )
}
