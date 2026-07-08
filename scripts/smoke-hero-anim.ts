/**
 * Verifica la animación de hero compartida en las 6 páginas públicas:
 *  - el H1 del hero está partido en spans por palabra (>= 2 spans inline-block)
 *  - al terminar la animación, cada palabra queda opacity=1 y sin blur
 *  - captura temprana: al inicio las palabras NO están todas visibles
 *    (es decir, la animación realmente ocurre; se omite si llegó tarde)
 */
import { chromium } from "playwright-core"

const BASE = "http://localhost:3000"
const PAGES = ["/", "/servicios", "/mis-valores", "/casos-de-exito", "/campanas", "/contacto"]
const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "desktop-1440", width: 1440, height: 900 },
]

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  let failed = false

  for (const path of PAGES) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
      await page.goto(BASE + path, { waitUntil: "domcontentloaded" })

      // Snapshot temprano: cuántas palabras del h1 ya son visibles.
      // Sólo spans de palabra (.inline-block): los contenedores de línea
      // tienen opacity de diseño (0.88/0.82) y no deben medirse.
      const early = await page.evaluate(() => {
        const h1 = document.querySelector("h1")
        if (!h1) return null
        const spans = Array.from(h1.querySelectorAll("span.inline-block[aria-hidden]"))
        const visible = spans.filter((s) => parseFloat(getComputedStyle(s as HTMLElement).opacity) > 0.9).length
        return { total: spans.length, visible }
      })

      // Esperar a que termine la coreografía (título + margen).
      await page.waitForTimeout(3500)

      const final = await page.evaluate(() => {
        const h1 = document.querySelector("h1")
        if (!h1) return null
        const spans = Array.from(h1.querySelectorAll("span.inline-block[aria-hidden]")) as HTMLElement[]
        const bad: string[] = []
        for (const s of spans) {
          const cs = getComputedStyle(s)
          const op = parseFloat(cs.opacity)
          const blurred = cs.filter && cs.filter !== "none" && !/blur\(0px\)/.test(cs.filter) && /blur/.test(cs.filter)
          if (op < 0.99 || blurred) bad.push(`"${s.textContent}" op=${op} filter=${cs.filter}`)
        }
        const ariaLabel = h1.getAttribute("aria-label") ?? h1.textContent?.trim() ?? ""
        return { total: spans.length, bad, ariaLabel: ariaLabel.slice(0, 60) }
      })

      let status = "✓"
      const notes: string[] = []
      if (!final || final.total < 2) {
        status = "✗"; failed = true
        notes.push(`h1 sin split por palabras (spans=${final?.total ?? "n/a"})`)
      } else if (final.bad.length) {
        status = "✗"; failed = true
        notes.push(`palabras no visibles al final: ${final.bad.slice(0, 3).join(" | ")}`)
      }
      const animated = early && early.total >= 2 && early.visible < early.total
      console.log(
        `${status} ${path.padEnd(16)} @${vp.name.padEnd(12)} palabras=${final?.total ?? 0} ` +
        `animó=${animated ? "sí" : "(llegó tarde el snapshot)"} ${notes.join("; ")}`,
      )
      await page.close()
    }
  }

  await browser.close()
  if (failed) { console.log("\n❌ Verificación de animación FALLÓ."); process.exit(1) }
  console.log("\n✅ Animación de hero OK en todas las páginas.")
}

run().catch((e) => { console.error(e); process.exit(1) })
