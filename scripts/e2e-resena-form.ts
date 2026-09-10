/**
 * Tests de interacción y accesibilidad del formulario de /resenas/nueva.
 * Playwright con el Edge del sistema, contra el dev server.
 *
 *   npx tsx scripts/e2e-resena-form.ts
 *
 * NO escribe en la base: el envío se intercepta con page.route(), así que se
 * puede correr aunque la migración de `testimonials` todavía no esté aplicada.
 *
 * Cubre: bloqueo hasta elegir tipo, etiquetas que cambian según el tipo,
 * navegación con teclado y flechas en las estrellas, contador del textarea,
 * validación en castellano, honeypot invisible y pantalla de confirmación
 * (incluido el caso de mail caído).
 */
import { chromium, type Page } from "playwright-core"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const URL = "http://localhost:3000/resenas/nueva"

let pass = 0
let fail = 0
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass++
    console.log(`  ok   ${name}`)
  } else {
    fail++
    console.log(`  FAIL ${name}${detail ? ` → ${detail}` : ""}`)
  }
}

const BODY_OK =
  "Trabajar con Marian fue clarísimo de punta a punta. Entiende los tiempos de la redacción, manda material chequeado y nunca insiste de más. Es de las pocas consultoras que entiende cómo trabajamos."

/** Intercepta el POST para no tocar la base. */
async function stubApi(page: Page, body: Record<string, unknown>) {
  await page.route("**/api/resenas", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  })
}

async function fillAll(page: Page) {
  await page.fill('[name="author_name"]', "Lucía Fernández")
  await page.fill('[name="author_role"]', "Editora de Economía")
  await page.fill('[name="author_brand"]', "Los Andes")
  await page.fill('[name="author_url"]', "https://losandes.com.ar/autor/lucia")
  await page.fill('[name="body"]', BODY_OK)
  await page.fill('[name="author_email"]', "lucia@example.com")
  // Al radio se le llega por el label, que es lo que toca una persona: el input
  // es sr-only a propósito (focuseable, pero no clickeable directamente).
  await page.getByTitle("4 de 5").click()
}

