/**
 * Capturas de las 3 features nuevas (Mobile CTA bar, Scroll progress, Custom cursor).
 * Uso: npx tsx scripts/shots-features.ts  (con el dev server corriendo en :3000)
 */
import { chromium, type Browser } from "playwright-core"
import path from "path"
import fs from "fs"

const BASE = process.env.SHOTS_BASE ?? "http://localhost:3000"
const OUT = path.join(process.cwd(), "shots")

async function ready(browser: Browser) {
  // Espera a que el dev server responda 200 en el home.
  const p = await browser.newPage()
  for (let i = 0; i < 40; i++) {
    try {
      const r = await p.goto(BASE, { timeout: 4000, waitUntil: "domcontentloaded" })
      if (r && r.ok()) { await p.close(); return }
    } catch { /* retry */ }
    await p.waitForTimeout(1500)
  }
  await p.close()
  throw new Error("dev server no respondió a tiempo")
}

async function scrollToFraction(page: import("playwright-core").Page, frac: number) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: max * f, behavior: "instant" as ScrollBehavior })
  }, frac)
  await page.waitForTimeout(900)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  await ready(browser)

  // ── MOBILE 390×844 ──
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  })

  for (const [route, name] of [
    ["/servicios", "01-servicios-mobile-cta-bar"],
    ["/campanas", "02-campanas-mobile-cta-bar"],
  ] as const) {
    const page = await mobile.newPage()
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" })
    await scrollToFraction(page, 0.6)
    await page.screenshot({ path: path.join(OUT, `${name}.png`) })
    console.log(`✓ ${name}`)
    await page.close()
  }

  // Scroll progress en /casos (mobile, scrolleado un poco)
  {
    const page = await mobile.newPage()
    await page.goto(`${BASE}/casos-de-exito`, { waitUntil: "networkidle" })
    await scrollToFraction(page, 0.35)
    await page.screenshot({ path: path.join(OUT, "03-casos-mobile-scroll-progress.png") })
    console.log("✓ 03-casos-mobile-scroll-progress")
    await page.close()
  }
  await mobile.close()

  // ── DESKTOP 1280×800 (custom cursor + scroll progress) ──
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  })

  // Custom cursor: mover el mouse sobre un CTA y capturar el anillo agrandado.
  {
    const page = await desktop.newPage()
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
    await page.waitForTimeout(600)
    // Mover el puntero al botón primario del hero.
    const cta = page.locator('a[href="/#contacto"]').first()
    const box = await cta.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 })
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: path.join(OUT, "04-home-desktop-custom-cursor.png") })
    console.log("✓ 04-home-desktop-custom-cursor")
    await page.close()
  }

  // Scroll progress desktop en /casos (barra dorada arriba).
  {
    const page = await desktop.newPage()
    await page.goto(`${BASE}/casos-de-exito`, { waitUntil: "networkidle" })
    await scrollToFraction(page, 0.5)
    await page.mouse.move(640, 120, { steps: 6 })
    await page.waitForTimeout(700)
    await page.screenshot({ path: path.join(OUT, "05-casos-desktop-scroll-progress.png") })
    console.log("✓ 05-casos-desktop-scroll-progress")
    await page.close()
  }
  await desktop.close()

  await browser.close()
  console.log(`\nListo → ${OUT}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
