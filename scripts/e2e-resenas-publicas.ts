/**
 * Verifica las REGLAS DURAS de /resenas y del bloque de adelanto, que son la
 * parte fácil de romper sin darse cuenta al tocar el diseño.
 *
 *   npx tsx scripts/e2e-resenas-publicas.ts   (con el dev server corriendo)
 *
 * Las reglas visuales se prueban contra `/dev/resenas-harness`, una página de prueba
 * que renderiza los componentes con datos falsos (NO toca la base). Si esa ruta
 * no existe, esos bloques se saltean y se avisa: sirve mientras la tabla
 * `testimonials` no esté creada en Supabase.
 *
 * pickPreview se prueba directo, sin navegador.
 */
import { chromium, type Page } from "playwright-core"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const BASE = "http://localhost:3000"

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

type Resena = {
  id: string
  reviewer_type: "marca" | "periodista"
  published_at: string
}

function r(id: string, tipo: "marca" | "periodista", mes: string): Resena {
  return { id, reviewer_type: tipo, published_at: `2026-${mes}-01T00:00:00Z` }
}

async function main() {
  // ── 1. pickPreview: el orden y su única excepción ────────────────────────
  console.log("\n1. pickPreview (orden y excepción del periodista)")
  const { pickPreview } = await import("../components/resenas-preview")
  const pick = pickPreview as unknown as (x: Resena[]) => Resena[]

  const soloMarcas = [
    r("m1", "marca", "12"), r("m2", "marca", "11"),
    r("m3", "marca", "10"), r("m4", "marca", "09"),
  ]
  check(
    "sin periodistas devuelve las 3 más recientes",
    pick(soloMarcas).map((x) => x.id).join(",") === "m1,m2,m3",
    pick(soloMarcas).map((x) => x.id).join(","),
  )

  const conPeriodistaEnTop = [
    r("m1", "marca", "12"), r("p1", "periodista", "11"),
    r("m2", "marca", "10"), r("p2", "periodista", "09"),
  ]
  check(
    "si ya hay un periodista en el top 3, no se toca nada",
    pick(conPeriodistaEnTop).map((x) => x.id).join(",") === "m1,p1,m2",
    pick(conPeriodistaEnTop).map((x) => x.id).join(","),
  )

  const periodistaAfuera = [
    r("m1", "marca", "12"), r("m2", "marca", "11"),
    r("m3", "marca", "10"), r("p1", "periodista", "09"),
    r("p2", "periodista", "08"),
  ]
  check(
    "si el periodista queda afuera, entra en el 3er lugar",
    pick(periodistaAfuera).map((x) => x.id).join(",") === "m1,m2,p1",
    pick(periodistaAfuera).map((x) => x.id).join(","),
  )
  check(
    "entra el periodista MÁS RECIENTE, no otro",
    pick(periodistaAfuera)[2].id === "p1",
  )
  check(
    "no se altera el orden de los dos primeros",
    pick(periodistaAfuera).slice(0, 2).map((x) => x.id).join(",") === "m1,m2",
  )

  const dosMarcas = [r("m1", "marca", "12"), r("m2", "marca", "11")]
  check("con 2 reseñas devuelve las 2 (sin inventar)", pick(dosMarcas).length === 2)

  // ── 2. Reglas visuales contra el harness ─────────────────────────────────
  const probe = await fetch(`${BASE}/dev/resenas-harness?n=0`).catch(() => null)
  if (!probe || probe.status !== 200) {
    console.log(
      "\n(se saltean las pruebas visuales: /dev/resenas-harness no está disponible)",
    )
    console.log(`\n${pass} ok · ${fail} fallidos`)
    process.exit(fail === 0 ? 0 : 1)
  }

  const browser = await chromium.launch({ channel: "msedge", headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page: Page = await ctx.newPage()
  page.setDefaultTimeout(20000)

  const go = async (qs: string) => {
    await page.goto(`${BASE}/dev/resenas-harness?${qs}`, { waitUntil: "networkidle" })
    return page.content()
  }

  // Promedio: solo con 5 o más
  console.log("\n2. Promedio (solo con 5 reseñas o más)")
  for (const n of [1, 4]) {
    const html = await go(`n=${n}`)
    check(`con ${n} NO se muestra`, !html.includes("Promedio sobre"))
  }
  for (const n of [5, 9]) {
    await go(`n=${n}`)
    // Por el textContent del elemento, no por el HTML crudo: React separa los
    // nodos de texto con comentarios y "Promedio sobre 5 reseñas" nunca aparece
    // como una cadena contigua en el markup.
    const texto = await page
      .getByText(/Promedio sobre/)
      .textContent()
      .catch(() => null)
    check(
      `con ${n} SÍ se muestra`,
      texto?.replace(/\s+/g, " ").trim() === `Promedio sobre ${n} reseñas`,
      texto ?? "no está",
    )
  }

  // Chips: 8 o más Y al menos 2 de cada tipo
  console.log("\n3. Chips de filtro (8 o más, y 2+ de cada tipo)")
  for (const n of [4, 7]) {
    const html = await go(`n=${n}`)
    check(`con ${n} NO hay chips`, !html.includes("Filtrar reseñas por tipo"))
  }
  const html8 = await go("n=8")
  check("con 8 SÍ hay chips", html8.includes("Filtrar reseñas por tipo"))
  check("los chips muestran su contador", /Todas[\s\S]{0,120}>8</.test(html8))

  // El filtro funciona sin recargar
  const antes = await page.locator("article").count()
  await page.getByRole("button", { name: /Periodistas/ }).click()
  await page.waitForTimeout(500)
  const despues = await page.locator("article").count()
  check("filtrar reduce la lista", despues > 0 && despues < antes, `${antes} → ${despues}`)
  // Por la ETIQUETA, no por el texto de la tarjeta: la palabra "marca" aparece
  // dentro del cuerpo de alguna reseña y daría un falso positivo.
  check(
    "filtrando por periodistas no queda ninguna etiqueta 'Marca'",
    (await page.getByText("Marca", { exact: true }).count()) === 0,
  )
  check(
    "y todas las visibles llevan la etiqueta 'Periodista'",
    (await page.getByText("Periodista", { exact: true }).count()) === despues,
  )
  check("no hubo recarga (sigue en la misma URL)", page.url().includes("n=8"))

  // Estado vacío
  console.log("\n4. Estado vacío")
  const html0 = await go("n=0")
  check("muestra la invitación", html0.includes("Todavía no hay reseñas publicadas"))
  check("linkea a /resenas/nueva", html0.includes('href="/resenas/nueva"'))
  check("no muestra promedio ni chips", !html0.includes("Promedio sobre") && !html0.includes("Filtrar reseñas"))

  // El botón para dejar una reseña, en el encabezado. /resenas es el link que
  // se le pasa a un cliente para que reseñe: si el botón desaparece al
  // publicarse la primera reseña, la página deja de servir para lo que se usa.
  // Pasó exactamente eso hasta el 2026-09-10 (solo existía en el estado vacío).
  console.log("\n4b. Botón para dejar una reseña")
  for (const n of [0, 1, 3, 9]) {
    await go(`n=${n}`)
    const boton = page.getByRole("link", { name: /Dejar mi reseña/ })
    check(
      `con ${n} reseña(s) el botón está visible`,
      (await boton.count()) === 1 && (await boton.first().isVisible()),
    )
  }
  check(
    "el botón lleva al formulario",
    (await page.getByRole("link", { name: /Dejar mi reseña/ }).first().getAttribute("href")) ===
      "/resenas/nueva",
  )

  // Texto del pie: la redacción exacta, y nada que prometa de más
  console.log("\n5. Texto del pie")
  const html3 = await go("n=3")
  check(
    "está la redacción exacta",
    html3.includes(
      "Cada reseña la escribe la persona que la firma y se publica sin editar el texto. Podés verificar quién es cada una desde su perfil público.",
    ),
  )
  check(
    "NO dice que se publican todas las recibidas",
    !/publicamos todas|se publican todas|sin selección|todas las reseñas que recibimos/i.test(html3),
  )
  check(
    "NO hay AggregateRating de schema.org",
    !/AggregateRating/i.test(await go("n=9")),
  )

  // Tarjeta
  console.log("\n6. Tarjeta")
  const cardHtml = await go("n=3")
  check("las estrellas tienen aria-label", /aria-label="\d de 5 estrellas"/.test(cardHtml))
  check("la fecha va en formato 'mes año'", /diciembre 2026|noviembre 2026/.test(cardHtml))
  check("el nombre abre en pestaña nueva y segura", /target="_blank"[^>]*rel="noopener noreferrer"|rel="noopener noreferrer"[^>]*target="_blank"/.test(cardHtml))
  check("hay etiqueta de tipo Marca y Periodista", cardHtml.includes(">Marca<") && cardHtml.includes(">Periodista<"))

  // Adelanto (home / servicios) — carrusel: una reseña por vez, pero TODAS las
  // diapositivas están en el DOM (apiladas en la misma celda del grid), así que
  // se cuentan los <article> y se chequea cuál está visible por el aria-hidden.
  console.log("\n7. Bloque de adelanto (carrusel)")
  const preview = (n: number) =>
    page.goto(`${BASE}/dev/resenas-harness?view=preview&n=${n}`, { waitUntil: "networkidle" })

  await preview(0)
  check("sin reseñas NO se renderiza", (await page.locator("article").count()) === 0)

  await preview(1)
  check("con 1 SÍ se renderiza", (await page.locator("article").count()) === 1)
  check(
    "con 1 no hay flechas ni puntos",
    (await page.locator('button[aria-label="Reseña siguiente"]').count()) === 0 &&
      (await page.locator('button[aria-label^="Ver la reseña"]').count()) === 0,
  )

  await preview(2)
  check("con 2 hay dos diapositivas", (await page.locator("article").count()) === 2)
  check(
    "con 2 aparecen los controles",
    (await page.locator('button[aria-label="Reseña siguiente"]').count()) > 0 &&
      (await page.locator('button[aria-label^="Ver la reseña"]').count()) === 2,
  )

  await preview(9)
  check("nunca muestra más de 3", (await page.locator("article").count()) === 3)
  check(
    "solo una diapositiva está expuesta a la vez",
    (await page.locator('[aria-roledescription="reseña"]:not([aria-hidden="true"])').count()) === 1,
  )

  const previewHtml = await page.content()
  check("linkea a /resenas", previewHtml.includes('href="/resenas"'))
  check("linkea al formulario", previewHtml.includes('href="/resenas/nueva"'))

  // El auto-avance corre solo, sin tocar nada. Con el ciclo en 1,5 s, esperar
  // 2,6 s alcanza para ver al menos un cambio aunque la carga se demore.
  const expuesta = () =>
    page
      .locator('[aria-roledescription="reseña"]:not([aria-hidden="true"])')
      .getAttribute("aria-label")

  const antesDeEsperar = await expuesta()
  await page.waitForTimeout(2600)
  const despuesDeEsperar = await expuesta()
  check(
    `el auto-avance cambia de reseña solo (${antesDeEsperar} → ${despuesDeEsperar})`,
    antesDeEsperar !== despuesDeEsperar,
  )

  // La flecha, en una pestaña aparte con prefers-reduced-motion: ahí el
  // auto-avance no corre, así que el índice solo cambia por el clic y la
  // comprobación no depende de llegar antes que el timer.
  const ctxQuieto = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  })
  const pageQuieta = await ctxQuieto.newPage()
  pageQuieta.setDefaultTimeout(20000)
  await pageQuieta.goto(`${BASE}/dev/resenas-harness?view=preview&n=9`, {
    waitUntil: "networkidle",
  })

  const expuestaQuieta = () =>
    pageQuieta
      .locator('[aria-roledescription="reseña"]:not([aria-hidden="true"])')
      .getAttribute("aria-label")

  const primera = await expuestaQuieta()
  await pageQuieta.waitForTimeout(1200)
  check(
    "con prefers-reduced-motion NO se auto-avanza",
    (await expuestaQuieta()) === primera,
    `quedó en ${await expuestaQuieta()}`,
  )

  await pageQuieta.locator('button[aria-label="Reseña siguiente"]').first().click()
  await pageQuieta.waitForTimeout(500)
  const segunda = await expuestaQuieta()
  check(`la flecha avanza (${primera} → ${segunda})`, primera === "1 de 3" && segunda === "2 de 3")

  await browser.close()
  console.log(`\n${pass} ok · ${fail} fallidos`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error("\nError inesperado:", e)
  process.exit(1)
})
