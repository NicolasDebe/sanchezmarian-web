/**
 * E2E del formulario público de reseñas. Requiere el dev server corriendo
 * (`npm run dev`) y las env vars de .env.local.
 *
 *   npx tsx scripts/e2e-resenas.ts
 *
 * Es AUTO-LIMPIANTE: todas las filas que crea llevan un author_email con el
 * prefijo E2E_PREFIX y se borran al final, pase o falle.
 *
 * Cubre: alta válida, honeypot, validación por campo, rate limit por IP,
 * verificación por token (incluida la reutilización del link) y token inválido.
 */

import { config } from "dotenv"
config({ path: ".env.local" })

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000"
const E2E_PREFIX = "e2e-resena-"

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

const BODY_OK =
  "Trabajar con Marian fue clarísimo de punta a punta. Entiende los tiempos de la redacción, manda material chequeado y nunca insiste de más. Es de las pocas consultoras que entiende cómo trabajamos del otro lado."

function validPayload(n: number) {
  return {
    reviewer_type: "periodista",
    author_name: `Lucía Fernández ${n}`,
    author_role: "Editora de Economía",
    author_brand: "Los Andes",
    author_url: "https://losandes.com.ar/autor/lucia",
    rating: 5,
    body: BODY_OK,
    author_email: `${E2E_PREFIX}${n}@example.com`,
    website: "",
  }
}

