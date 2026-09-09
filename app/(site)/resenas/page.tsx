import type { Metadata } from "next"
import { ResenasContent } from "@/components/resenas-content"
import { getPublishedTestimonials, getRatingSummary } from "@/lib/testimonials"
import { getPageContent, getTextScales } from "@/lib/content"
import { RESENAS_PAGE, RESENAS_SECTIONS } from "@/lib/resenas-schema"
import { buildMetadata, SITE_URL } from "@/lib/seo"

/**
 * /resenas — reseñas publicadas de marcas y periodistas.
 *
 * Vive DENTRO del grupo (site) para heredar Navbar y Footer: es una página del
 * sitio y está en el menú principal. La que queda afuera es /resenas/nueva, que
 * es una landing autónoma para compartir por WhatsApp.
 *
 * Todo el fetch pasa por acá y baja por props: los componentes client no leen
 * datos. Las lecturas de reseñas nunca tiran excepción (devuelven vacío), así
 * que un problema de Supabase muestra el estado vacío, no un error.
 */

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("resenas", `${SITE_URL}/resenas`)
}

export default async function ResenasPage() {
  const [resenas, summary, content, scales] = await Promise.all([
    getPublishedTestimonials(),
    getRatingSummary(),
    getPageContent(RESENAS_PAGE, RESENAS_SECTIONS),
    getTextScales(RESENAS_PAGE),
  ])

  return (
    <ResenasContent
      resenas={resenas}
      summary={summary}
      content={content}
      scales={scales}
    />
  )
}
