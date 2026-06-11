/**
 * Auditoría rápida del schema de campaign_images.
 * Ejecutar con: npx tsx scripts/audit-campaign-images.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  const { data, error } = await admin
    .from("campaign_images")
    .select("*")
    .limit(1)

  if (error) {
    console.log("ERROR leyendo campaign_images:", error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log("campaign_images está vacía — pruebo insert dummy para ver columnas")
  } else {
    console.log("Columnas presentes en campaign_images:", Object.keys(data[0]).join(", "))
    console.log("Fila de muestra:", JSON.stringify(data[0], null, 2))
  }

  // Probar select explícito de alt y position
  const { error: altErr } = await admin.from("campaign_images").select("alt").limit(1)
  console.log("Columna alt:", altErr ? `NO EXISTE (${altErr.message})` : "OK")
  const { error: posErr } = await admin.from("campaign_images").select("position").limit(1)
  console.log("Columna position:", posErr ? `NO EXISTE (${posErr.message})` : "OK")

  // Campañas y cantidad de fotos
  const { data: campaigns } = await admin
    .from("campaigns")
    .select("id, slug, status, images:campaign_images(id, position, alt)")
    .order("created_at", { ascending: true })

  for (const c of campaigns ?? []) {
    const imgs = (c.images ?? []) as { position: number; alt: string }[]
    console.log(
      `- ${c.slug} [${c.status}]: ${imgs.length} fotos, positions=[${imgs
        .map((i) => i.position)
        .sort((a, b) => a - b)
        .join(",")}]`,
    )
  }
}

main()
