import { CONTACTO_SECTIONS } from "@/lib/contacto-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditContactoPage() {
  return <AdminEditPage page="contacto" title="Contacto" schema={CONTACTO_SECTIONS} />
}
