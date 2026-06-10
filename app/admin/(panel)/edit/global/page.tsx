import { GLOBAL_SECTIONS } from "@/lib/global-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditGlobalPage() {
  return (
    <AdminEditPage
      page="global"
      title="Menú y pie de página"
      schema={GLOBAL_SECTIONS}
      intro="Estos textos aparecen en todas las páginas del sitio."
    />
  )
}
