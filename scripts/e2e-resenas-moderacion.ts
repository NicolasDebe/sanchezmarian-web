/**
 * Ciclo completo de una reseña contra la base real: alta → moderación →
 * publicación → visible en /resenas → rechazo → deja de verse.
 *
 *   npx tsx scripts/e2e-resenas-moderacion.ts   (con el dev server corriendo)
 *
 * Requiere la migración 20260908 aplicada. AUTO-LIMPIANTE: todo lo que crea
 * lleva un author_email con el prefijo E2E_PREFIX y se borra al final, falle o
 * no. No toca ninguna reseña real.
 */
import { config } from "dotenv"
config({ path: ".env.local" })

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000"
const E2E_PREFIX = "e2e-mod-"
const ADMIN_EMAIL = "e2e-moderador@test.local"

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

const BODY =
  "Trabajar con Marian fue clarísimo de punta a punta. Entiende los tiempos de la redacción, manda material chequeado y nunca insiste de más. Es de las pocas consultoras que entiende cómo trabajamos del otro lado del mostrador."

/** El sitio cachea 60s (revalidate); en dev pedimos sin caché para ver el estado real. */
async function fetchResenas(): Promise<string> {
  const res = await fetch(`${BASE}/resenas`, { cache: "no-store" })
  return res.text()
}

async function main() {
  const lib = await import("../lib/testimonials")
  const { createAdminClient } = await import("../lib/supabase")
  const admin = createAdminClient()

  const cleanup = async () => {
    await admin.from("testimonials").delete().like("author_email", `${E2E_PREFIX}%`)
  }
  await cleanup()

  try {
    // ── 1. Alta + verificación (por la capa de datos, sin HTTP) ─────────────
    console.log("\n1. Alta y verificación")
    const created = await lib.createTestimonial({
      reviewer_type: "periodista",
      author_name: "Zzz Prueba Moderación",
      author_role: "Editora de Economía",
      author_brand: "Medio De Prueba E2E",
      author_url: "https://example.com/perfil-e2e",
      rating: 5,
      body: BODY,
      author_email: `${E2E_PREFIX}1@example.com`,
    })
    check("createTestimonial devuelve ok", created.ok, JSON.stringify(created))
    if (!created.ok) throw new Error("no se pudo crear la reseña de prueba")

    // Entra directo a la cola de moderación, sin paso de confirmación.
    const { data: recien } = await admin
      .from("testimonials")
      .select("status")
      .eq("id", created.id)
      .single()
    check("queda en pending_review", recien?.status === "pending_review", recien?.status ?? "")
    check(
      "y trae los datos para el aviso de moderación",
      created.testimonial.author_name === "Zzz Prueba Moderación",
    )

    const pendientes = await lib.getPendingCount()
    check("getPendingCount la cuenta", pendientes >= 1, String(pendientes))

    // Mientras espera moderación NO puede estar en la página pública.
    check(
      "sin publicar, no aparece en /resenas",
      !(await fetchResenas()).includes("Medio De Prueba E2E"),
    )
    check(
      "getPublishedTestimonials no la devuelve",
      !(await lib.getPublishedTestimonials()).some((r) => r.id === created.id),
    )

    // ── 2. Publicación ──────────────────────────────────────────────────────
    console.log("\n2. Publicación")
    const published = await lib.publishTestimonial(created.id, ADMIN_EMAIL)
    check("publishTestimonial devuelve ok", published.ok, JSON.stringify(published))

    const { data: fila } = await admin
      .from("testimonials")
      .select("status, published_at, moderated_at, moderated_by, body, rating, author_name")
      .eq("id", created.id)
      .single()

    check("status = published", fila?.status === "published", fila?.status)
    check("guardó published_at", !!fila?.published_at)
    check("guardó moderated_at", !!fila?.moderated_at)
    check("guardó quién moderó", fila?.moderated_by === ADMIN_EMAIL, fila?.moderated_by ?? "")
    check("NO tocó el texto de la reseña", fila?.body === BODY)
    check("NO tocó el puntaje", fila?.rating === 5)

    const publicas = await lib.getPublishedTestimonials()
    const mia = publicas.find((r) => r.id === created.id)
    check("getPublishedTestimonials la devuelve", !!mia)
    check("no expone el email del autor", mia !== undefined && !("author_email" in mia))

    const summary = await lib.getRatingSummary()
    check("getRatingSummary la cuenta", summary.count >= 1, JSON.stringify(summary))
    check("y la suma como periodista", summary.countPeriodistas >= 1)

    // ── 3. Visible en el sitio ──────────────────────────────────────────────
    console.log("\n3. Visible en /resenas")
    const html = await fetchResenas()
    check("aparece la marca/medio", html.includes("Medio De Prueba E2E"))
    check("aparece el nombre", html.includes("Zzz Prueba Moderación"))
    check("aparece el cuerpo de la reseña", html.includes("clarísimo de punta a punta"))
    check("aparece la etiqueta Periodista", html.includes(">Periodista<"))
    check("el link del autor abre seguro", html.includes('rel="noopener noreferrer"'))
    check("NO se filtró el email", !html.includes(`${E2E_PREFIX}1@example.com`))
    check("sigue sin haber AggregateRating", !/AggregateRating/i.test(html))

    // ── 4. Rechazo ──────────────────────────────────────────────────────────
    console.log("\n4. Rechazo")
    const sinMotivo = await lib.rejectTestimonial(created.id, "   ", ADMIN_EMAIL)
    check("exige un motivo", !sinMotivo.ok)

    const rejected = await lib.rejectTestimonial(created.id, "Prueba automatizada", ADMIN_EMAIL)
    check("rejectTestimonial devuelve ok", rejected.ok, JSON.stringify(rejected))

    const { data: fila2 } = await admin
      .from("testimonials")
      .select("status, moderation_note, body")
      .eq("id", created.id)
      .single()
    check("status = rejected", fila2?.status === "rejected", fila2?.status)
    check("guardó el motivo", fila2?.moderation_note === "Prueba automatizada")
    check("tampoco tocó el texto", fila2?.body === BODY)

    check(
      "deja de aparecer en /resenas",
      !(await fetchResenas()).includes("Medio De Prueba E2E"),
    )
    check(
      "y getPublishedTestimonials ya no la trae",
      !(await lib.getPublishedTestimonials()).some((r) => r.id === created.id),
    )

    // Rechazada se puede volver a publicar (por si fue un error de moderación).
    const republished = await lib.publishTestimonial(created.id, ADMIN_EMAIL)
    check("una rechazada se puede republicar", republished.ok)
  } finally {
    await cleanup()
    console.log("\n(limpieza hecha)")
  }

  console.log(`\n${pass} ok · ${fail} fallidos`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error("\nError inesperado:", e)
  process.exit(1)
})
