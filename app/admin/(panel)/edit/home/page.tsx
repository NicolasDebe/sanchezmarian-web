import { HOME_SECTIONS } from "@/lib/home-schema"
import { AdminEditPage } from "@/components/admin/edit-page"

export const dynamic = "force-dynamic"

export default function EditHomePage() {
  return <AdminEditPage page="home" title="Home" schema={HOME_SECTIONS} />
}
