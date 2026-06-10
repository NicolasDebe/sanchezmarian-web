import { CASOS_SECTIONS } from "@/lib/casos-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditCasosPage() {
  return (
    <AdminEditPage
      page="casos_de_exito"
      title="Casos de éxito"
      schema={CASOS_SECTIONS}
      intro="Por ahora se edita el encabezado y las estadísticas. El listado de clientes y sus coberturas se cargará en una próxima etapa."
    />
  )
}
