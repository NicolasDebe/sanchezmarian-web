import { SERVICIOS_SECTIONS } from "@/lib/servicios-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditServiciosPage() {
  return <AdminEditPage page="servicios" title="Servicios" schema={SERVICIOS_SECTIONS} />
}
