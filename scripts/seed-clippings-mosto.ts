/**
 * Seed de clippings de la campaña MOSTO / VINEXPO EXPLORER para Bolsa de Comercio.
 * Ejecutar con: npx tsx scripts/seed-clippings-mosto.ts
 *
 * Idempotente: si la URL ya existe en clippings, la saltea.
 * Usa SUPABASE_SERVICE_ROLE_KEY para bypass de RLS.
 * Titles: intenta og:title vía fetch+cheerio; cae a extracción del slug del URL.
 * published_at: placeholder 2026-06-01 (fecha real editable desde el admin).
 */

import { createClient } from "@supabase/supabase-js"
import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const CLIENT_SLUG = "bolsa-comercio"
const CLIENT_NAME = "Bolsa de Comercio"
const PLACEHOLDER_DATE = "2026-06-01"

interface RawClipping {
  medium: string
  url: string
}

// 26 clippings — duplicados de LOS ANDES ya filtrados (mismo URL = una sola fila)
const RAW: RawClipping[] = [
  { medium: "INFONEGOCIOS",      url: "https://infomendoza.info/enfoque/el-mosto-se-consolida-en-el-exterior-como-el-endulzante-premium-de-la-industria" },
  { medium: "MENDOVOZ",          url: "https://www.mendovoz.com/actualidad/panorama-vitivinicola/2026/5/29/el-mosto-se-consolida-en-el-exterior-como-el-endulzante-premium-de-la-industria-172457.html" },
  { medium: "GOB DE MZA",        url: "https://prensa.mendoza.gob.ar/presentaron-en-la-bolsa-de-comercio-los-detalles-de-vinexpo-explorer-2026/" },
  { medium: "617 NEWS",          url: "https://617.news/el-mosto-mendocino-gana-terreno-en-el-mundo-como-endulzante-premium/" },
  { medium: "ENTORNO ECONOMICO", url: "https://entornoeconomico.com/negocios_empresas/29907-El-mosto-se-consolida-en-el-exterior-como-el-endulzante-premium-de-la-industria" },
  { medium: "261 NOTICIAS",      url: "https://261noticias.com/nota/mosto-consolida-exterior-como-endulzante-premium-industria" },
  { medium: "CONEXION AGRO NIHUIL", url: "https://drive.google.com/open?id=1eNX_oCiyLCApPI7QvmU5WLZqK9CYuPU_&authuser=4" },
  { medium: "ECONOMETRO LA RED", url: "https://drive.google.com/file/d/1LeW4TyMZo1Ql0pIIlMy8xuEDvDaie7i0/view" },
  { medium: "CIUDADANO NEWS",    url: "https://ciudadano.news/economia/economiamosto-argentino-endulzante-multinacionales-vitivinicultura-mendoza-n118769" },
  { medium: "MENDOZA TODAY NEWS",url: "https://mendozatoday.com.ar/2026/05/30/las-exportaciones-de-mosto-mendocino-proyectan-estabilidad-con-93-000-toneladas-para-la-actual-campana/" },
  { medium: "MDZOL",             url: "https://www.mdzol.com/dinero/el-producto-mendocino-que-se-consolida-el-exterior-como-endulzante-premium-industrial-n1533601" },
  { medium: "ECOCUYO",           url: "https://ecocuyo.com/nota/150198/vinexpo-explorer-25-importadores-de-mercados-clave-llegan-a-mendoza-para-comprar-vino-a-granel/" },
  { medium: "AGROEMPRESARIO",    url: "https://agroempresario.com/publicacion/118788/cornejo-abrio-vinexpo-explorer-y-apunto-a-mas-exportaciones-de-vino/?cat=168" },
  { medium: "DIARIO MENDOZA",    url: "https://www.diariomendoza.com.ar/economia/cornejo-abrio-vinexpo-explorer-destaco-crecimiento-exportaciones-vino-granel-n164407" },
  { medium: "CIUDAD DE MENDOZA", url: "https://prensa.ciudaddemendoza.gob.ar/2026/06/08/ulpiano-suarez-destaco-a-la-ciudad-como-anfitriona-de-vinexpo-explorer-el-encuentro-mundial-del-vino-a-granel/" },
  { medium: "CUYO NOTICIAS",     url: "https://cuyonoticias.com/contenido/22149/mendoza-recibe-a-compradores-clave-del-vino" },
  { medium: "ENTORNO ECONOMICO", url: "https://entornoeconomico.com/negocios_empresas/30312-Llega-el-evento-mas-importante-de-Argentina-para-las-empresas-exportadoras-de-vino-a-granel" },
  { medium: "MENDOZA POST",      url: "https://www.mendozapost.com/memo/arranco-en-mendoza-la-cumbre-del-vino-a-granel/" },
  { medium: "PRENSA GOB",        url: "https://prensa.mendoza.gob.ar/cornejo-encabezo-la-apertura-de-vinexpo-explorer-mendoza-2026-the-bulk-chapter-el-primer-encuentro-mundial-dedicado-al-vino-a-granel/" },
  { medium: "MEMO",              url: "https://www.memo.com.ar/amp/80879-el-vino-a-granel-pone-a-mendoza-en-el-centro-de-la-escena/" },
  { medium: "617 NEWS",          url: "https://617.news/cornejo-destaco-el-crecimiento-record-de-las-exportaciones-de-vino-a-granel-en-mendoza/" },
  { medium: "PUNTO VID",         url: "https://puntovid.com.ar/vinexpo-explorer-the-bulk-chapter-empezo-en-mendoza-el-encuentro-de-50-bodegas-con-25-compradores-internacionales/" },
  { medium: "SITIO ANDINO",      url: "https://www.sitioandino.com.ar/economia/vinexpo-explorer-mendoza-2026-compradores-internacionales-llegan-la-provincia-busca-vino-granel-n5724397" },
  { medium: "LOS ANDES",         url: "https://www.losandes.com.ar/economia/vinexpo-explorer-25-compradores-internacionales-vino-granel-visitan-mendoza-n5994054" },
  { medium: "ECOCUYO",           url: "https://ecocuyo.com/nota/150209/mendoza-epicentro-global-de-vino-a-granel-importadores-de-13-paises-y-50-bodegas-argemtinas/" },
  { medium: "EL UNO",            url: "https://www.diariouno.com.ar/sociedad/con-50-bodegas-y-25-compradores-internacionales-se-inicio-mendoza-la-vinexpo-explorer-2026-n1563700" },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function titleFromSlug(url: string, medium: string): string {
  try {
    const u = new URL(url)

    if (u.hostname === "drive.google.com") {
      // Sin slug útil — usar el nombre del medio como título
      return medium
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    }

    const segments = u.pathname.split("/").filter(Boolean)
    if (segments.length === 0) return u.hostname

    let slug = segments[segments.length - 1]

    // Quitar extensión de archivo
    slug = slug.replace(/\.(html?|php|aspx?)$/i, "")

    // Si el slug es muy corto o genérico, subir un nivel
    const GENERIC = new Set(["view", "open", "edit", "amp"])
    if (slug.length < 6 || GENERIC.has(slug.toLowerCase())) {
      if (segments.length > 1) {
        slug = segments[segments.length - 2]
        slug = slug.replace(/\.(html?|php|aspx?)$/i, "")
      }
    }

    // Quitar número inicial (ej: "29907-El-mosto..." → "El-mosto...")
    slug = slug.replace(/^\d{3,}-/, "")

    // Quitar sufijo de ID al final (ej: "-n1533601", "-172457")
    slug = slug.replace(/-n?\d{5,}$/, "")

    // Reemplazar guiones/underscores por espacios
    slug = slug.replace(/[-_]/g, " ").trim()

    // Capitalizar primera letra
    return slug.charAt(0).toUpperCase() + slug.slice(1)
  } catch {
    return medium
  }
}

async function fetchOgTitle(url: string): Promise<string | null> {
  if (url.includes("drive.google.com")) return null

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml",
      },
    })
    clearTimeout(timer)

    if (!res.ok) return null

    const html = await res.text()
    const $ = cheerio.load(html)

    const og = $('meta[property="og:title"]').attr("content")?.trim()
    if (og && og.length > 5) return og

    const tw = $('meta[name="twitter:title"]').attr("content")?.trim()
    if (tw && tw.length > 5) return tw

    const t = $("title").text().trim()
    if (t && t.length > 5) return t

    return null
  } catch {
    return null
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seed clippings MOSTO / VINEXPO EXPLORER — Bolsa de Comercio\n")

  // ── 1. Cliente ──────────────────────────────────────────────────────────────
  const { data: existing, error: findErr } = await admin
    .from("clients")
    .select("id, name")
    .eq("slug", CLIENT_SLUG)
    .maybeSingle()

  if (findErr) {
    console.error("✗ Error buscando cliente:", findErr.message)
    process.exit(1)
  }

  let clientId: string

  if (existing) {
    clientId = existing.id as string
    console.log(`✓ Cliente ya existe: "${existing.name}" (id ${clientId})`)
  } else {
    const { data: created, error: createErr } = await admin
      .from("clients")
      .insert({ name: CLIENT_NAME, slug: CLIENT_SLUG, is_active: true })
      .select("id")
      .single()

    if (createErr || !created) {
      console.error("✗ Error creando cliente:", createErr?.message)
      process.exit(1)
    }
    clientId = created.id as string
    console.log(`✓ Cliente creado: "${CLIENT_NAME}" (id ${clientId})`)
  }

  // ── 2. URLs ya presentes (deduplicación global por URL) ─────────────────────
  const { data: existingClippings, error: fetchErr } = await admin
    .from("clippings")
    .select("url")

  if (fetchErr) {
    console.error("✗ Error leyendo clippings existentes:", fetchErr.message)
    process.exit(1)
  }

  const existingUrls = new Set(existingClippings!.map((r: { url: string }) => r.url))

  // ── 3. Deduplicar el array de entrada por URL ───────────────────────────────
  const seen = new Set<string>()
  const unique = RAW.filter(({ url }) => {
    if (seen.has(url)) return false
    seen.add(url)
    return true
  })

  // ── 4. Resolver títulos y armar filas ───────────────────────────────────────
  console.log(`\nResolviendo títulos para ${unique.length} clippings...`)

  const rows: {
    client_id: string
    medium: string
    title: string
    published_at: string
    scope: string
    url: string
    order_position: number
    created_by: string
  }[] = []

  let skipped = 0
  let position = 0

  for (const { medium, url } of unique) {
    if (existingUrls.has(url)) {
      console.log(`  ↷ Salteado (ya existe): ${url.slice(0, 70)}`)
      skipped++
      continue
    }

    process.stdout.write(`  → ${medium.padEnd(22)} `)

    const ogTitle = await fetchOgTitle(url)
    const title = ogTitle ?? titleFromSlug(url, medium)
    const source = ogTitle ? "og:title" : "slug"

    console.log(`[${source}] ${title.slice(0, 60)}`)

    rows.push({
      client_id: clientId,
      medium,
      title,
      published_at: PLACEHOLDER_DATE,
      scope: "local",
      url,
      order_position: position++,
      created_by: "seed-mosto",
    })
  }

  // ── 5. Insertar ─────────────────────────────────────────────────────────────
  console.log()
  if (rows.length === 0) {
    console.log(`✓ Nada para insertar (${skipped} ya existían).`)
  } else {
    const { error: insertErr } = await admin.from("clippings").insert(rows)
    if (insertErr) {
      console.error("✗ Error al insertar:", insertErr.message)
      process.exit(1)
    }
    console.log(`✓ ${rows.length} clippings insertados. ${skipped > 0 ? `${skipped} salteados.` : ""}`)
  }

  // ── 6. Totales ──────────────────────────────────────────────────────────────
  const { count } = await admin
    .from("clippings")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)

  console.log(`\n📊 Bolsa de Comercio: ${count} clippings en total.`)
}

seed().catch((err) => {
  console.error("✗ Error inesperado:", err)
  process.exit(1)
})