async function main() {
  const browser = await chromium.launch({ channel: "msedge", headless: true })

  try {
    // ── 1. Mobile: bloqueo hasta elegir el tipo ─────────────────────────────
    console.log("\n1. Bloqueo hasta elegir el tipo (mobile 390px)")
    const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const m = await ctxM.newPage()
    m.setDefaultTimeout(20000)
    await m.goto(URL, { waitUntil: "networkidle" })

    check(
      "el nombre arranca deshabilitado",
      await m.locator('[name="author_name"]').isDisabled(),
    )
    check(
      "las estrellas arrancan deshabilitadas",
      await m.locator('input[name="rating"][value="3"]').isDisabled(),
    )
    check(
      "el botón de enviar arranca deshabilitado",
      await m.locator('button[type="submit"]').isDisabled(),
    )
    check("explica qué hacer", await m.getByText("Elegí una de las dos opciones").isVisible())

    // Sin scroll horizontal en mobile.
    const overflow = await m.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    check("no hay scroll horizontal", overflow <= 0, `${overflow}px de más`)

    await m.getByRole("button", { name: /Trabajé con Marian/ }).click()
    check(
      "al elegir se habilita todo",
      !(await m.locator('[name="author_name"]').isDisabled()),
    )

    // ── 2. Las etiquetas cambian según el tipo ──────────────────────────────
    console.log("\n2. Etiquetas por tipo de reseñador")
    check("marca → 'Tu cargo'", await m.getByText("Tu cargo", { exact: true }).isVisible())
    check(
      "marca → 'Marca u organización'",
      await m.getByText("Marca u organización").isVisible(),
    )
    check(
      "marca → link de la marca",
      await m.getByText("LinkedIn personal o web de la marca").isVisible(),
    )

    await m.getByRole("button", { name: /Soy periodista/ }).click()
    check("periodista → 'Tu rol'", await m.getByText("Tu rol", { exact: true }).isVisible())
    check(
      "periodista → 'Medio en el que trabajás'",
      await m.getByText("Medio en el que trabajás").isVisible(),
    )
    check(
      "periodista → placeholder de rol",
      (await m.locator('[name="author_role"]').getAttribute("placeholder"))?.includes("Redactor") ?? false,
    )
    check(
      "periodista → link con nota propia",
      await m.getByText("LinkedIn, tu perfil en el medio, o una nota tuya").isVisible(),
    )
    check(
      "el microcopy del link es el mismo para los dos",
      await m.getByText("Sirve para que cualquiera pueda verificar quién sos").isVisible(),
    )

    // ── 3. Estrellas: radiogroup real y teclado ─────────────────────────────
    console.log("\n3. Estrellas (accesibilidad)")
    const radios = m.locator('input[name="rating"]')
    check("son 5 inputs radio", (await radios.count()) === 5)
    check(
      "cada uno tiene aria-label 'N de 5'",
      (await radios.nth(2).getAttribute("aria-label")) === "3 de 5",
      (await radios.nth(2).getAttribute("aria-label")) ?? "",
    )
    check(
      "es un fieldset con legend",
      await m.getByText("¿Cómo calificarías la experiencia?").isVisible(),
    )
    check("ninguno viene marcado por default", (await m.locator('input[name="rating"]:checked').count()) === 0)

    // Foco por teclado + flechas: es lo que hace el navegador con un radiogroup.
    await radios.nth(2).focus()
    check("la estrella recibe foco por teclado", await radios.nth(2).evaluate((el) => el === document.activeElement))
    await m.keyboard.press("ArrowRight")
    check(
      "la flecha derecha mueve al 4",
      (await m.locator('input[name="rating"]:checked').inputValue()) === "4",
    )
    await m.keyboard.press("ArrowLeft")
    await m.keyboard.press("ArrowLeft")
    check(
      "la flecha izquierda vuelve al 2",
      (await m.locator('input[name="rating"]:checked').inputValue()) === "2",
    )
    check("el texto de apoyo acompaña", await m.getByText("2 de 5", { exact: true }).isVisible())

    // ── 4. Contador del textarea ────────────────────────────────────────────
    console.log("\n4. Contador de la reseña")
    await m.fill('[name="body"]', "Corto.")
    check(
      "avisa cuántos caracteres faltan",
      await m.getByText(/Faltan \d+ caracteres/).isVisible(),
    )
    await m.fill('[name="body"]', BODY_OK)
    check(
      "pasado el mínimo muestra el conteo",
      await m.getByText(`${BODY_OK.length} / 1200`).isVisible(),
    )
    check(
      "el textarea tiene tope duro de 1200",
      (await m.locator('[name="body"]').getAttribute("maxlength")) === "1200",
    )

    // ── 5. Honeypot ─────────────────────────────────────────────────────────
    console.log("\n5. Honeypot")
    const hp = m.locator('[name="website"]')
    check("existe", (await hp.count()) === 1)
    check("NO es type=hidden", (await hp.getAttribute("type")) === "text")
    check("está fuera del tab (tabindex -1)", (await hp.getAttribute("tabindex")) === "-1")
    // Playwright cuenta como "visible" cualquier cosa con caja, aunque esté
    // fuera de la pantalla — así que lo que se verifica es lo que importa: que
    // esté corrido fuera del viewport y sin tamaño útil.
    const hpBox = await hp.boundingBox()
    check("está fuera de la pantalla", (hpBox?.x ?? 0) < -1000, JSON.stringify(hpBox))
    check(
      "el contenedor está aria-hidden",
      await hp.evaluate((el) => el.closest("[aria-hidden='true']") !== null),
    )

    // ── 6. Validación en castellano ─────────────────────────────────────────
    console.log("\n6. Validación")
    await m.fill('[name="author_url"]', "javascript:alert(1)")
    await m.locator('[name="author_url"]').blur()
    check(
      "rechaza javascript: en el link",
      await m.getByText(/Pegá un enlace válido/).isVisible(),
    )
    await m.fill('[name="author_email"]', "no-es-mail")
    await m.locator('[name="author_email"]').blur()
    check("rechaza el email inválido", await m.getByText(/Revisá el email/).isVisible())

    await ctxM.close()

    // ── 7. Envío feliz (desktop) ────────────────────────────────────────────
    console.log("\n7. Envío correcto")
    const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const d = await ctxD.newPage()
    d.setDefaultTimeout(20000)
    await stubApi(d, { ok: true, message: "ok" })
    await d.goto(URL, { waitUntil: "networkidle" })
    await d.getByRole("button", { name: /Trabajé con Marian/ }).click()
    await fillAll(d)
    await d.locator('button[type="submit"]').click()

    // El panel de confirmación es role="status"; esperarlo evita chequear
    // antes de que React re-renderice (isVisible no espera).
    const panelD = d.getByRole("status")
    await panelD.waitFor({ state: "visible" })

    check("confirma que la recibimos", await panelD.getByText("Recibimos tu reseña.").isVisible())
    check(
      "agradece por dejar la opinión",
      await panelD.getByText(/Gracias por tomarte unos minutos/).isVisible(),
    )
    // Marian pidió sacar de acá la aclaración de que la reseña se modera y el
    // mail para pedir correcciones (2026-09-10). Si vuelven a aparecer, es una
    // regresión, no una mejora.
    check(
      "NO menciona la moderación ni el tiempo de espera",
      !/la lee antes de publicarla|puede tardar|unos días en aparecer/i.test(await d.content()),
    )
    check(
      "NO habla de confirmar por mail",
      !/revisá tu correo|confirmá tu reseña|mail de confirmación/i.test(await d.content()),
    )
    check(
      "NO promete que se publica",
      !/se va a publicar|publicaremos|será publicada/i.test(await d.content()),
    )
    await ctxD.close()

    // ── 8. El servidor falla ────────────────────────────────────────────────
    // Sin mail de confirmación, el único desenlace malo posible es que el alta
    // no entre. Tiene que verse un mensaje humano, nunca un error crudo.
    console.log("\n8. Error del servidor")
    const ctxE = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const e = await ctxE.newPage()
    e.setDefaultTimeout(20000)
    await stubApi(e, {
      ok: false,
      error: "No pudimos guardar tu reseña. Probá de nuevo en un momento.",
    })
    await e.goto(URL, { waitUntil: "networkidle" })
    await e.getByRole("button", { name: /Soy periodista/ }).click()
    await fillAll(e)
    await e.locator('button[type="submit"]').click()

    // El banner es un <p role="alert"> DENTRO del form. Hay que apuntarle así y
    // no con getByRole("alert") a secas: Next deja siempre en el DOM un
    // #__next-route-announcer__ con ese mismo rol, vacío, que se lleva el match.
    // Y hay que esperarlo, porque isVisible no espera y el fetch está en vuelo.
    const alerta = e.locator('form p[role="alert"]')
    await alerta.waitFor({ state: "visible" })
    check(
      "muestra el error en castellano",
      /No pudimos guardar tu reseña/.test(await alerta.innerText()),
      await alerta.innerText(),
    )
    check(
      "NO muestra la pantalla de éxito",
      (await e.getByRole("status").getByText("Recibimos tu reseña.").count()) === 0,
    )
    check("no muestra un error crudo", !/Error:|stack|TypeError/i.test(await e.content()))
    await ctxE.close()
  } finally {
    await browser.close()
  }

  console.log(`\n${pass} ok · ${fail} fallidos`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error("\nError inesperado:", err)
  process.exit(1)
})