async function post(payload: unknown, ip: string) {
  const res = await fetch(`${BASE}/api/resenas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(payload),
  })
  return { status: res.status, json: await res.json() }
}

async function main() {
  const { createAdminClient } = await import("../lib/supabase")
  const admin = createAdminClient()

  const cleanup = async () => {
    await admin.from("testimonials").delete().like("author_email", `${E2E_PREFIX}%`)
  }

  // Sin la tabla no tiene sentido seguir: todo fallaría por la misma razón y el
  // reporte sería ruido. Mejor decirlo en una línea.
  const { error: tableError } = await admin
    .from("testimonials")
    .select("id")
    .limit(1)

  if (tableError) {
    console.error(
      `\n✗ La tabla \`testimonials\` no está lista: ${tableError.message}\n` +
        "  Pegá supabase/migrations/20260908_testimonials.sql en el SQL Editor\n" +
        "  del dashboard de Supabase y volvé a correr este script.\n",
    )
    process.exit(1)
  }

  await cleanup() // por si quedó basura de una corrida anterior

  try {
    // ── 1. Alta válida ──────────────────────────────────────────────────────
    console.log("\n1. Alta válida")
    const a = await post(validPayload(1), "203.0.113.10")
    check("responde 200", a.status === 200, `status ${a.status}`)
    check("ok: true", a.json.ok === true, JSON.stringify(a.json))
    check(
      "no filtra el token en la respuesta",
      !JSON.stringify(a.json).includes("-4") || !("token" in a.json),
      JSON.stringify(a.json),
    )

    const { data: row } = await admin
      .from("testimonials")
      .select("id, status, verification_token, ip_hash, rating, body, author_name")
      .eq("author_email", `${E2E_PREFIX}1@example.com`)
      .maybeSingle()

    check("quedó la fila en la base", !!row)
    check("status = pending_verification", row?.status === "pending_verification", row?.status)
    check("guardó ip_hash (salt configurado)", !!row?.ip_hash)
    check("guardó el body sin tocar", row?.body === BODY_OK)

    // ── 2. Honeypot ─────────────────────────────────────────────────────────
    console.log("\n2. Honeypot")
    const h = await post(
      { ...validPayload(99), website: "http://spam.example" },
      "203.0.113.20",
    )
    check("responde 200 (éxito simulado)", h.status === 200 && h.json.ok === true)
    const { count: spamCount } = await admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("author_email", `${E2E_PREFIX}99@example.com`)
    check("NO insertó nada", (spamCount ?? 0) === 0, `filas: ${spamCount}`)

    // ── 3. Validación ───────────────────────────────────────────────────────
    console.log("\n3. Validación")
    const bad = await post(
      {
        reviewer_type: "cliente",
        author_name: "Jo",
        author_role: "",
        author_brand: "X",
        author_url: "javascript:alert(1)",
        rating: 9,
        body: "Muy buena.",
        author_email: "no-es-mail",
        website: "",
      },
      "203.0.113.30",
    )
    check("responde 422", bad.status === 422, `status ${bad.status}`)
    check("trae fieldErrors", !!bad.json.fieldErrors)
    check(
      "rechaza la URL javascript:",
      !!bad.json.fieldErrors?.author_url,
      JSON.stringify(bad.json.fieldErrors),
    )
    check(
      "los mensajes están en castellano",
      /Escribí|Contanos|Elegí|Pegá|Revisá/.test(
        Object.values(bad.json.fieldErrors ?? {}).join(" "),
      ),
    )

    // ── 4. Rate limit ───────────────────────────────────────────────────────
    console.log("\n4. Rate limit (3 por IP / 24h)")
    const RL_IP = "203.0.113.99"
    const r1 = await post(validPayload(11), RL_IP)
    const r2 = await post(validPayload(12), RL_IP)
    const r3 = await post(validPayload(13), RL_IP)
    check("las primeras 3 pasan", [r1, r2, r3].every((r) => r.json.ok === true))
    const r4 = await post(validPayload(14), RL_IP)
    check("la 4ta se frena con 429", r4.status === 429, `status ${r4.status}`)
    check("el mensaje es amable", /escribinos|Ya recibimos/i.test(r4.json.error ?? ""), r4.json.error)
    const { count: rlCount } = await admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("author_email", `${E2E_PREFIX}14@example.com`)
    check("la 4ta no se insertó", (rlCount ?? 0) === 0)

    check(
      "otra IP no queda bloqueada",
      (await post(validPayload(15), "203.0.113.77")).json.ok === true,
    )

    // ── 5. Verificación ─────────────────────────────────────────────────────
    console.log("\n5. Verificación por token")
    const token = row?.verification_token as string
    const v1 = await fetch(`${BASE}/resenas/verificar/${token}`)
    const v1html = await v1.text()
    check("la página responde 200", v1.status === 200, `status ${v1.status}`)
    check("muestra el éxito", v1html.includes("quedó confirmada"))
    check(
      "aclara que falta la revisión",
      v1html.includes("pasa por una revisión"),
      "falta el aviso de moderación",
    )
    check(
      "NO promete que se publica",
      !/se va a publicar|se publicará|será publicada/i.test(v1html),
    )

    const { data: after } = await admin
      .from("testimonials")
      .select("status, verified_at")
      .eq("id", row!.id)
      .single()
    check("pasó a pending_review", after?.status === "pending_review", after?.status)
    check("NO se publicó", after?.status !== "published")
    check("guardó verified_at", !!after?.verified_at)

    // ── 6. Reuso del link e inválidos ───────────────────────────────────────
    console.log("\n6. Link reusado / inválido")
    const v2 = await fetch(`${BASE}/resenas/verificar/${token}`)
    const v2html = await v2.text()
    check("el segundo clic no rompe", v2.status === 200)
    check("muestra 'ya no sirve'", v2html.includes("ya no sirve"))

    const v3 = await fetch(`${BASE}/resenas/verificar/no-es-un-uuid`)
    check("token basura responde 200", v3.status === 200, `status ${v3.status}`)
    check("token basura muestra 'ya no sirve'", (await v3.text()).includes("ya no sirve"))

    // ── 7. La página del formulario ─────────────────────────────────────────
    console.log("\n7. /resenas/nueva")
    const page = await fetch(`${BASE}/resenas/nueva`)
    const html = await page.text()
    check("responde 200", page.status === 200, `status ${page.status}`)
    check("tiene el H1", html.includes("Contá cómo fue"))
    check("tiene las dos opciones", html.includes("Trabajé con Marian") && html.includes("Soy periodista"))
    check("tiene el honeypot", html.includes('name="website"'))
    check("las estrellas son radios", (html.match(/type="radio"/g) ?? []).length >= 5)
    check(
      "no promete que se publican todas",
      !/todas las reseñas se publican|publicamos todas/i.test(html),
    )
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
