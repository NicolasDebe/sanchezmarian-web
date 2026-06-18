/**
 * Smoke test del rediseño de /servicios (desktop + mobile).
 * Carga la página con Edge headless, verifica que hidrate sin errores de
 * consola, sin overflow horizontal, y que el layout estático v5 se monte
 * (servicio principal + secundarios + alianzas).
 * Ejecutar con el dev/prod server corriendo: npx tsx scripts/smoke-servicios.ts
 */
import { chromium } from "playwright-core"

const URL = "http://localhost:3000/servicios"

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })
  let failed = false

  for (const vp of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    const errors: string[] = []
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message))

    await page.goto(URL, { waitUntil: "networkidle" })
    await page.waitForTimeout(800)

    // ¿Hay overflow horizontal?
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )

    // Layout estático v5: deben montar las secciones principales.
    const hasPrincipal = await page.locator("#svc-principal").count()
    const hasSecundarios = await page.locator("#svc-secundarios").count()
    const hasMentoria = await page.getByText("Mentoría", { exact: false }).count()

    console.log(`\n[${vp.name}] ${vp.width}px`)
    console.log(`  errores consola: ${errors.length}`)
    if (errors.length) errors.slice(0, 5).forEach((e) => console.log("   · " + e))
    console.log(`  overflow horizontal: ${overflow}`)
    console.log(`  servicio principal montado: ${hasPrincipal > 0}`)
    console.log(`  servicios secundarios montados: ${hasSecundarios > 0}`)
    console.log(`  contiene "Mentoría": ${hasMentoria > 0}`)

    if (errors.length > 0 || overflow) failed = true
    if (hasPrincipal === 0 || hasSecundarios === 0) failed = true
    await page.close()
  }

  await browser.close()
  if (failed) {
    console.log("\n❌ Smoke test con problemas.")
    process.exit(1)
  }
  console.log("\n✅ Smoke test OK.")
}

run().catch((e) => {
  console.error("Error fatal:", e)
  process.exit(1)
})
