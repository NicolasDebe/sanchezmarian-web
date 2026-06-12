/**
 * Diagnóstico E2E del alta de clippings: reproduce el flujo real del usuario
 * (login → /admin/clippings/{slug} → modal Nuevo clipping → Guardar) y captura
 * la consola del navegador, el error de la UI y el estado final en la DB.
 *
 * Uso:  npx tsx scripts/e2e-clippings-diag.ts                 (local :3000)
 *       E2E_BASE=https://project-mfdly.vercel.app npx tsx scripts/e2e-clippings-diag.ts
 *
 * Auto-limpiante: borra el clipping y el usuario de prueba.
 */
import { createClient } from "@supabase/supabase-js"
import { chromium } from "playwright-core"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const URL_BASE = process.env.E2E_BASE ?? "http://localhost:3000"
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

const TEST_EMAIL = "e2e-clip-diag@test.local"
const TEST_PASS = "e2e-Clip-" + Math.random().toString(36).slice(2)
const TEST_URL = "https://www.losandes.com.ar/diag-e2e-clipping-test"

async function cleanup() {
  await admin.from("clippings").delete().eq("url", TEST_URL)
  const { data: users } = await admin.auth.admin.listUsers()
  const u = users?.users.find((x) => x.email === TEST_EMAIL)
  if (u) await admin.auth.admin.deleteUser(u.id)
}

async function main() {
  console.log(`\n━━━ Diagnóstico clippings contra ${URL_BASE} ━━━`)
  await cleanup()

  const { data: client } = await admin
    .from("clients")
    .select("id, slug, name")
    .order("order_position")
    .limit(1)
    .single()
  if (!client) throw new Error("No hay clientes en la tabla clients")
  console.log(`Cliente de prueba: ${client.name} (${client.slug})`)

  await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASS,
    email_confirm: true,
  })

  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)

  const consoleLogs: string[] = []
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      consoleLogs.push(`[${m.type()}] ${m.text().slice(0, 800)}`)
  })
  page.on("pageerror", (e) => consoleLogs.push(`[pageerror] ${e.message.slice(0, 800)}`))
  page.on("requestfailed", (r) =>
    consoleLogs.push(`[requestfailed] ${r.method()} ${r.url()} → ${r.failure()?.errorText}`),
  )
  page.on("response", (r) => {
    if (r.status() >= 400)
      consoleLogs.push(`[http ${r.status()}] ${r.request().method()} ${r.url()}`)
  })

  try {
    // ── Login ──
    console.log("\n[1] Login")
    await page.goto(`${URL_BASE}/admin/login`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL("**/admin/dashboard**", { timeout: 60000 })
    console.log("  ✓ login OK")

    // ── Abrir el modal ──
    console.log("\n[2] Modal Nuevo clipping")
    await page.goto(`${URL_BASE}/admin/clippings/${client.slug}`)
    await page.click("button:has-text('Nuevo clipping')")
    await page.waitForSelector("#clip-url")
    console.log("  ✓ modal abierto")

    // ── Completar el formulario ──
    await page.fill("#clip-url", TEST_URL)
    await page.fill("#clip-medium", "DIAG Test")
    await page.fill("#clip-title", "Test clipping diagnóstico")
    await page.fill("#clip-date", "2026-06-12")
    await page.selectOption("#clip-scope", "local")
    await page.selectOption("#clip-format", "Digital")
    console.log("  ✓ formulario completo")

    // ── Guardar ──
    console.log("\n[3] Guardar")
    await page.getByRole("button", { name: "Guardar", exact: true }).click()

    // Esperamos el desenlace: toast de éxito o error en el modal
    const outcome = await Promise.race([
      page
        .waitForSelector("text=Clipping guardado.", { timeout: 25000 })
        .then(() => "success" as const),
      page
        .waitForFunction(
          () => {
            const modal = document.querySelector(".fixed.inset-0")
            if (!modal) return false
            const errs = modal.querySelectorAll("p.mt-3.font-sans.text-sm, p.font-sans.text-xs")
            return Array.from(errs).some((p) => (p.textContent ?? "").trim().length > 0)
          },
          undefined,
          { timeout: 25000 },
        )
        .then(() => "error-shown" as const),
    ]).catch(() => "timeout" as const)

    console.log(`  Resultado UI: ${outcome}`)

    if (outcome !== "success") {
      const modalText = await page
        .locator(".fixed.inset-0")
        .innerText()
        .catch(() => "(modal no legible)")
      console.log("  ── Texto del modal ──")
      console.log(
        modalText
          .split("\n")
          .map((l) => "  | " + l)
          .join("\n"),
      )
      await page.screenshot({ path: "scripts/e2e-clip-diag-failure.png", fullPage: true })
    }

    // ── Verificación en DB ──
    console.log("\n[4] Verificación en DB")
    const { data: row } = await admin
      .from("clippings")
      .select("id, medium, title, published_at, created_by")
      .eq("url", TEST_URL)
      .maybeSingle()
    console.log(row ? `  ✓ fila insertada: ${JSON.stringify(row)}` : "  ✗ NO hay fila en la DB")

    // ── Consola del navegador ──
    console.log("\n[5] Consola del navegador")
    if (consoleLogs.length === 0) console.log("  (sin errores de consola)")
    for (const l of consoleLogs) console.log("  " + l)

    process.exitCode = outcome === "success" && row ? 0 : 1
  } catch (e) {
    await page.screenshot({ path: "scripts/e2e-clip-diag-failure.png", fullPage: true }).catch(() => {})
    console.error("FATAL:", e)
    console.log("\nConsola del navegador:")
    for (const l of consoleLogs) console.log("  " + l)
    process.exitCode = 1
  } finally {
    await browser.close()
    await cleanup()
  }
}

main().catch(async (e) => {
  console.error("FATAL:", e)
  await cleanup()
  process.exit(1)
})
