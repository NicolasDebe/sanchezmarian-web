/**
 * Auditoría de clippings — octubre 2026 (PROMPT 1 de clippings-oct2026/).
 *
 *   npx tsx scripts/audit-clippings-oct2026.ts           → dry-run (solo reporta)
 *   npx tsx scripts/audit-clippings-oct2026.ts --apply   → aplica bajas/updates
 *
 * Pega contra la Supabase de PRODUCCIÓN (service role). Antes de tocar nada
 * guarda un backup completo de los clippings de los 6 clientes en
 * clippings-oct2026/backup-pre-auditoria.json (se puede reinsertar tal cual).
 *
 *  1. bajas.csv: busca por url normalizada dentro del cliente indicado.
 *     - "URL AMP": prueba la canónica (sin /amp/); si da 200, UPDATE de url.
 *     - "Duplicado": deja una sola fila (la de menor order_position).
 *     - resto: DELETE.
 *  2. Barrido de los 6 clientes: Drive/Docs → DELETE; duplicados por url
 *     normalizada → deja uno; urls caídas (404/410/timeout) → solo se listan.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const APPLY = process.argv.includes("--apply")
const DIR = path.resolve(process.cwd(), "clippings-oct2026")

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const CLIENT_SLUGS: Record<string, string> = {
  BCM: "bolsa-comercio",
  "Colegio Notarial": "colegio-notarial",
  QuienVino: "quienvino",
  "Grupo Presidente": "grupo-presidente",
  "Capilla Carlo Acutis": "capilla-acutis",
  "La Noche de los Chefs": "noche-de-los-chefs",
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

interface Row {
  id: string
  client_id: string
  medium: string
  title: string
  url: string
  order_position: number | null
  [k: string]: unknown
}

/**
 * minúsculas, sin query string, sin barra final. Excepción: en YouTube el id
 * del video vive en ?v=, así que se conserva (si no, todos colapsan a /watch).
 */
export function normalizeUrl(raw: string): string {
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

function parseCsv(file: string): Record<string, string>[] {
  const text = fs.readFileSync(path.join(DIR, file), "utf8").trim()
  const rows: string[][] = []
  for (const line of text.split(/\r?\n/)) {
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
    rows.push(cells)
  }
  const [head, ...body] = rows
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])))
}

async function probe(url: string): Promise<{ status: number | "timeout" | "error"; detail?: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8", "Accept-Language": "es-AR,es;q=0.9" },
      })
      res.body?.cancel().catch(() => {})
      if (res.status < 500 || attempt === 1) return { status: res.status }
    } catch (e) {
      if (attempt === 1) {
        const err = e as Error & { cause?: { code?: string } }
        return err.name === "AbortError"
          ? { status: "timeout" }
          : { status: "error", detail: err.cause?.code ?? err.message }
      }
    } finally {
      clearTimeout(timer)
    }
  }
  return { status: "error" }
}

function canonicalOfAmp(url: string): string {
  const u = new URL(url)
  u.hostname = u.hostname.replace(/^amp\./, "")
  u.pathname = u.pathname.replace(/\/amp(\/|$)/, "/")
  if (u.pathname !== "/" && url.endsWith("/amp")) u.pathname = u.pathname.replace(/\/$/, "")
  return u.href
}

