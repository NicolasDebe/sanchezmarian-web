import { MIS_VALORES_SECTIONS } from "@/lib/mis-valores-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditMisValoresPage() {
  return <AdminEditPage page="mis_valores" title="Mis valores" schema={MIS_VALORES_SECTIONS} />
}
