/** Capturas de verificación del home (hero, servicios bento, contacto). */
import { chromium, type Browser, type Page } from "playwright-core"
import path from "path"
import fs from "fs"

const BASE = process.env.SHOTS_BASE ?? "http://localhost:3000"
const OUT = path.join(process.cwd(), "shots")

async function ready(browser: Browser) {
  const p = await browser.newPage()
  for (let i = 0; i < 60; i++) {
    try {
      const r = await p.goto(BASE, { timeout: 4000, waitUntil: "domcontentloaded" })
      if (r && r.ok()) { await p.close(); return }
    } catch { /* retry */ }
    await p.waitForTimeout(1500)
  }
  await p.close()
  throw new Error("dev server no respondió")
}

async function shotSection(page: Page, selector: string, name: string) {
  const el = await page.$(selector)
  if (!el) { console.log(`✗ ${name} (sin ${selector})`); return }
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  await el.screenshot({ path: path.join(OUT, `${name}.png`) })
  console.log(`✓ ${name}`)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  await ready(browser)

  // ── DESKTOP 1440 ──
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const dp = await desk.newPage()
  await dp.goto(BASE, { waitUntil: "networkidle" })
  await dp.waitForTimeout(800)
  await dp.screenshot({ path: path.join(OUT, "home-hero-desktop.png") })
  console.log("✓ home-hero-desktop")
  await shotSection(dp, "#servicios", "home-servicios-desktop")
  await shotSection(dp, "#contacto", "home-contacto-desktop")
  await dp.close()

  // ── MOBILE 375 ──
  const mob = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const mp = await mob.newPage()
  await mp.goto(BASE, { waitUntil: "networkidle" })
  await mp.waitForTimeout(800)
  await mp.screenshot({ path: path.join(OUT, "home-hero-mobile.png") })
  console.log("✓ home-hero-mobile")
  await shotSection(mp, "#servicios", "home-servicios-mobile")
  await shotSection(mp, "#contacto", "home-contacto-mobile")
  await mp.close()

  await browser.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
