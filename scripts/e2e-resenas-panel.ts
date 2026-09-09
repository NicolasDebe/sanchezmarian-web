/**
 * Panel de moderación /admin/resenas, contra el navegador y la base reales.
 *
 *   npx tsx scripts/e2e-resenas-panel.ts     (con el dev server corriendo)
 *
 * Complementa a e2e-resenas-moderacion.ts: aquel prueba la capa de datos, este
 * prueba lo que Marian ve y toca. Requiere la migración 20260908 aplicada.
 *
 * AUTO-LIMPIANTE: todo lo que crea lleva el prefijo E2E_PREFIX en el email y se
 * borra al final, falle o no. No toca ninguna reseña real.
 *
 * Usa el Edge del sistema vía playwright-core (no baja ningún navegador), igual
 * que e2e-photo-manager.ts.
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { chromium, type Page } from "playwright-core"
import { createClient } from "@supabase/supabase-js"

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000"
const E2E_PREFIX = "e2e-panel-"
const TEST_EMAIL = `${E2E_PREFIX}admin@test.local`
const TEST_PASS = "Test1234!panel"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

let pass = 0
let fail = 0
function check(label: string, ok: boolean, detail = "") {
  if (ok) {
    pass++
    console.log(`  ok   ${label}`)
  } else {
    fail++
    console.log(`  FAIL ${label}${detail ? ` → ${detail}` : ""}`)
  }
}

/** Marcas únicas por estado: son el texto por el que se busca cada fila. */
const MARCAS = {
  pendiente: "Zzz Panel Pendiente",
  publicada: "Zzz Panel Publicada",
  rechazada: "Zzz Panel Rechazada",
  sinVerificar: "Zzz Panel Sin Verificar",
}

const BODY =
  "Trabajar con Marian fue clarísimo de punta a punta. Entiende los tiempos de la redacción, manda material chequeado y nunca insiste de más. Es de las pocas consultoras que entiende cómo trabajamos del otro lado del mostrador."

const DIA = 24 * 60 * 60 * 1000

async function seed() {
  const now = new Date().toISOString()
  // Cada fila tiene columnas distintas según el estado, así que se tipan
  // sueltas: si no, TS infiere una unión y el insert no la acepta.
  const rows: { key: string; row: Record<string, unknown> }[] = [
    {
      key: "pendiente",
      row: {
        reviewer_type: "periodista",
        author_name: "Zzz Pendiente",
        author_role: "Editora de Economía",
        author_brand: MARCAS.pendiente,
        author_url: "https://example.com/pendiente",
        rating: 5,
        body: BODY,
        author_email: `${E2E_PREFIX}1@example.com`,
        status: "pending_review",
        verified_at: now,
      },
    },
    {
      key: "publicada",
      row: {
        reviewer_type: "marca",
        author_name: "Zzz Publicada",
        author_role: "Directora de Marketing",
        author_brand: MARCAS.publicada,
        author_url: "https://example.com/publicada",
        rating: 4,
        body: BODY,
        author_email: `${E2E_PREFIX}2@example.com`,
        status: "published",
        verified_at: now,
        published_at: now,
      },
    },
    {
      key: "rechazada",
      row: {
        reviewer_type: "marca",
        author_name: "Zzz Rechazada",
        author_role: "Fundador",
        author_brand: MARCAS.rechazada,
        author_url: "https://example.com/rechazada",
        rating: 2,
        body: BODY,
        author_email: `${E2E_PREFIX}3@example.com`,
        status: "rejected",
        verified_at: now,
        moderated_at: now,
        moderated_by: "alguien@anterior.test",
        moderation_note: "Motivo viejo de prueba",
      },
    },
    {
      key: "sinVerificar",
      row: {
        reviewer_type: "marca",
        author_name: "Zzz Sin Verificar",
        author_role: "Gerente",
        author_brand: MARCAS.sinVerificar,
        author_url: "https://example.com/sin-verificar",
        rating: 5,
        body: BODY,
        author_email: `${E2E_PREFIX}4@example.com`,
        status: "pending_verification",
        verification_expires_at: new Date(Date.now() + 5 * DIA).toISOString(),
      },
    },
  ]

  const ids: Record<string, string> = {}
  for (const { key, row } of rows) {
    const { data, error } = await admin
      .from("testimonials")
      .insert(row)
      .select("id")
      .single()
    if (error) throw new Error(`seed ${key}: ${error.message}`)
    ids[key] = data.id as string
  }
  return ids
}

