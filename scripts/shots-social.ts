/** Verificación de la presencia social en las 4 ubicaciones + touch targets. */
import { chromium, type Browser, type Page } from "playwright-core"
import path from "path"
import fs from "fs"

const BASE = process.env.SHOTS_BASE ?? "http://localhost:3000"
const OUT = path.join(process.cwd(), "shots")
const LINKEDIN = "https://www.linkedin.com/in/marians%C3%A1nchez/"
const INSTAGRAM = "https://www.instagram.com/marian15s/"

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

async function checkLinks(page: Page, label: string) {
  const links = await page.$$eval(
    'a[aria-label*="Marian Sánchez"]',
    (els) =>
      els.map((e) => {
        const a = e as HTMLAnchorElement
        const r = a.getBoundingClientRect()
        return { aria: a.getAttribute("aria-label"), href: a.href, w: Math.round(r.width), h: Math.round(r.height), target: a.target, rel: a.rel }
      }),
  )
  for (const l of links) {
    const okSize = l.h >= 44
    const okHref =
      (l.href.includes("instagram.com/marian15s") && l.href === INSTAGRAM) ||
      (l.href === LINKEDIN)
    const okTab = l.target === "_blank" && l.rel.includes("noopener")
    console.log(
      `  ${okSize && okHref && okTab ? "✓" : "✗"} [${label}] ${l.aria} — ${l.w}x${l.h}px target=${l.target} ${okHref ? "URL✓" : "URL✗ " + l.href}`,
    )
  }
  return links.length
}

async function shotSection(page: Page, selector: string, name: string) {
  const el = await page.$(selector)
  if (!el) { console.log(`✗ ${name} (sin ${selector})`); return }
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await el.screenshot({ path: path.join(OUT, `${name}.png`) })
  console.log(`✓ shot ${name}`)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  await ready(browser)

  // ── DESKTOP 1440 ──
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const dp = await desk.newPage()
  await dp.goto(BASE, { waitUntil: "networkidle" })
  await dp.waitForTimeout(700)
  console.log("\n── NAV desktop ──")
  await checkLinks(dp, "nav-desk")
  await dp.locator("header").screenshot({ path: path.join(OUT, "social-nav-desktop.png") })
  console.log("✓ shot social-nav-desktop")

  console.log("\n── BIO desktop ──")
  await shotSection(dp, "#bio", "social-bio-desktop")

  console.log("\n── CTA FINAL desktop ──")
  await shotSection(dp, "#contacto", "social-cta-desktop")

  console.log("\n── FOOTER desktop ──")
  await shotSection(dp, "footer", "social-footer-desktop")
  // contar todos los links sociales presentes en la página completa
  const total = await checkLinks(dp, "page-total")
  console.log(`  total links sociales en home: ${total}`)
  await dp.close()

  // ── MOBILE 375 — menú hamburguesa ──
  const mob = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const mp = await mob.newPage()
  await mp.goto(BASE, { waitUntil: "networkidle" })
  await mp.waitForTimeout(600)
  console.log("\n── NAV mobile (menú abierto) ──")
  await mp.click('button[aria-label="Abrir menú"]')
  await mp.waitForTimeout(500)
  await checkLinks(mp, "nav-mobile")
  await mp.locator("#mobile-menu").screenshot({ path: path.join(OUT, "social-nav-mobile.png") })
  console.log("✓ shot social-nav-mobile")
  await mp.close()

  await browser.close()
  console.log("\n✅ verificación completa — shots en /shots")
}

main().catch((e) => { console.error(e); process.exit(1) })
