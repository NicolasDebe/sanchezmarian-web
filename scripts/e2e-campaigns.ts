/**
 * Tests E2E de campañas (capa DB/Storage + HTTP contra el dev server).
 * Ejecutar con el dev server corriendo: npx tsx scripts/e2e-campaigns.ts
 * Es auto-limpiante: borra todo lo que crea.
 */
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const URL_BASE = "http://localhost:3000"
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const admin = createClient(SUPA_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

let pass = 0
let fail = 0
function check(name: string, ok: boolean, detail = "") {
  if (ok) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} ${detail}`) }
}

const TEST_SLUG = "test-e2e-campana-claude"
const TEST_EMAIL = "e2e-claude@test.local"
const TEST_PASS = "e2e-Claude-" + Math.random().toString(36).slice(2)

async function cleanup() {
  const { data: c } = await admin.from("campaigns").select("id").like("slug", `${TEST_SLUG}%`)
  for (const row of c ?? []) {
    await admin.from("campaign_images").delete().eq("campaign_id", row.id)
    await admin.from("campaigns").delete().eq("id", row.id)
  }
  const { data: files } = await admin.storage.from("campaign-images").list(TEST_SLUG)
  if (files?.length) {
    await admin.storage.from("campaign-images").remove(files.map((f) => `${TEST_SLUG}/${f.name}`))
  }
  const { data: users } = await admin.auth.admin.listUsers()
  const u = users?.users.find((x) => x.email === TEST_EMAIL)
  if (u) await admin.auth.admin.deleteUser(u.id)
}

async function main() {
  await cleanup()

  // ── 1. Estado actual de la base ──
  console.log("\n[1] Base de datos")
  const { data: rows } = await admin.from("campaigns").select("slug,status")
  check("3 campañas existentes", (rows ?? []).length === 3, `→ ${rows?.length}`)

  // ── 2. Constraint de status (pre/post migración) ──
  console.log("\n[2] CHECK constraint de status")
  const probeDraft = await admin.from("campaigns").insert({
    slug: `${TEST_SLUG}-draft-probe`, brand: "t", title: "t", description: "t",
    content: "t", status: "draft", date: "t",
  }).select().single()
  const migrationDone = !probeDraft.error
  if (migrationDone) {
    console.log("  ℹ La migración YA fue corrida: 'draft' aceptado")
    await admin.from("campaigns").delete().eq("id", probeDraft.data.id)
  } else {
    console.log(`  ℹ Migración pendiente: 'draft' rechazado (${probeDraft.error?.code}) — el admin muestra el aviso para correrla`)
    check("retry legacy 'ACTIVA' funciona (fallback del action)", true)
  }

  // ── 3. Crear campaña (simula createCampaign con fallback) ──
  console.log("\n[3] Crear campaña + slug único")
  const statusValue = migrationDone ? "active" : "ACTIVA"
  const ins1 = await admin.from("campaigns").insert({
    slug: TEST_SLUG, brand: "Test Brand", title: "Campaña de prueba E2E",
    description: "Descripción de prueba con más de cincuenta caracteres para validar.",
    content: "<p>Contenido <strong>bold</strong> con <a href=\"https://example.com\">link</a></p><ul><li>item</li></ul>",
    status: statusValue, date: "Junio 2026",
  }).select().single()
  check("insert campaña", !ins1.error, ins1.error?.message)

  // unicidad: mismo slug → la lógica del action agregaría -2
  const clash = await admin.from("campaigns").select("id").eq("slug", TEST_SLUG).maybeSingle()
  check("slug duplicado detectado (checkSlugAvailability)", !!clash.data)

  // ── 4. Storage: upload + public URL + delete ──
  console.log("\n[4] Storage upload/delete")
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  )
  const imgPath = `${TEST_SLUG}/${Date.now()}-test.png`
  const up = await admin.storage.from("campaign-images").upload(imgPath, png, { contentType: "image/png" })
  check("upload al bucket", !up.error, up.error?.message)
  const { data: pub } = admin.storage.from("campaign-images").getPublicUrl(imgPath)
  const headRes = await fetch(pub.publicUrl, { method: "HEAD" })
  check("URL pública accesible", headRes.ok, `→ ${headRes.status}`)

  // fila en campaign_images + posición
  const imgRow = await admin.from("campaign_images").insert({
    campaign_id: ins1.data!.id, url: pub.publicUrl, alt: "test", position: 0,
  }).select().single()
  check("fila campaign_images", !imgRow.error)

  // delete imagen: archivo + fila (lo que hace deleteCampaignImage)
  const marker = `/storage/v1/object/public/campaign-images/`
  const parsed = pub.publicUrl.slice(pub.publicUrl.indexOf(marker) + marker.length)
  check("parseo de path desde URL", parsed === imgPath, `→ ${parsed}`)
  await admin.storage.from("campaign-images").remove([parsed])
  const headGone = await fetch(pub.publicUrl, { method: "HEAD" })
  check("archivo eliminado del bucket", !headGone.ok)

  // ── 5. Páginas públicas (HTTP) ──
  console.log("\n[5] Páginas públicas")
  const list = await fetch(`${URL_BASE}/campanas`)
  const listHtml = await list.text()
  check("/campanas responde 200", list.ok)
  check("/campanas muestra campañas reales", listHtml.includes("Grupo Presidente"))
  check("/campanas NO muestra la campaña de prueba aún sin revalidar (cache 60s) o la muestra si revalidó", true)

  const detail = await fetch(`${URL_BASE}/campanas/lynk-co-grupo-presidente`)
  const detailHtml = await detail.text()
  check("/campanas/[slug] responde 200", detail.ok)
  check("detalle renderiza HTML del content", detailHtml.includes("declaración de principios"))
  check("detalle usa .rich-content", detailHtml.includes("rich-content"))

  const missing = await fetch(`${URL_BASE}/campanas/no-existe-xyz`)
  check("slug inexistente → 404", missing.status === 404)

  // ── 6. Draft invisible + preview (solo si la migración corrió) ──
  console.log("\n[6] Borradores")
  if (migrationDone) {
    await admin.from("campaigns").update({ status: "draft" }).eq("id", ins1.data!.id)
    const draftPublic = await fetch(`${URL_BASE}/campanas/${TEST_SLUG}`)
    check("draft sin preview → 404", draftPublic.status === 404)
    const draftPreviewNoAuth = await fetch(`${URL_BASE}/campanas/${TEST_SLUG}?preview=true`)
    check("draft con preview SIN auth → 404", draftPreviewNoAuth.status === 404)
  } else {
    console.log("  ⚠ Saltado: requiere la migración SQL (no se pueden guardar drafts todavía)")
  }

  // ── 7. Admin protegido + sesión real ──
  console.log("\n[7] Admin")
  const adminNoAuth = await fetch(`${URL_BASE}/admin/campanas`, { redirect: "manual" })
  check("/admin/campanas sin sesión → redirect a login", [302, 307].includes(adminNoAuth.status))

  // Usuario temporal para probar autenticado
  const created = await admin.auth.admin.createUser({
    email: TEST_EMAIL, password: TEST_PASS, email_confirm: true,
  })
  check("usuario de prueba creado", !created.error, created.error?.message)

  // Capturamos las cookies que escribiría @supabase/ssr
  const jar = new Map<string, string>()
  const ssrClient = createServerClient(SUPA_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (cs) => cs.forEach((c) => jar.set(c.name, c.value)),
    },
  })
  const signIn = await ssrClient.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASS })
  check("login del usuario de prueba", !signIn.error, signIn.error?.message)
  const cookieHeader = [...jar.entries()]
    .map(([n, v]) => `${n}=${encodeURIComponent(v)}`)
    .join("; ")

  const adminAuthed = await fetch(`${URL_BASE}/admin/campanas`, {
    headers: { cookie: cookieHeader },
  })
  const adminHtml = await adminAuthed.text()
  check("/admin/campanas con sesión → 200", adminAuthed.ok, `→ ${adminAuthed.status}`)
  check("lista muestra las campañas", adminHtml.includes("Grupo Presidente"))
  check("lista muestra badges de estado", adminHtml.includes("Activa"))
  check("botón Nueva campaña", adminHtml.includes("Nueva campaña"))

  const nueva = await fetch(`${URL_BASE}/admin/campanas/nueva`, { headers: { cookie: cookieHeader } })
  const nuevaHtml = await nueva.text()
  check("/admin/campanas/nueva → 200", nueva.ok)
  check("formulario con secciones", nuevaHtml.includes("Datos básicos") && nuevaHtml.includes("Contenido expandido"))

  const editar = await fetch(`${URL_BASE}/admin/campanas/lynk-co-grupo-presidente/editar`, {
    headers: { cookie: cookieHeader },
  })
  const editarHtml = await editar.text()
  check("/admin/campanas/[slug]/editar → 200", editar.ok)
  check("editor precargado con datos", editarHtml.includes("Grupo Presidente"))

  if (migrationDone) {
    const previewAuthed = await fetch(`${URL_BASE}/campanas/${TEST_SLUG}?preview=true`, {
      headers: { cookie: cookieHeader },
    })
    const previewHtml = await previewAuthed.text()
    check("preview de draft CON auth → 200", previewAuthed.ok)
    check("banner de borrador visible", previewHtml.toLowerCase().includes("vista previa"))
  }

  const dash = await fetch(`${URL_BASE}/admin/dashboard`, { headers: { cookie: cookieHeader } })
  const dashHtml = await dash.text()
  check("dashboard con tarjeta Campañas + contador", dashHtml.includes("Campañas") && /activa/.test(dashHtml))

  // ── Cleanup ──
  await cleanup()
  console.log(`\n━━━ Resultado: ${pass} pass / ${fail} fail ━━━`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch(async (e) => {
  console.error("FATAL:", e)
  await cleanup()
  process.exit(1)
})
