/**
 * Altas de clippings — octubre 2026 (PROMPT 2 y 3A de clippings-oct2026/).
 *
 *   npx tsx scripts/load-clippings-oct2026.ts           → arma el plan (NO escribe en la base)
 *   npx tsx scripts/load-clippings-oct2026.ts --apply   → inserta lo que dice el plan
 *
 * El plan se guarda en clippings-oct2026/plan-altas.json. Si algún medio bloquea
 * al bot, su metadata se puede completar a mano en
 * clippings-oct2026/overrides.json ({ [url]: { title, published_at, image_url, medium? } })
 * y se vuelve a correr el plan.
 *
 * Reglas:
 *  - Dedup por url normalizada contra los clippings del cliente y dentro del lote.
 *    entornoeconomico.com(.ar) y mendoza24.com.ar son espejos: se comparan por id de nota.
 *  - Metadata con parseMetadata() (la misma lógica del autocompletar del admin).
 *  - title nunca vacío (si no hay, la fila falla). medium: el nombre que ya usa la
 *    base para ese dominio → og:site_name → columna medio del CSV.
 *  - Imagen: og:image(:secure_url) → twitter:image → JSON-LD → primer <img> de
 *    <article> con width > 600. Se valida que responda 200 con content-type de imagen.
 *    Se guarda el link directo (mismo criterio que backfill-clipping-images.ts).
 *  - published_at es NOT NULL en la tabla: fecha del medio → fecha en la url →
 *    mediana de la misma campaña en el lote → fecha de carga. El origen queda en el plan.
 *  - scope: el que ya tiene ese dominio en la base; si es nuevo, por mapa de medios.
 *  - order_position: siguiente al máximo actual del cliente.
 */

import { createClient } from "@supabase/supabase-js"
import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { parseMetadata } from "../lib/extract-metadata"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")
// --dir=<carpeta> usa otra tanda (por defecto, la de octubre).
const DIR = path.resolve(process.cwd(), process.argv.find((a) => a.startsWith("--dir="))?.slice(6) ?? "clippings-oct2026")
// --sinurl: filas de sin-url.csv resueltas desde los hipervínculos de las planillas.
const SINURL = process.argv.includes("--sinurl")
// --planilla: todo lo que está en las planillas y todavía no estaba cargado.
const PLANILLA = process.argv.includes("--planilla")
const PLAN = path.join(DIR, SINURL ? "plan-sinurl.json" : PLANILLA ? "plan-planilla.json" : "plan-altas.json")
const OVERRIDES = path.join(DIR, "overrides.json")
const TODAY = new Date().toISOString().slice(0, 10)

const FILES: [string, string][] = SINURL || PLANILLA
  ? ["bolsa-comercio", "colegio-notarial", "quienvino", "capilla-acutis", "grupo-presidente", "noche-de-los-chefs"]
      .map((slug) => [`${SINURL ? "sinurl" : "planilla"}-${slug}.csv`, slug] as [string, string])
      .filter(([file]) => fs.existsSync(path.join(DIR, file)))
  : [
  ["altas-bcm.csv", "bolsa-comercio"],
  ["altas-colegio-notarial.csv", "colegio-notarial"],
  ["altas-quienvino.csv", "quienvino"],
  ["altas-capilla-acutis.csv", "capilla-acutis"],
  ["altas-grupo-presidente.csv", "grupo-presidente"],
  ["altas-noche-de-los-chefs.csv", "noche-de-los-chefs"],
  ["altas-chakaymanta.csv", "chakaymanta"],
    ].filter(([file]) => fs.existsSync(path.join(DIR, file))) as [string, string][]

/** Alcance para dominios que todavía no están en la base. */
const NEW_DOMAIN_SCOPE: Record<string, string> = {
  "noticiasdebariloche.com.ar": "regional",
  "eldiariodelapampa.com.ar": "regional",
  "diariodeloeste.com.ar": "regional",
  "editorialrn.com.ar": "regional",
  "diariodecuyo.com.ar": "regional",
  "lvdiez.com.ar": "regional",
  "iprofesional.com": "nacional",
  "noticias.telefe.com": "nacional",
}