async function main() {
  const { data: clients, error } = await admin.from("clients").select("id, slug, name")
  if (error) throw error
  const bySlug = new Map(clients!.map((c) => [c.slug, c]))
  const ids = Object.values(CLIENT_SLUGS).map((s) => {
    const c = bySlug.get(s)
    if (!c) throw new Error(`cliente no encontrado: ${s}`)
    return c.id as string
  })

  const { data: rowsRaw, error: e2 } = await admin.from("clippings").select("*").in("client_id", ids)
  if (e2) throw e2
  const rows = rowsRaw as Row[]

  const backupPath = path.join(DIR, "backup-pre-auditoria.json")
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2))
    console.log(`backup: ${rows.length} filas → ${backupPath}`)
  } else {
    console.log(`backup ya existente, no se sobrescribe: ${backupPath}`)
  }

  const slugOf = new Map(clients!.map((c) => [c.id, c.slug as string]))
  const before = new Map<string, number>()
  for (const r of rows) before.set(slugOf.get(r.client_id)!, (before.get(slugOf.get(r.client_id)!) ?? 0) + 1)

  const deletes = new Map<string, { row: Row; reason: string }>()
  const updates: { row: Row; newUrl: string }[] = []
  const notes: string[] = []

  // ── 1. bajas.csv ──
  for (const b of parseCsv("bajas.csv")) {
    const slug = CLIENT_SLUGS[b.cliente]
    const clientId = bySlug.get(slug)!.id
    const target = normalizeUrl(b.url)
    const matches = rows
      .filter((r) => r.client_id === clientId && normalizeUrl(r.url) === target)
      .sort((a, z) => (a.order_position ?? 0) - (z.order_position ?? 0))
    if (matches.length === 0) {
      notes.push(`[bajas] sin match en ${slug}: ${b.url}`)
      continue
    }
    const motivo = b.motivo
    if (motivo.startsWith("URL AMP")) {
      for (const m of matches) {
        const canon = canonicalOfAmp(m.url)
        const already = rows.find(
          (r) => r.client_id === clientId && r.id !== m.id && normalizeUrl(r.url) === normalizeUrl(canon),
        )
        if (already) {
          deletes.set(m.id, { row: m, reason: "AMP; la canónica ya está cargada" })
          continue
        }
        const p = await probe(canon)
        if (p.status === 200) {
          updates.push({ row: m, newUrl: canon })
          continue
        }
        // Criterio de curaduría 4: la AMP se descarta cuando EXISTE la canónica.
        // Si la canónica no existe pero la AMP sigue viva, es la única versión
        // de la nota: se conserva y se reporta.
        const self = await probe(m.url)
        if (self.status === 200) notes.push(`[bajas] AMP conservada: canónica ${p.status} (${canon}) pero la AMP responde 200: ${m.url}`)
        else deletes.set(m.id, { row: m, reason: `AMP; ni canónica (${p.status}) ni AMP (${self.status}) responden` })
      }
    } else if (/^Duplicado(?! AMP)/.test(motivo) && !/no es nota publicada/.test(motivo)) {
      // Duplicado puro: queda la de menor order_position.
      if (matches.length < 2) notes.push(`[bajas] "${motivo}" pero hay 1 sola fila: ${b.url}`)
      for (const m of matches.slice(1)) deletes.set(m.id, { row: m, reason: motivo })
    } else {
      if (motivo.startsWith("Duplicado AMP")) {
        const canon = canonicalOfAmp(matches[0].url)
        const has = rows.some((r) => r.client_id === clientId && normalizeUrl(r.url) === normalizeUrl(canon))
        if (!has) notes.push(`[bajas] OJO: se borra AMP y la canónica NO está cargada: ${canon}`)
      }
      for (const m of matches) deletes.set(m.id, { row: m, reason: motivo })
    }
  }

  // ── 2. barrido ──
  const live = rows.filter((r) => !deletes.has(r.id))
  for (const r of live) {
    if (/^https?:\/\/(drive|docs)\.google\.com\//i.test(r.url)) deletes.set(r.id, { row: r, reason: "barrido: link de Drive/Docs" })
  }
  const groups = new Map<string, Row[]>()
  for (const r of live) {
    if (deletes.has(r.id)) continue
    const upd = updates.find((u) => u.row.id === r.id)
    const k = `${r.client_id}|${normalizeUrl(upd ? upd.newUrl : r.url)}`
    groups.set(k, [...(groups.get(k) ?? []), r])
  }
  for (const g of groups.values()) {
    if (g.length < 2) continue
    g.sort((a, z) => (a.order_position ?? 0) - (z.order_position ?? 0))
    for (const d of g.slice(1)) deletes.set(d.id, { row: d, reason: "barrido: url duplicada en el cliente" })
  }

  // urls caídas (solo listar)
  const survivors = rows.filter((r) => !deletes.has(r.id))
  const down: { slug: string; url: string; status: string }[] = []
  const blocked: { slug: string; url: string; status: string }[] = []
  const queue = [...survivors]
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let r = queue.shift(); r; r = queue.shift()) {
        const url = updates.find((u) => u.row.id === r!.id)?.newUrl ?? r.url
        const p = await probe(url)
        const entry = { slug: slugOf.get(r.client_id)!, url, status: String(p.status) + (p.detail ? ` ${p.detail}` : "") }
        if (p.status === 404 || p.status === 410 || p.status === "timeout" || p.status === "error") down.push(entry)
        else if (typeof p.status === "number" && p.status >= 400) blocked.push(entry)
      }
    }),
  )

  // ── aplicar ──
  if (APPLY) {
    for (const u of updates) {
      const { error } = await admin.from("clippings").update({ url: u.newUrl }).eq("id", u.row.id)
      if (error) throw error
    }
    const delIds = [...deletes.keys()]
    if (delIds.length) {
      const { error } = await admin.from("clippings").delete().in("id", delIds)
      if (error) throw error
    }
  }

  // ── reporte ──
  console.log(`\n${APPLY ? "APLICADO" : "DRY-RUN (nada se tocó)"}\n`)
  console.log("cliente".padEnd(20), "antes", "borrados", "AMP→canónica", "después")
  for (const slug of Object.values(CLIENT_SLUGS)) {
    const id = bySlug.get(slug)!.id
    const nd = [...deletes.values()].filter((d) => d.row.client_id === id).length
    const nu = updates.filter((u) => u.row.client_id === id).length
    const b = before.get(slug) ?? 0
    console.log(slug.padEnd(20), String(b).padStart(5), String(nd).padStart(8), String(nu).padStart(12), String(b - nd).padStart(7))
  }
  console.log("\nBORRADOS:")
  for (const d of deletes.values()) console.log(` - [${slugOf.get(d.row.client_id)}] ${d.row.url}\n     ${d.reason}`)
  console.log("\nAMP → CANÓNICA:")
  for (const u of updates) console.log(` - [${slugOf.get(u.row.client_id)}] ${u.row.url}\n     → ${u.newUrl}`)
  console.log("\nCAÍDAS (404/410/timeout/error de red) — NO borradas:")
  for (const d of down) console.log(` - [${d.slug}] ${d.status} ${d.url}`)
  console.log("\nBLOQUEADAS AL BOT (403/otros 4xx) — probablemente vivas, NO borradas:")
  for (const d of blocked) console.log(` - [${d.slug}] ${d.status} ${d.url}`)
  console.log("\nNOTAS:")
  for (const n of notes) console.log(" - " + n)
  const social = survivors.filter((r) => /youtube\.com|youtu\.be|instagram\.com|facebook\.com|fb\.watch|(^|\/\/)(www\.)?x\.com|twitter\.com/i.test(r.url))
  console.log(`\nREDES/YOUTUBE que siguen cargados (${social.length}) — no estaban en bajas.csv:`)
  for (const r of social) console.log(` - [${slugOf.get(r.client_id)}] ${r.medium}: ${r.url}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
