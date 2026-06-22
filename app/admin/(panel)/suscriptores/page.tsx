import { createAdminClient } from "@/lib/supabase"
import { SuscriptoresTable, type Lead } from "./suscriptores-table"

export const dynamic = "force-dynamic"

export default async function SuscriptoresPage() {
  let leads: Lead[] = []
  let loadError = false

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("leads")
      .select("id, nombre, email, created_at")
      .order("created_at", { ascending: false })
    if (error) throw error
    leads = (data ?? []) as Lead[]
  } catch {
    loadError = true
  }

  return <SuscriptoresTable leads={leads} loadError={loadError} />
}