// Se identifica como lo que es (vista previa de enlaces); los medios que lo rechacen quedan "solo link".
const UA = "Mozilla/5.0 (compatible; SanchezMarianLinkPreview/1.0; +https://www.sanchezmarian.com)"
const HEADERS = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

interface PlanRow {
  file: string
  client_slug: string
  csv_medio: string
  campania: string
  url: string
  status: "insert" | "duplicate" | "failed"
  reason?: string
  medium?: string
  title?: string
  published_at?: string
  date_source?: "medio" | "url" | "texto" | "campaña" | "carga" | "manual"
  scope?: string
  image_url?: string | null
  image_source?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const host = (u: string) => new URL(u).hostname.toLowerCase().replace(/^www\./, "")

function normalizeUrl(raw: string): string {
  const s = raw.trim().toLowerCase()
  try {
    const u = new URL(s)
    const v = u.hostname.endsWith("youtube.com") ? u.searchParams.get("v") : null
    let out = `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/+$/, "")
    if (v) out += `?v=${v}`
    return out
  } catch {
    return s.split("?")[0].replace(/\/+$/, "")
  }
}

/** Clave de deduplicación: url normalizada, con espejos y AMP colapsados. */
function dedupKey(raw: string): string {
  const n = normalizeUrl(raw)
  try {
    const u = new URL(n)
    const h = u.hostname.replace(/^www\./, "")
    const segs = u.pathname.split("/").filter((s) => s && s !== "amp")
    if (/^(entornoeconomico\.com(\.ar)?|mendoza24\.com\.ar)$/.test(h)) {
      const id = segs.map((s) => s.match(/^(\d+)-/)?.[1]).find(Boolean)
      if (id) return `entorno:${id}`
    }
    if (h === "infomendoza.info") return `infomendoza:${segs.at(-1)}`
    return `${h}/${segs.join("/")}`
  } catch {
    return n
  }
}

function parseCsv(file: string): Record<string, string>[] {
  const text = fs.readFileSync(path.join(DIR, file), "utf8").trim()
  const lines = text.split(/\r?\n/)
  const split = (line: string) => {
    const cells: string[] = []
    let cur = ""
    let q = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++ } else q = !q
      } else if (ch === "," && !q) { cells.push(cur); cur = "" } else cur += ch
    }
    cells.push(cur)
    return cells
  }
  const head = split(lines[0])
  return lines.slice(1).map((l) => {
    const c = split(l)
    return Object.fromEntries(head.map((h, i) => [h, (c[i] ?? "").trim()]))
  })
}

async function decodeBody(res: Response): Promise<string> {
  const buf = Buffer.from(await res.arrayBuffer())
  const head = buf.subarray(0, 4096).toString("latin1")
  const charset =
    res.headers.get("content-type")?.match(/charset=([\w-]+)/i)?.[1] ??
    head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ??
    "utf-8"
  let html = new TextDecoder(charset.toLowerCase() === "utf8" ? "utf-8" : charset).decode(buf)
  // Páginas que declaran utf-8 pero vienen en latin1: aparecen caracteres de reemplazo.
  if (html.includes("�")) html = new TextDecoder("windows-1252").decode(buf)
  return html
}

async function fetchHtml(url: string): Promise<{ html?: string; error?: string; blocked?: boolean }> {
  let last = ""
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const res = await fetch(url, { signal: controller.signal, redirect: "follow", headers: HEADERS })
      if (res.ok) return { html: await decodeBody(res) }
      last = `HTTP ${res.status}`
      if (res.status === 404 || res.status === 410) break
    } catch (e) {
      last = (e as Error).name === "AbortError" ? "timeout 10s" : (e as Error).message
    } finally {
      clearTimeout(timer)
    }
    await sleep(800)
  }
  return { error: last, blocked: /HTTP (403|429)/.test(last) }
}

async function isImage(url: string): Promise<boolean> {
  for (const method of ["HEAD", "GET"] as const) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const res = await fetch(url, {
        method,
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8", ...(method === "GET" ? { Range: "bytes=0-1023" } : {}) },
      })
      res.body?.cancel().catch(() => {})
      const type = res.headers.get("content-type") ?? ""
      if ((res.status === 200 || res.status === 206) && type.startsWith("image/")) return true
    } catch {
      // probar con GET
    } finally {
      clearTimeout(timer)
    }
  }
  return false
}

function imageCandidates(html: string, url: string, jsonLdImage: string | null): [string, string][] {
  const $ = cheerio.load(html)
  const abs = (raw?: string | null) => {
    if (!raw) return null
    try {
      const u = new URL(raw.trim(), url)
      return u.protocol.startsWith("http") ? u.href : null
    } catch {
      return null
    }
  }
  const m = (sel: string) => abs($(sel).first().attr("content"))
  const out: [string, string | null][] = [
    ["og:image:secure_url", m('meta[property="og:image:secure_url"]')],
    ["og:image", m('meta[property="og:image"]')],
    ["twitter:image", m('meta[name="twitter:image"]') ?? m('meta[property="twitter:image"]')],
    ["twitter:image:src", m('meta[name="twitter:image:src"]')],
    ["json-ld", jsonLdImage],
  ]
  // Sin <article> (ej. Prensa Gobierno, Divi), se busca en el cuerpo.
  $($("article").length ? "article img" : "main img, body img").each((_, el) => {
    const w = parseInt($(el).attr("width") ?? "", 10)
    if (w > 600) out.push(["article img", abs($(el).attr("src") ?? $(el).attr("data-src"))])
  })
  const seen = new Set<string>()
  return out.filter((c): c is [string, string] => !!c[1] && !seen.has(c[1]) && !!seen.add(c[1]))
}

const MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8,
  septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
}
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
/** Fecha razonable para una nota: desde 2025 y anterior a hoy (hoy suele ser el reloj del header). */
const plausible = (d: string) => d >= "2025-01-01" && d < TODAY

/** Fechas escritas en texto: "22 de abril de 2026", "15 Agosto 2026", "septiembre 6, 2026", "21/04/2026". */
function datesInText(text: string): string[] {
  const out: string[] = []
  const re =
    /\b(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de)?,?\s+(20\d\d)\b|\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+(\d{1,2}),?\s+(20\d\d)\b|\b(\d{1,2})\/(\d{1,2})\/(20\d\d)\b/gi
  for (const m of text.matchAll(re)) {
    if (m[1]) out.push(iso(+m[3], MONTHS[m[2].toLowerCase()], +m[1]))
    else if (m[4]) out.push(iso(+m[6], MONTHS[m[4].toLowerCase()], +m[5]))
    else if (+m[8] <= 12) out.push(iso(+m[9], +m[8], +m[7]))
  }
  return out
}

/** Fecha de publicación cuando la página no la declara en <meta>. */
async function findDate(html: string, url: string): Promise<{ date: string; source: PlanRow["date_source"] } | null> {
  const $ = cheerio.load(html)
  const attr =
    $("time[datetime]").first().attr("datetime") ??
    $('[itemprop="datePublished"]').first().attr("content") ??
    $('[itemprop="datePublished"]').first().attr("datetime")
  const fromAttr = attr?.match(/^(20\d\d)-(\d\d)-(\d\d)/)
  if (fromAttr && plausible(fromAttr[0])) return { date: fromAttr[0], source: "medio" }

  // WordPress: la API pública devuelve la fecha del post por slug.
  if (/wp-content|wp-json/.test(html)) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1)
    try {
      const res = await fetch(`${new URL(url).origin}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug ?? "")}&_fields=date`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(10_000),
      })
      if (res.ok) {
        const d = (await res.json())?.[0]?.date?.slice(0, 10)
        if (d && plausible(d)) return { date: d, source: "medio" }
      }
    } catch {}
  }

  const fromUrl = dateFromUrl(url)
  if (fromUrl) return { date: fromUrl, source: "url" }

  $("script, style, noscript").remove()
  const timeText = $("time").first().text()
  const first =
    datesInText(timeText).find(plausible) ??
    datesInText($('[itemprop="datePublished"]').first().text()).find(plausible) ??
    datesInText($("article").first().text()).find(plausible) ??
    datesInText($("main").first().text()).find(plausible) ??
    datesInText($("body").text()).find(plausible)
  return first ? { date: first, source: "texto" } : null
}

function dateFromUrl(url: string): string | null {
  const a = url.match(/\/(20\d\d)\/(\d{1,2})\/(\d{1,2})\//)
  if (a) return `${a[1]}-${a[2].padStart(2, "0")}-${a[3].padStart(2, "0")}`
  const b = url.match(/_(20\d\d)(\d\d)(\d\d)\/?$/)
  if (b) return `${b[1]}-${b[2]}-${b[3]}`
  return null
}

/** Decodifica entidades HTML y saca el " - Medio" / " | Medio" del final. */
function cleanTitle(raw: string | null, sites: string[]): string | undefined {
  if (!raw) return undefined
  let t = cheerio.load(`<p>${raw}</p>`)("p").text().replace(/\s+/g, " ").trim()
  const norm = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const m = t.match(/^(.{20,}?)\s+[-–—|]\s+([^-–—|]{2,40})$/)
  if (m) {
    const suffix = norm(m[2])
    if (sites.some((s) => s && (norm(s).includes(suffix) || suffix.includes(norm(s))))) t = m[1].trim()
  }
  return t || undefined
}

/** Título de respaldo desde el slug de la url (para medios que bloquean bots). */
function titleFromUrl(url: string): string {
  const seg = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? ""
  const words = decodeURIComponent(seg)
    .replace(/\.html?$/, "")
    .replace(/-n?\d{5,}$/, "")
    .replace(/^\d+-/, "")
    .replace(/[-_]+/g, " ")
    .trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

async function buildPlan() {
  const { data: clients, error } = await admin.from("clients").select("id, slug")
  if (error) throw error
  const idOf = new Map(clients!.map((c) => [c.slug as string, c.id as string]))
  const { data: existing, error: e2 } = await admin.from("clippings").select("client_id, url, medium, scope")
  if (e2) throw e2

  // nombre de medio y scope más usados por dominio en la base
  const names = new Map<string, Map<string, number>>()
  const scopes = new Map<string, Map<string, number>>()
  const bump = (m: Map<string, Map<string, number>>, k: string, v: string) => {
    const inner = m.get(k) ?? new Map<string, number>()
    inner.set(v, (inner.get(v) ?? 0) + 1)
    m.set(k, inner)
  }
  for (const r of existing!) {
    try {
      const h = host(r.url)
      bump(names, h, r.medium)
      bump(scopes, h, r.scope)
    } catch {}
  }
  const top = (m?: Map<string, number>) =>
    m ? [...m].sort((a, z) => z[1] - a[1] || Number(a[0] === a[0].toUpperCase()) - Number(z[0] === z[0].toUpperCase()))[0][0] : undefined

  const overrides: Record<string, Partial<PlanRow>> = fs.existsSync(OVERRIDES)
    ? JSON.parse(fs.readFileSync(OVERRIDES, "utf8"))
    : {}

  const seen = new Set(existing!.map((r) => `${r.client_id}|${dedupKey(r.url)}`))
  const plan: PlanRow[] = []

  for (const [file, slug] of FILES) {
    const clientId = idOf.get(slug)
    if (!clientId) throw new Error(`cliente no encontrado: ${slug}`)
    for (const row of parseCsv(file)) {
      const p: PlanRow = { file, client_slug: slug, csv_medio: row.medio, campania: row.campania, url: row.url, status: "insert" }
      plan.push(p)
      const key = `${clientId}|${dedupKey(row.url)}`
      if (seen.has(key)) {
        p.status = "duplicate"
        p.reason = "ya cargada en el cliente (o repetida en el lote)"
        continue
      }
      seen.add(key)

      const h = host(row.url)
      const ov = overrides[row.url]
      let meta = { medium: null as string | null, title: null as string | null, published_at: null as string | null, image: null as string | null }
      let candidates: [string, string][] = []
      let html = ""
      if (ov) {
        meta = { medium: ov.medium ?? null, title: ov.title ?? null, published_at: ov.published_at ?? null, image: ov.image_url ?? null }
        if (meta.image) candidates = [["manual", meta.image]]
      } else {
        const res = await fetchHtml(row.url)
        await sleep(300 + Math.random() * 200)
        if (!res.html && res.blocked) {
          // El medio bloquea bots: se carga igual con el link, título armado desde la url y sin imagen.
          p.title = titleFromUrl(row.url)
          p.medium = top(names.get(h)) ?? titleCase(row.medio)
          p.scope = top(scopes.get(h)) ?? NEW_DOMAIN_SCOPE[h] ?? "local"
          p.image_url = null
          p.reason = `solo link (${res.error})`
          const d = dateFromUrl(row.url)
          if (d) {
            p.published_at = d
            p.date_source = "url"
          }
          console.log(`   [${slug}] ${p.medium} — ${p.title.slice(0, 70)} (solo link)`)
          continue
        }
        if (!res.html) {
          p.status = "failed"
          p.reason = res.error
          continue
        }
        html = res.html
        meta = parseMetadata(html, row.url)
        candidates = imageCandidates(html, row.url, meta.image)
      }

      const siteName = top(names.get(h)) ?? meta.medium ?? row.medio
      let title = cleanTitle(meta.title, [siteName, meta.medium ?? "", row.medio])
      if (title && /líder en noticias|^inicio$|^home$/i.test(title)) {
        // La página devolvió la portada del medio: título desde la url y sin imagen (sería la de la portada).
        title = titleFromUrl(row.url)
        candidates = []
      }
      if (!title) {
        p.status = "failed"
        p.reason = "sin título en la página"
        continue
      }
      p.title = title
      p.medium = top(names.get(h)) ?? meta.medium?.trim() ?? titleCase(row.medio)
      p.scope = top(scopes.get(h)) ?? NEW_DOMAIN_SCOPE[h] ?? "local"

      if (meta.published_at && meta.published_at >= TODAY) meta.published_at = null
      if (meta.published_at) {
        p.published_at = meta.published_at
        p.date_source = ov ? "manual" : "medio"
      } else {
        const found = html ? await findDate(html, row.url) : dateFromUrl(row.url) ? { date: dateFromUrl(row.url)!, source: "url" as const } : null
        if (found) {
          p.published_at = found.date
          p.date_source = found.source
        }
      }

      p.image_url = null
      for (const [source, img] of candidates) {
        if (await isImage(img)) {
          p.image_url = img
          p.image_source = source
          break
        }
      }
      console.log(`${p.image_url ? "🖼" : "  "} [${slug}] ${p.medium} — ${title.slice(0, 70)}`)
    }
  }

  // Fechas faltantes: mediana de la misma campaña del cliente en el lote, o fecha de carga.
  for (const p of plan) {
    if (p.status !== "insert" || p.published_at) continue
    const dates = plan
      .filter((o) => o.client_slug === p.client_slug && o.campania === p.campania && o.published_at && o.date_source !== "campaña" && o.date_source !== "carga")
      .map((o) => o.published_at!)
      .sort()
    if (dates.length) {
      p.published_at = dates[Math.floor(dates.length / 2)]
      p.date_source = "campaña"
    } else {
      p.published_at = TODAY
      p.date_source = "carga"
    }
  }

  fs.writeFileSync(PLAN, JSON.stringify(plan, null, 2))
  report(plan)
}

function report(plan: PlanRow[]) {
  console.log("\ncliente".padEnd(22), "a insertar", "duplicadas", "fallidas", "sin imagen", "fecha estimada")
  for (const [, slug] of FILES) {
    const rows = plan.filter((p) => p.client_slug === slug)
    const ins = rows.filter((p) => p.status === "insert")
    console.log(
      slug.padEnd(21),
      String(ins.length).padStart(10),
      String(rows.filter((p) => p.status === "duplicate").length).padStart(10),
      String(rows.filter((p) => p.status === "failed").length).padStart(8),
      String(ins.filter((p) => !p.image_url).length).padStart(10),
      String(ins.filter((p) => p.date_source === "campaña" || p.date_source === "carga").length).padStart(14),
    )
  }
  const list = (label: string, rows: PlanRow[], extra: (p: PlanRow) => string = () => "") => {
    console.log(`\n${label} (${rows.length}):`)
    for (const p of rows) console.log(` - [${p.client_slug}] ${p.url}${extra(p)}`)
  }
  list("DUPLICADAS", plan.filter((p) => p.status === "duplicate"))
  list("FALLIDAS", plan.filter((p) => p.status === "failed"), (p) => `\n     ${p.reason}`)
  list("SIN IMAGEN", plan.filter((p) => p.status === "insert" && !p.image_url))
  list(
    "FECHA ESTIMADA",
    plan.filter((p) => p.status === "insert" && (p.date_source === "campaña" || p.date_source === "carga")),
    (p) => `  → ${p.published_at} (${p.date_source})`,
  )
}

async function apply() {
  if (!fs.existsSync(PLAN)) throw new Error("No hay plan: correr primero sin --apply")
  const plan: PlanRow[] = JSON.parse(fs.readFileSync(PLAN, "utf8"))
  const { data: clients } = await admin.from("clients").select("id, slug")
  const idOf = new Map(clients!.map((c) => [c.slug as string, c.id as string]))
  let inserted = 0
  let skipped = 0
  for (const [, slug] of FILES) {
    const clientId = idOf.get(slug)!
    const { data: rows, error } = await admin.from("clippings").select("url, order_position").eq("client_id", clientId)
    if (error) throw error
    const keys = new Set(rows!.map((r) => dedupKey(r.url)))
    let next = Math.max(0, ...rows!.map((r) => r.order_position ?? 0)) + 1
    for (const p of plan.filter((x) => x.client_slug === slug && x.status === "insert")) {
      if (keys.has(dedupKey(p.url))) {
        skipped++
        continue
      }
      const { error: e } = await admin.from("clippings").insert({
        client_id: clientId,
        medium: p.medium,
        title: p.title,
        published_at: p.published_at,
        scope: p.scope,
        url: p.url,
        image_url: p.image_url,
        order_position: next++,
      })
      if (e) {
        console.log(`✗ [${slug}] ${p.url}: ${e.message}`)
        continue
      }
      keys.add(dedupKey(p.url))
      inserted++
    }
  }
  console.log(`\nInsertados: ${inserted}. Salteados por ya existir: ${skipped}.`)

  // Títulos con acentos rotos (clippings ya cargados): solo se pisan si siguen iguales.
  const FIXES = path.join(DIR, "title-fixes.json")
  if (fs.existsSync(FIXES)) {
    const fixes: { id: string; before: string; title: string }[] = JSON.parse(fs.readFileSync(FIXES, "utf8"))
    let fixed = 0
    for (const f of fixes) {
      const { data } = await admin.from("clippings").update({ title: f.title }).eq("id", f.id).eq("title", f.before).select("id")
      fixed += data?.length ?? 0
    }
    console.log(`Títulos corregidos: ${fixed}.`)
  }
}

;(APPLY ? apply() : buildPlan()).catch((e) => {
  console.error(e)
  process.exit(1)
})
