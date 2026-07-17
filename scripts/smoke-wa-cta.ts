/**
 * Verificación puntual del CTA de WhatsApp en el bloque newsletter.
 * Corre con el server en localhost:3000: npx tsx scripts/smoke-wa-cta.ts
 */
import { chromium } from "playwright-core"

const BASE = "http://localhost:3000"
const PAGES = ["/casos-de-exito", "/campanas"]
const EXPECTED_URL = "https://whatsapp.com/channel/0029Vb8FH5e2kNFqiBaeSZ2k"

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  let failed = false

  for (const path of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await page.goto(BASE + path, { waitUntil: "networkidle" })

    const btn = page.locator("a.newsletter-wa-btn")
    const count = await btn.count()
    if (count !== 1) {
      console.log(`✗ ${path}: se esperaba 1 botón WA, hay ${count}`)
      failed = true
      await page.close()
      continue
    }
    const href = await btn.getAttribute("href")
    const target = await btn.getAttribute("target")
    const rel = await btn.getAttribute("rel")
    const aria = await btn.getAttribute("aria-label")
    const text = (await btn.innerText()).trim()
    const hasIcon = (await btn.locator("svg").count()) === 1

    const ok =
      href === EXPECTED_URL &&
      target === "_blank" &&
      rel === "noopener noreferrer" &&
      /WhatsApp de Marian/.test(aria ?? "") &&
      /Sumate al canal de WhatsApp/.test(text) &&
      hasIcon

    console.log(`${ok ? "✓" : "✗"} ${path}  href=${href}  target=${target}  rel=${rel}  icon=${hasIcon}`)
    console.log(`    aria="${aria}"  text="${text}"`)
    if (!ok) failed = true

    // Screenshot del bloque para inspección visual.
    if (path === "/casos-de-exito") {
      const card = page.locator("a.newsletter-wa-btn").locator("xpath=ancestor::div[contains(@style,'max-width')][1]")
      await card.scrollIntoViewIfNeeded()
      await page.waitForTimeout(600)
      await card.screenshot({ path: "scripts/wa-cta.png" }).catch(async () => {
        await page.screenshot({ path: "scripts/wa-cta.png", fullPage: false })
      })
      console.log("    screenshot → scripts/wa-cta.png")
    }
    await page.close()
  }

  await browser.close()
  console.log(failed ? "\n❌ CTA WA con problemas." : "\n✅ CTA WA OK.")
  if (failed) process.exit(1)
}

run().catch((e) => { console.error("Error fatal:", e); process.exit(1) })
