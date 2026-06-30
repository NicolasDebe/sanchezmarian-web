import { getDesignSettings } from "@/app/admin/actions"
import { TipografiaPanel } from "@/components/admin/TipografiaPanel"

export const dynamic = "force-dynamic"

export default async function Page() {
  const current = await getDesignSettings()
  return <TipografiaPanel initial={current} />
}
