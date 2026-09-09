import { RESENAS_SECTIONS, RESENAS_PAGE } from "@/lib/resenas-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditResenasPage() {
  return (
    <AdminEditPage
      page={RESENAS_PAGE}
      title="Reseñas"
      schema={RESENAS_SECTIONS}
    />
  )
}