async function cleanup() {
  await admin.from("testimonials").delete().like("author_email", `${E2E_PREFIX}%`)
  const { data } = await admin.auth.admin.listUsers()
  const user = data?.users?.find((u) => u.email === TEST_EMAIL)
  if (user) await admin.auth.admin.deleteUser(user.id)
}

async function fila(id: string) {
  const { data } = await admin
    .from("testimonials")
    .select(
      "status, published_at, moderated_at, moderated_by, moderation_note, body, rating, author_name",
    )
    .eq("id", id)
    .single()
  return data
}

/** La fila de una reseña, ubicada por la marca (única por estado). */
function row(page: Page, marca: string) {
  return page.locator("article").filter({ hasText: marca })
}

function tab(page: Page, label: string) {
  return page.locator(`[role="tab"]:has-text("${label}")`)
}

async function panelText(page: Page): Promise<string> {
  return page.locator('[role="tabpanel"]').innerText()
}

async function main() {
  await cleanup()
  const ids = await seed()
  await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASS,
    email_confirm: true,
  })

  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(20000)
  if (process.env.E2E_DEBUG) {
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message.slice(0, 400)))
  }

  try {
    // ── 1. Login, sidebar y dashboard ───────────────────────────────────────
    console.log("\n1. Login, sidebar y dashboard")
    await page.goto(`${BASE}/admin/login`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL("**/admin/dashboard**", { timeout: 60000 })
    check("login OK", page.url().includes("/admin/dashboard"))

    const sidebarLink = page.locator('aside a[href="/admin/resenas"]')
    check("el sidebar tiene el link a Reseñas", (await sidebarLink.count()) === 1)
    check(
      "el badge cuenta la que espera revisión",
      /\b1\b/.test((await sidebarLink.innerText()).trim()),
      (await sidebarLink.innerText()).replace(/\n/g, " "),
    )

    const labels = await page.locator("aside nav li").allInnerTexts()
    const iClippings = labels.findIndex((t) => t.includes("Clippings"))
    const iResenas = labels.findIndex((t) => t.includes("Reseñas"))
    check(
      "y va justo debajo de Clippings",
      iClippings >= 0 && iResenas === iClippings + 1,
      `clippings=${iClippings} resenas=${iResenas}`,
    )

    const cardDash = page.locator('a[href="/admin/resenas"]').last()
    check(
      "la tarjeta del dashboard resume el estado",
      /1 para moderar/.test(await cardDash.innerText()),
      (await cardDash.innerText()).replace(/\n/g, " ").slice(0, 120),
    )

    // ── 2. Pestañas ─────────────────────────────────────────────────────────
    console.log("\n2. Pestañas")
    await page.goto(`${BASE}/admin/resenas`)
    await page.waitForSelector('[role="tablist"]')

    check("hay tres pestañas", (await page.locator('[role="tab"]').count()) === 3)
    const orden = await page.locator('[role="tab"]').allInnerTexts()
    check(
      "en el orden Para revisar / Publicadas / Rechazadas",
      orden[0].includes("Para revisar") &&
        orden[1].includes("Publicadas") &&
        orden[2].includes("Rechazadas"),
      orden.join(" | ").replace(/\n/g, " "),
    )
    check(
      "abre en Para revisar",
      (await tab(page, "Para revisar").getAttribute("aria-selected")) === "true",
    )
    check("cada pestaña muestra su contador", /1/.test(orden[0]) && /1/.test(orden[1]))
    check(
      "el panel desglosa por tipo",
      /de periodista/i.test(await panelText(page)),
      (await panelText(page)).split("\n")[0],
    )

    check("la pendiente está en Para revisar", await row(page, MARCAS.pendiente).isVisible())
    check(
      "la NO verificada no se muestra",
      !(await page.locator("body").innerText()).includes(MARCAS.sinVerificar),
    )

    await tab(page, "Publicadas").click()
    check("Publicadas muestra la publicada", await row(page, MARCAS.publicada).isVisible())
    check(
      "y no mezcla la pendiente",
      (await row(page, MARCAS.pendiente).count()) === 0,
    )

    await tab(page, "Rechazadas").click()
    const rechazada = row(page, MARCAS.rechazada)
    check("Rechazadas muestra la rechazada", await rechazada.isVisible())
    check(
      "con quién y cuándo la moderó",
      (await rechazada.innerText()).includes("alguien@anterior.test"),
    )
    check(
      "y con el motivo registrado",
      (await rechazada.innerText()).includes("Motivo viejo de prueba"),
    )
    check(
      "ofrece publicarla por si se reconsidera",
      await rechazada.locator('button:has-text("Publicar")').isVisible(),
    )

    // ── 3. Contenido de la fila ─────────────────────────────────────────────
    console.log("\n3. Contenido de la fila")
    await tab(page, "Para revisar").click()
    const pendiente = row(page, MARCAS.pendiente)
    const texto = await pendiente.innerText()
    // El badge va en uppercase por CSS, así que innerText lo devuelve así.
    check("etiqueta de tipo", /periodista/i.test(texto))
    check("estrellas con aria-label", (await pendiente.locator('[role="img"]').getAttribute("aria-label")) === "5 de 5 estrellas")
    check("nombre, cargo y marca", texto.includes("Zzz Pendiente") && texto.includes("Editora de Economía"))
    check("cuerpo completo sin truncar", texto.includes("del otro lado del mostrador"))
    check("muestra el mail de contacto", texto.includes(`${E2E_PREFIX}1@example.com`))
    check(
      "y NO habla de mail verificado (ya no hay doble opt-in)",
      !/verificad/i.test(texto),
    )
    check("fecha de envío", texto.includes("Enviada el"))
    check(
      "el link del perfil abre en pestaña nueva y segura",
      (await pendiente.locator('a:has-text("Ver perfil")').getAttribute("target")) === "_blank" &&
        (await pendiente.locator('a:has-text("Ver perfil")').getAttribute("rel")) === "noopener noreferrer",
    )
    check(
      "NO hay editar ni eliminar",
      (await pendiente.locator('button:has-text("Editar")').count()) === 0 &&
        (await pendiente.locator('button:has-text("Eliminar")').count()) === 0,
    )

    check(
      "el aviso sobre el costo de rechazar está a la vista",
      (await page.locator("body").innerText()).includes(
        "si se rechaza una crítica honesta, el costo es con esa marca",
      ),
    )

    // ── 4. Publicar ─────────────────────────────────────────────────────────
    console.log("\n4. Publicar")
    await pendiente.locator('button:has-text("Publicar")').click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.waitFor()
    check("pide confirmación", (await dialog.innerText()).includes("Zzz Pendiente"))
    check("y no pide motivo", (await dialog.locator("textarea").count()) === 0)

    await page.keyboard.press("Escape")
    check("Escape cierra sin publicar", (await dialog.count()) === 0)
    check("y no tocó la base", (await fila(ids.pendiente))?.status === "pending_review")

    await pendiente.locator('button:has-text("Publicar")').click()
    await dialog.waitFor()
    await dialog.locator('button:has-text("Sí, publicar")').click()
    await page.waitForFunction(
      () =>
        document.querySelector('[role="tab"]')?.textContent?.replace(/\D/g, "") === "0",
      undefined,
      { timeout: 20000 },
    )

    const publicada = await fila(ids.pendiente)
    check("quedó publicada", publicada?.status === "published", publicada?.status ?? "")
    check("guardó published_at", !!publicada?.published_at)
    check("y quién la moderó", publicada?.moderated_by === TEST_EMAIL, publicada?.moderated_by ?? "")
    check("NO tocó el texto", publicada?.body === BODY)
    check("NO tocó el puntaje", publicada?.rating === 5)

    const html = await (await fetch(`${BASE}/resenas`, { cache: "no-store" })).text()
    check("aparece en /resenas", html.includes(MARCAS.pendiente))
    check("sin filtrar el mail del autor", !html.includes(`${E2E_PREFIX}1@example.com`))

    // ── 5. Despublicar (vuelve a Para revisar) ──────────────────────────────
    console.log("\n5. Despublicar")
    await tab(page, "Publicadas").click()
    await row(page, MARCAS.pendiente).locator('button:has-text("Despublicar")').click()
    await dialog.waitFor()
    const confirmar = dialog.locator('button:has-text("Sí, despublicar")')
    check("sin motivo no deja confirmar", await confirmar.isDisabled())

    await dialog.locator("textarea").fill("corto")
    check("con menos de 10 caracteres tampoco", await confirmar.isDisabled())
    check(
      "y avisa cuántos faltan",
      (await dialog.innerText()).includes("Escribí al menos"),
    )

    await dialog.locator("textarea").fill("La marca pidió corregir un dato")
    check("con un motivo real se habilita", await confirmar.isEnabled())
    await confirmar.click()
    await page.waitForSelector('[role="tab"]:has-text("Para revisar") >> text=1')

    const despublicada = await fila(ids.pendiente)
    check(
      "vuelve a pending_review",
      despublicada?.status === "pending_review",
      despublicada?.status ?? "",
    )
    check(
      "guardó el motivo",
      despublicada?.moderation_note === "La marca pidió corregir un dato",
      despublicada?.moderation_note ?? "",
    )
    check("y sigue sin tocar el texto", despublicada?.body === BODY)

    const html2 = await (await fetch(`${BASE}/resenas`, { cache: "no-store" })).text()
    check("dejó de verse en /resenas", !html2.includes(MARCAS.pendiente))

    await tab(page, "Para revisar").click()
    check(
      "y está de nuevo en Para revisar",
      await row(page, MARCAS.pendiente).isVisible(),
    )

    // ── 6. Rechazar ─────────────────────────────────────────────────────────
    console.log("\n6. Rechazar")
    await row(page, MARCAS.pendiente).locator('button:has-text("Rechazar")').click()
    await dialog.waitFor()
    const confirmarRechazo = dialog.locator('button:has-text("Sí, rechazar")')
    check("el rechazo también exige motivo", await confirmarRechazo.isDisabled())
    await dialog.locator("textarea").fill("No pudimos verificar quién es")
    await confirmarRechazo.click()
    await page.waitForSelector('[role="tab"]:has-text("Rechazadas") >> text=2')

    const rechazadaRow = await fila(ids.pendiente)
    check("quedó rechazada", rechazadaRow?.status === "rejected", rechazadaRow?.status ?? "")
    check(
      "con el motivo nuevo",
      rechazadaRow?.moderation_note === "No pudimos verificar quién es",
    )

    // ── 7. Republicar desde Rechazadas ──────────────────────────────────────
    console.log("\n7. Republicar")
    await tab(page, "Rechazadas").click()
    await row(page, MARCAS.pendiente).locator('button:has-text("Publicar")').click()
    await dialog.waitFor()
    await dialog.locator('button:has-text("Sí, publicar")').click()
    await page.waitForSelector('[role="tab"]:has-text("Rechazadas") >> text=1')
    check(
      "una rechazada se puede publicar",
      (await fila(ids.pendiente))?.status === "published",
    )
  } finally {
    await browser.close()
    await cleanup()
    console.log("\n(limpieza hecha)")
  }

  console.log(`\n${pass} ok · ${fail} fallidos`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error("\nError inesperado:", e)
  cleanup().finally(() => process.exit(1))
})
