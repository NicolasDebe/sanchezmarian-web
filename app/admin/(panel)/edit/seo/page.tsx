import { SEO_SECTIONS, SEO_PAGE } from "@/lib/seo-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditSeoPage() {
  return (
    <AdminEditPage
      page={SEO_PAGE}
      title="SEO (buscadores)"
      schema={SEO_SECTIONS}
      intro="Título y descripción que aparecen en Google y al compartir cada página. Cada acordeón corresponde a una página del sitio."
    />
  )
}
