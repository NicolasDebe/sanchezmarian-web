/**
 * Tests E2E del PhotoManager (drag & drop, alt editable, compresión, delete).
 * Usa Playwright con el Edge del sistema contra el dev server.
 * Ejecutar con el dev server corriendo: npx tsx scripts/e2e-photo-manager.ts
 * Auto-limpiante: borra la campaña, el usuario y los archivos de prueba.
 */
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { chromium, type Page } from "playwright-core"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const URL_BASE = "http://localhost:3000"
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const BUCKET = "campaign-images"
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

let pass = 0
let fail = 0
function check(name: string, ok: boolean, detail = "") {
  if (ok) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} ${detail}`) }
}

const TEST_SLUG = "test-e2e-photomanager"
const NEW_SLUG = "test-e2e-pm-nueva"
const TEST_EMAIL = "e2e-pm@test.local"
const TEST_PASS = "e2e-Pm-" + Math.random().toString(36).slice(2)

// PNG 1x1 transparente
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
)

async function cleanup() {
  for (const slugLike of [TEST_SLUG, NEW_SLUG]) {
    const { data: c } = await admin.from("campaigns").select("id, slug").like("slug", `${slugLike}%`)
    for (const row of c ?? []) {
      await admin.from("campaign_images").delete().eq("campaign_id", row.id)
      await admin.from("campaigns").delete().eq("id", row.id)
      const { data: files } = await admin.storage.from(BUCKET).list(row.slug)
      if (files?.length) {
        await admin.storage.from(BUCKET).remove(files.map((f) => `${row.slug}/${f.name}`))
      }
    }
    const { data: files } = await admin.storage.from(BUCKET).list(slugLike)
    if (files?.length) {
      await admin.storage.from(BUCKET).remove(files.map((f) => `${slugLike}/${f.name}`))
    }
  }
  const { data: users } = await admin.auth.admin.listUsers()
  const u = users?.users.find((x) => x.email === TEST_EMAIL)
  if (u) await admin.auth.admin.deleteUser(u.id)
}

/** Crea la campaña de prueba con 4 fotos en el bucket. */
async function seedCampaign(): Promise<{ id: string; imageIds: string[] }> {
  let ins = await admin.from("campaigns").insert({
    slug: TEST_SLUG, brand: "Test PM", title: "Campaña PhotoManager E2E",
    description: "Descripción de prueba con más de cincuenta caracteres para validar bien.",
    content: "<p>" + "Contenido de prueba suficientemente largo. ".repeat(5) + "</p>",
    status: "active", date: "Junio 2026",
  }).select().single()
  if (ins.error?.code === "23514") {
    ins = await admin.from("campaigns").insert({
      slug: TEST_SLUG, brand: "Test PM", title: "Campaña PhotoManager E2E",
      description: "Descripción de prueba con más de cincuenta caracteres para validar bien.",
      content: "<p>" + "Contenido de prueba suficientemente largo. ".repeat(5) + "</p>",
      status: "ACTIVA", date: "Junio 2026",
    }).select().single()
  }
  if (ins.error) throw new Error("seed campaign: " + ins.error.message)

  const imageIds: string[] = []
  for (let i = 0; i < 4; i++) {
    const p = `${TEST_SLUG}/foto-${i}.png`
    const up = await admin.storage.from(BUCKET).upload(p, TINY_PNG, { contentType: "image/png" })
    if (up.error) throw new Error("seed upload: " + up.error.message)
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(p)
    const row = await admin.from("campaign_images").insert({
      campaign_id: ins.data!.id, url: pub.publicUrl, alt: `Alt original ${i}`, position: i,
    }).select().single()
    if (row.error) throw new Error("seed image row: " + row.error.message)
    imageIds.push(row.data!.id as string)
  }
  return { id: ins.data!.id as string, imageIds }
}

/** Orden actual de las fotos en el grid (por src de los <img>). */
async function gridOrder(page: Page): Promise<string[]> {
  return page.$$eval(
    "div.photo-card-enter img",
    (imgs) => imgs.map((el) => (el as HTMLImageElement).src.split("/").pop()!.split("?")[0]),
  )
}

async function dbOrder(campaignId: string): Promise<string[]> {
  const { data } = await admin
    .from("campaign_images")
    .select("url, position")
    .eq("campaign_id", campaignId)
    .order("position", { ascending: true })
  return (data ?? []).map((r) => (r.url as string).split("/").pop()!)
}

async function main() {
  await cleanup()
  const { id: campaignId } = await seedCampaign()

  await admin.auth.admin.createUser({ email: TEST_EMAIL, password: TEST_PASS, email_confirm: true })

  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(20000)
  if (process.env.E2E_DEBUG) {
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning")
        console.log("  [console]", m.type(), m.text().slice(0, 300))
    })
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message.slice(0, 500)))
  }

  try {
    // ── Login ──
    console.log("\n[Login]")
    await page.goto(`${URL_BASE}/admin/login`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL("**/admin/dashboard**", { timeout: 45000 })
    check("login OK", page.url().includes("/admin/dashboard"))

    // ── Test 2: editar muestra las fotos en grid ──
    console.log("\n[Grid en /editar]")
    await page.goto(`${URL_BASE}/admin/campanas/${TEST_SLUG}/editar`)
    await page.waitForSelector("div.photo-card-enter img")
    const initialOrder = await gridOrder(page)
    check("grid muestra las 4 fotos", initialOrder.length === 4, `→ ${initialOrder.length}`)
    const badgeFirst = await page.locator("div.photo-card-enter").first().locator("span:has-text('Destacada')").count()
    const badgeRest = await page.locator("div.photo-card-enter").nth(1).locator("span:has-text('Destacada')").count()
    check("badge Destacada solo en la primera", badgeFirst === 1 && badgeRest === 0,
      `→ first=${badgeFirst} second=${badgeRest}`)

    // ── Test 3+4: drag & drop + persistencia ──
    console.log("\n[Drag & drop]")
    const cards = page.locator("div.photo-card-enter [aria-label*='Arrastrá para reordenar']")
    const first = cards.nth(0)
    const third = cards.nth(2)
    const fromBox = (await first.boundingBox())!
    const toBox = (await third.boundingBox())!
    const fromX = fromBox.x + fromBox.width / 2
    const fromY = fromBox.y + fromBox.height / 2
    const toX = toBox.x + toBox.width / 2
    const toY = toBox.y + toBox.height / 2
    await first.hover()
    await page.mouse.down()
    // movimiento corto para superar el activationConstraint (8px) y activar el sensor
    await page.mouse.move(fromX + 12, fromY, { steps: 4 })
    await page.waitForTimeout(250)
    // trayecto al destino, despacio para que dnd-kit detecte colisiones
    for (let i = 1; i <= 20; i++) {
      await page.mouse.move(fromX + ((toX - fromX) * i) / 20, fromY + ((toY - fromY) * i) / 20)
      await page.waitForTimeout(50)
    }
    await page.waitForTimeout(400)
    await page.mouse.up()
    await page.waitForTimeout(2000) // server action reorderImages

    const afterDrag = await gridOrder(page)
    // El slot exacto depende de cómo se reorganizan las cards durante el drag:
    // lo que importa es que la primera se movió y las demás conservan su orden.
    const moved = afterDrag[0] !== initialOrder[0]
    const restInOrder =
      afterDrag.filter((n) => n !== initialOrder[0]).join(",") ===
      initialOrder.slice(1).join(",")
    check("la card se movió y las demás se reorganizaron", moved && restInOrder,
      `→ ${afterDrag.join(",")} (inicial ${initialOrder.join(",")})`)

    await page.reload()
    await page.waitForSelector("div.photo-card-enter img")
    const afterReload = await gridOrder(page)
    check("el orden persiste tras recargar", JSON.stringify(afterReload) === JSON.stringify(afterDrag),
      `→ ${afterReload.join(",")}`)
    const inDb = await dbOrder(campaignId)
    check("positions en DB = 0..3 en el nuevo orden", JSON.stringify(inDb) === JSON.stringify(afterDrag),
      `→ ${inDb.join(",")}`)

    // ── Test 5+6: alt editable ──
    console.log("\n[Alt editable]")
    await page.click("[aria-label='Editar texto alternativo de la foto 1']")
    const altInput = page.locator("input[placeholder*='texto alternativo']")
    check("input de alt aparece", await altInput.count() === 1)
    await altInput.fill("Nuevo alt de prueba E2E")
    await page.keyboard.press("Enter")
    await page.waitForTimeout(1200)
    await page.reload()
    await page.waitForSelector("div.photo-card-enter img")
    const altShown = await page.locator("div.photo-card-enter").first().textContent()
    check("alt persiste tras recargar", (altShown ?? "").includes("Nuevo alt de prueba E2E"), `→ ${altShown}`)

    // ── Test 7: subir foto grande → se comprime a <2MB y .webp ──
    console.log("\n[Compresión al subir]")
    const beforeFiles = new Set(
      ((await admin.storage.from(BUCKET).list(TEST_SLUG)).data ?? []).map((f) => f.name),
    )
    const originalSize = await page.evaluate(async () => {
      // Imagen "tipo foto": gradientes + formas + ruido suave, apuntando a 5-10MB
      const canvas = document.createElement("canvas")
      canvas.width = 4000
      canvas.height = 3000
      const ctx2 = canvas.getContext("2d")!
      const grad = ctx2.createLinearGradient(0, 0, 4000, 3000)
      grad.addColorStop(0, "#1C2E4A")
      grad.addColorStop(0.5, "#C1644A")
      grad.addColorStop(1, "#F7F4EF")
      ctx2.fillStyle = grad
      ctx2.fillRect(0, 0, 4000, 3000)
      for (let i = 0; i < 4000; i++) {
        ctx2.fillStyle = `hsla(${Math.random() * 360}, 60%, 50%, 0.35)`
        ctx2.beginPath()
        ctx2.arc(Math.random() * 4000, Math.random() * 3000, Math.random() * 80 + 4, 0, Math.PI * 2)
        ctx2.fill()
      }
      let blob: Blob | null = null
      for (const noise of [0.05, 0.1, 0.18, 0.28]) {
        const img = ctx2.getImageData(0, 0, 4000, 3000)
        for (let i = 0; i < img.data.length; i += 4) {
          const n = (Math.random() - 0.5) * 255 * noise
          img.data[i] += n
          img.data[i + 1] += n
          img.data[i + 2] += n
        }
        ctx2.putImageData(img, 0, 0)
        blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.97))
        if (blob!.size > 5 * 1024 * 1024) break
      }
      if (blob!.size > 10 * 1024 * 1024) {
        blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.85))
      }
      const file = new File([blob!], "muestra-grande.jpg", { type: "image/jpeg" })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const dt = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
      input.dispatchEvent(new Event("change", { bubbles: true }))
      return file.size
    })
    console.log(`  ℹ original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)
    await page.waitForFunction(
      () => document.querySelectorAll("div.photo-card-enter img").length === 5,
      undefined,
      { timeout: 90000 },
    )
    const afterList = (await admin.storage.from(BUCKET).list(TEST_SLUG)).data ?? []
    const newFile = afterList.find((f) => !beforeFiles.has(f.name))
    const newSize = (newFile?.metadata as { size?: number } | undefined)?.size ?? 0
    console.log(`  ℹ comprimida: ${newFile?.name} → ${(newSize / 1024 / 1024).toFixed(2)} MB`)
    check("archivo subido termina en .webp", !!newFile?.name.endsWith(".webp"), `→ ${newFile?.name}`)
    check("pesa menos de 2MB", newSize > 0 && newSize < 2 * 1024 * 1024, `→ ${newSize}`)
    check("original era mayor a 2MB", originalSize > 2 * 1024 * 1024, `→ ${originalSize}`)

    // ── Test 7b: foto chica (<500KB) se sube sin convertir ──
    console.log("\n[Skip de compresión <500KB]")
    await page.evaluate(async () => {
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 150
      const ctx2 = canvas.getContext("2d")!
      ctx2.fillStyle = "#66001F"
      ctx2.fillRect(0, 0, 200, 150)
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9))
      const file = new File([blob], "muestra-chica.jpg", { type: "image/jpeg" })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const dt = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
      input.dispatchEvent(new Event("change", { bubbles: true }))
    })
    await page.waitForFunction(
      () => document.querySelectorAll("div.photo-card-enter img").length === 6,
      undefined,
      { timeout: 30000 },
    )
    const afterSmall = (await admin.storage.from(BUCKET).list(TEST_SLUG)).data ?? []
    const smallFile = afterSmall.find((f) => f.name.includes("muestra-chica"))
    check("foto chica conserva .jpg (sin convertir)", !!smallFile?.name.endsWith(".jpg"), `→ ${smallFile?.name}`)

    // ── Test 9: eliminar una foto → grid y bucket ──
    console.log("\n[Eliminar foto]")
    const { data: rowsBefore } = await admin
      .from("campaign_images").select("id, url").eq("campaign_id", campaignId).order("position")
    const victimUrl = (rowsBefore![1].url as string)
    await page.click("[aria-label='Eliminar foto 2']")
    await page.waitForFunction(
      () => document.querySelectorAll("div.photo-card-enter img").length === 5,
      undefined,
      { timeout: 20000 },
    )
    // La UI es optimista: el server sigue borrando + compactando. Polleamos la DB.
    let rowsAfter: { position: number }[] = []
    for (let t = 0; t < 30; t++) {
      const { data } = await admin
        .from("campaign_images").select("position").eq("campaign_id", campaignId).order("position")
      rowsAfter = data ?? []
      if (rowsAfter.length === 5 && rowsAfter.every((r, i) => r.position === i)) break
      await new Promise((r) => setTimeout(r, 500))
    }
    check("fila eliminada de campaign_images", rowsAfter.length === 5, `→ ${rowsAfter.length}`)
    check("positions compactadas 0..4",
      rowsAfter.every((r, i) => r.position === i),
      `→ ${rowsAfter.map((r) => r.position).join(",")}`)
    const headGone = await fetch(victimUrl, { method: "HEAD" })
    check("archivo borrado del bucket", !headGone.ok, `→ ${headGone.status}`)

    // ── Test 10: el detalle público refleja el orden ──
    console.log("\n[Página pública refleja el orden]")
    const orderNow = await dbOrder(campaignId)
    const detail = await fetch(`${URL_BASE}/campanas/${TEST_SLUG}`)
    const detailHtml = await detail.text()
    check("detalle público responde 200", detail.ok, `→ ${detail.status}`)
    const positions = orderNow.map((name) => detailHtml.indexOf(name))
    check("las fotos aparecen en el HTML en el orden nuevo",
      positions.every((p, i) => p > 0 && (i === 0 || p > positions[i - 1])),
      `→ ${positions.join(",")}`)

    // ── Test 13: drag con teclado (KeyboardSensor) ──
    console.log("\n[Accesibilidad: teclado]")
    const kbBefore = await gridOrder(page)
    const firstCard = page.locator("div.photo-card-enter [aria-label*='Arrastrá para reordenar']").first()
    await firstCard.focus()
    await page.keyboard.press("Space")
    await page.waitForTimeout(300)
    await page.keyboard.press("ArrowRight")
    await page.waitForTimeout(300)
    await page.keyboard.press("Space")
    await page.waitForTimeout(1500)
    const kbAfter = await gridOrder(page)
    check("drag con teclado (Space + flechas) reordena",
      kbAfter[1] === kbBefore[0] && kbAfter[0] === kbBefore[1],
      `→ ${kbAfter.join(",")}`)

    // ── Test 12: campaña nueva con fotos pendientes → flush al guardar ──
    console.log("\n[Campaña nueva: fotos pendientes]")
    await page.goto(`${URL_BASE}/admin/campanas/nueva`)
    await page.waitForSelector("input.admin-input")
    await page.fill("input.admin-input >> nth=0", "Campaña nueva E2E PhotoManager")
    // slug manual para que sea predecible
    await page.click("text=Editar slug")
    await page.fill("input.admin-input.font-mono", NEW_SLUG)
    await page.fill("input[placeholder*='Grupo Presidente']", "Marca E2E")
    await page.fill("textarea.admin-textarea", "Descripción corta de prueba con bastante más de cincuenta caracteres en total.")
    await page.click(".ProseMirror")
    await page.keyboard.type(
      "Contenido expandido de prueba para la campaña nueva. ".repeat(4),
      { delay: 1 },
    )
    // estado Activa (draft puede estar bloqueado pre-migración)
    await page.click("text=Activa")
    // 3 fotos chicas pendientes
    await page.evaluate(async () => {
      const canvas = document.createElement("canvas")
      canvas.width = 300
      canvas.height = 225
      const ctx2 = canvas.getContext("2d")!
      const files: File[] = []
      for (const color of ["#66001F", "#C9A882", "#F0E8D8"]) {
        ctx2.fillStyle = color
        ctx2.fillRect(0, 0, 300, 225)
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"))
        files.push(new File([blob], `pendiente-${color.slice(1)}.png`, { type: "image/png" }))
      }
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const dt = new DataTransfer()
      for (const f of files) dt.items.add(f)
      input.files = dt.files
      input.dispatchEvent(new Event("change", { bubbles: true }))
    })
    await page.waitForFunction(
      () => document.querySelectorAll("div.photo-card-enter img").length === 3,
      undefined,
      { timeout: 30000 },
    )
    const blobPreviews = await page.$$eval("div.photo-card-enter img", (imgs) =>
      imgs.every((el) => (el as HTMLImageElement).src.startsWith("blob:")),
    )
    check("las 3 fotos pendientes son previews locales (blob:)", blobPreviews)
    const bucketPre = (await admin.storage.from(BUCKET).list(NEW_SLUG)).data ?? []
    check("el bucket sigue vacío antes de guardar", bucketPre.length === 0, `→ ${bucketPre.length}`)

    await page.click("button:has-text('Publicar')")
    await page.waitForURL("**/admin/campanas", { timeout: 60000 })
    const { data: newCampaign } = await admin
      .from("campaigns").select("id, slug").eq("slug", NEW_SLUG).maybeSingle()
    check("campaña creada con el slug correcto", !!newCampaign)
    const { data: newImgs } = await admin
      .from("campaign_images").select("position").eq("campaign_id", newCampaign?.id ?? "").order("position")
    check("3 filas en campaign_images con positions 0,1,2",
      newImgs?.length === 3 && newImgs.every((r, i) => r.position === i),
      `→ ${newImgs?.map((r) => r.position).join(",")}`)
    const bucketPost = (await admin.storage.from(BUCKET).list(NEW_SLUG)).data ?? []
    check("3 archivos en el bucket bajo el slug", bucketPost.length === 3, `→ ${bucketPost.length}`)

    // ── Test 11: touch (emulación) ──
    console.log("\n[Touch en mobile]")
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    })
    const mPage = await mobile.newPage()
    mPage.setDefaultTimeout(20000)
    // reutilizo la sesión: copio cookies
    await mobile.addCookies(await ctx.cookies())
    await mPage.goto(`${URL_BASE}/admin/campanas/${TEST_SLUG}/editar`)
    await mPage.waitForSelector("div.photo-card-enter img")
    const mCols = await mPage.$$eval("div.photo-card-enter", (cards) => {
      const firstTop = (cards[0] as HTMLElement).getBoundingClientRect().top
      return cards.filter((c) => (c as HTMLElement).getBoundingClientRect().top === firstTop).length
    })
    check("mobile: grid de 1 columna", mCols === 1, `→ ${mCols}`)
    check("mobile: cards renderizadas con touch habilitado",
      (await mPage.locator("div.photo-card-enter").count()) === 5)
    await mobile.close()
  } catch (e) {
    await page.screenshot({ path: "scripts/e2e-pm-failure.png", fullPage: true }).catch(() => {})
    console.log("  BODY:", (await page.locator("body").innerText().catch(() => "?")).slice(0, 600))
    throw e
  } finally {
    await browser.close()
    await cleanup()
  }

  console.log(`\n━━━ Resultado: ${pass} pass / ${fail} fail ━━━`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch(async (e) => {
  console.error("FATAL:", e)
  await cleanup()
  process.exit(1)
})
