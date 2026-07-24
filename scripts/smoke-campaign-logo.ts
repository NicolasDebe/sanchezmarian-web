/**
 * Verifica que el header de la campaña muestra el logo del cliente como foto de
 * perfil (en vez de la inicial). Con el server en localhost:3000:
 *   npx tsx scripts/smoke-campaign-logo.ts
 */
import { chromium } from "playwright-core"

const BASE = "http://localhost:3000"
// slug → substring esperado en el src del logo
const CASES: Record<string, string> = {
  "lynk-co-grupo-presidente": "logo-presidente",
  "bolsa-comercio-mosto": "logo-bolsa-comercio",
  "capilla-carlo-acutis": "logo-capilla-acutis",
}

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  let failed = false

  for (const [slug, expect] of Object.entries(CASES)) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await page.goto(`${BASE}/campanas/${slug}`, { waitUntil: "networkidle" })

    const img = page.locator('img[alt^="Logo de"]')
    const count = await img.count()
    const src = count ? await img.first().getAttribute("src") : null
    const ok = count === 1 && !!src && src.includes(expect)
    console.log(`${ok ? "✓" : "✗"} ${slug}  logos=${count}  src=${src}`)
    if (!ok) failed = true

    if (slug === "lynk-co-grupo-presidente") {
      await page.screenshot({ path: "scripts/campaign-logo.png", fullPage: false })
      console.log("    screenshot → scripts/campaign-logo.png")
    }
    await page.close()
  }

  await browser.close()
  console.log(failed ? "\n❌ Logo de campaña con problemas." : "\n✅ Logo de campaña OK.")
  if (failed) process.exit(1)
}

run().catch((e) => { console.error("Error fatal:", e); process.exit(1) })
