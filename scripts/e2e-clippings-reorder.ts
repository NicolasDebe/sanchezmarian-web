/**
 * E2E del reorder de clientes en /admin/clippings (lista vertical + drag&drop).
 * Reproduce el flujo real: login → /admin/clippings → arrastrar (vía teclado,
 * que ejercita el MISMO handleDragEnd → reorderClients que el mouse y además
 * cubre accesibilidad) → verifica en DB → recarga → confirma persistencia.
 *
 * SIEMPRE restaura el order_position original al terminar (el dev local pega
 * contra la Supabase de producción).
 *
 * Uso:  npx tsx scripts/e2e-clippings-reorder.ts        (dev en :3000 corriendo)
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

const TEST_EMAIL = "e2e-reorder@test.local"
const TEST_PASS = "e2e-Reorder-" + Math.random().toString(36).slice(2)

type Row = { id: string; name: string; slug: string; order_position: number }

async function readOrder(): Promise<Row[]> {
  const { data, error } = await admin
    .from("clients")
    .select("id, name, slug, order_position")
    .eq("is_active", true)
    .order("order_position", { ascending: true })
  if (error || !data) throw new Error("No se pudo leer clients: " + error?.message)
  return data as Row[]
}

async function restore(original: Row[]) {
  await Promise.all(
    original.map((r) =>
      admin.from("clients").update({ order_position: r.order_position }).eq("id", r.id),
    ),
  )
}

async function cleanupUser() {
  const { data: users } = await admin.auth.admin.listUsers()
  const u = users?.users.find((x) => x.email === TEST_EMAIL)
  if (u) await admin.auth.admin.deleteUser(u.id)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  console.log(`\n━━━ E2E reorder clippings contra ${URL_BASE} ━━━`)
  let pass = true
  const fail = (msg: string) => {
    pass = false
    console.log("  ✗ " + msg)
  }

  const original = await readOrder()
  console.log(`\n[0] Orden original (${original.length} clientes):`)
  original.forEach((r) => console.log(`    ${String(r.order_position).padStart(4)}  ${r.name}`))

  await cleanupUser()
  await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASS,
    email_confirm: true,
  })

  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  const logs: string[] = []
  page.on("console", (m) => {
    if (m.type() === "error") logs.push(`[error] ${m.text().slice(0, 400)}`)
  })
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message.slice(0, 400)}`))

  try {
    // ── Login ──
    console.log("\n[1] Login")
    await page.goto(`${URL_BASE}/admin/login`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL("**/admin/dashboard**", { timeout: 60000 })
    console.log("  ✓ login OK")

    // ── Lista (NO grid) ──
    console.log("\n[2] /admin/clippings es lista vertical")
    await page.goto(`${URL_BASE}/admin/clippings`)
    await page.waitForSelector('ul[role="list"]')
    const handles = page.locator('button[aria-label="Arrastrar para reordenar"]')
    const handleCount = await handles.count()
    const rowCount = await page.locator('ul[role="list"] > li').count()
    console.log(`    filas=${rowCount}  handles=${handleCount}`)
    if (handleCount === original.length && rowCount === original.length) {
      console.log("  ✓ lista vertical con un handle por fila")
    } else {
      fail(`esperaba ${original.length} filas/handles`)
    }

    // Nombres renderizados en orden
    const renderedNames = await page.locator('ul[role="list"] > li').evaluateAll((lis) =>
      lis.map((li) => (li.querySelector("a span")?.textContent ?? "").trim()),
    )
    console.log("    render:", renderedNames.join(" | "))
    if (renderedNames[0] === original[0].name) console.log("  ✓ orden render coincide con DB")
    else fail(`primer render '${renderedNames[0]}' ≠ DB '${original[0].name}'`)

    // ── Drag por teclado: mover el 1º al final ──
    console.log(`\n[3] Mover '${original[0].name}' al final (teclado)`)
    const firstHandle = handles.first()
    await firstHandle.focus()
    await page.keyboard.press("Space") // pick up
    await sleep(250)
    for (let i = 0; i < original.length - 1; i++) {
      await page.keyboard.press("ArrowDown")
      await sleep(120)
    }
    await page.keyboard.press("Space") // drop
    console.log("  · soltado")

    // Toast de éxito
    const toastOk = await page
      .waitForSelector("text=Orden actualizado", { timeout: 15000 })
      .then(() => true)
      .catch(() => false)
    if (toastOk) console.log("  ✓ toast 'Orden actualizado'")
    else fail("no apareció el toast de éxito")

    await sleep(1500) // dar tiempo al server action / revalidate

    // ── Verificación en DB ──
    console.log("\n[4] Verificación en DB")
    const after = await readOrder()
    after.forEach((r) => console.log(`    ${String(r.order_position).padStart(4)}  ${r.name}`))
    const movedNowLast = after[after.length - 1].id === original[0].id
    const secondNowFirst = after[0].id === original[1].id
    if (movedNowLast) console.log(`  ✓ '${original[0].name}' quedó último`)
    else fail(`'${original[0].name}' no quedó último`)
    if (secondNowFirst) console.log(`  ✓ '${original[1].name}' quedó primero`)
    else fail(`'${original[1].name}' no quedó primero`)
    // order_position contiguos 10,20,...
    const contiguous = after.every((r, i) => r.order_position === (i + 1) * 10)
    if (contiguous) console.log("  ✓ order_position renormalizado (10,20,30…)")
    else fail("order_position no quedó en gaps de 10")

    // ── Persistencia tras recarga ──
    console.log("\n[5] Recargar y confirmar persistencia")
    await page.goto(`${URL_BASE}/admin/clippings`)
    await page.waitForSelector('ul[role="list"]')
    const afterReload = await page.locator('ul[role="list"] > li').evaluateAll((lis) =>
      lis.map((li) => (li.querySelector("a span")?.textContent ?? "").trim()),
    )
    console.log("    render:", afterReload.join(" | "))
    if (afterReload[0] === original[1].name && afterReload[afterReload.length - 1] === original[0].name)
      console.log("  ✓ el nuevo orden persiste tras recargar")
    else fail("el orden no persistió tras recargar")

    console.log("\n[6] Consola del navegador")
    if (logs.length === 0) console.log("  (sin errores)")
    else logs.forEach((l) => console.log("  " + l))
  } catch (e) {
    fail("excepción: " + (e instanceof Error ? e.message : String(e)))
    await page.screenshot({ path: "scripts/e2e-reorder-failure.png", fullPage: true }).catch(() => {})
  } finally {
    await browser.close()
    console.log("\n[7] Restaurando orden original…")
    await restore(original)
    const restored = await readOrder()
    const ok = restored.every((r, i) => r.id === original[i].id && r.order_position === original[i].order_position)
    console.log(ok ? "  ✓ orden original restaurado" : "  ✗ FALLÓ la restauración (revisar manualmente)")
    if (!ok) pass = false
    await cleanupUser()
  }

  console.log(pass ? "\n✅ E2E REORDER OK\n" : "\n❌ E2E REORDER CON FALLOS\n")
  process.exit(pass ? 0 : 1)
}

main().catch((e) => {
  console.error("FATAL:", e)
  process.exit(1)
})
