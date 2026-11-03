import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import fs from "fs"
import path from "path"
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const SP = process.argv[2]

function normalizeUrl(raw: string): string {
  const s = raw.trim().toLowerCase()
  try {
    const u = new URL(s)
    const v = u.hostname.endsWith("youtube.com") ? u.searchParams.get("v") : null
    let out = `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/+$/, "")
    if (v) out += `?v=${v}`
    return out
  } catch { return s.split("?")[0].replace(/\/+$/, "") }
}
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
  } catch { return n }
}
const host = (u: string) => { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, "") } catch { return "?" } }
/** Desenvuelve redirecciones de Google y corrige el tipeo ".html4". */
function cleanUrl(raw: string): string {
  let u = raw.trim()
  try {
    const x = new URL(u)
    const g = /(^|\.)google\.com$/.test(x.hostname)
    if (g && x.pathname === "/url") u = x.searchParams.get("url") ?? x.searchParams.get("q") ?? u
    else if (g && x.pathname.startsWith("/amp/s/")) u = "https://" + x.pathname.slice("/amp/s/".length)
  } catch {}
  return u.replace(/(\.html?)\d$/i, "$1")
}
const PLATFORM = /(^|\.)(instagram\.com|youtube\.com|youtu\.be|drive\.google\.com|docs\.google\.com|x\.com|twitter\.com|facebook\.com|spotify\.com)$/

;(async () => {
  const { data: clients } = await admin.from("clients").select("id, slug")
  const slugOf = new Map(clients!.map((c) => [c.id as string, c.slug as string]))
  const { data: db } = await admin.from("clippings").select("client_id, url, format, medium")
  const inDb = new Map<string, Set<string>>()
  const allDb = new Map<string, string>() // key -> slug
  for (const r of db!) {
    const s = slugOf.get(r.client_id)!
    ;(inDb.get(s) ?? inDb.set(s, new Set()).get(s)!).add(dedupKey(r.url))
    allDb.set(dedupKey(r.url), s)
  }
  // lo que existía antes de la auditoría de octubre y hoy ya no está (baja intencional)
  const backup: any[] = JSON.parse(fs.readFileSync("clippings-oct2026/backup-pre-auditoria.json", "utf8"))
  const rows: any[] = Array.isArray(backup) ? backup : Object.values(backup).flat()
  const removed = new Map<string, string>()
  for (const r of rows) {
    if (!r.url) continue
    const k = dedupKey(r.url)
    const s = slugOf.get(r.client_id) ?? r.client_slug
    if (!inDb.get(s)?.has(k)) removed.set(`${s}|${k}`, r.url)
  }
  const bajasCsv = fs.readFileSync("clippings-oct2026/bajas.csv", "utf8")
  const bajasKeys = new Set([...bajasCsv.matchAll(/https?:\/\/[^,\s"]+/g)].map((m) => dedupKey(m[0])))

  // hosts de plataforma que hoy hay en la base
  const plat: Record<string, number> = {}
  for (const r of db!) { const h = host(r.url); if (PLATFORM.test(h)) plat[`${slugOf.get(r.client_id)}:${h}:${r.format}`] = (plat[`${slugOf.get(r.client_id)}:${h}:${r.format}`] ?? 0) + 1 }
  console.log("Plataformas hoy en la base:", plat)
  console.log("formats:", [...new Set(db!.map((r) => r.format))])

  const cands: any[] = JSON.parse(fs.readFileSync(path.join(SP, "candidates.json"), "utf8"))
  const seen = new Set<string>()
  const out: any[] = []
  for (const c of cands) {
    if (!c.url) continue
    c.url = cleanUrl(c.url)
    const k = dedupKey(c.url)
    const h = host(c.url)
    let status = "new"
    if (inDb.get(c.slug)?.has(k)) status = "en-db"
    else if (removed.has(`${c.slug}|${k}`) || bajasKeys.has(k)) status = "baja-previa"
    else if (allDb.has(k)) status = `en-otro-cliente:${allDb.get(k)}`
    else if (seen.has(`${c.slug}|${k}`)) status = "repetida-en-planilla"
    seen.add(`${c.slug}|${k}`)
    const platform = PLATFORM.test(h) ? h : ""
    out.push({ ...c, key: k, host: h, platform, status })
  }
  fs.writeFileSync(path.join(SP, "diff.json"), JSON.stringify(out, null, 1))

  // Lote a cargar: solo clientes pedidos, solo notas web nuevas.
  // argv[3] = carpeta de salida, argv[4] = clientes (slugs separados por coma)
  const SCOPE = new Set((process.argv[4] ?? "bolsa-comercio,noche-de-los-chefs,capilla-acutis,grupo-presidente").split(","))
  // La planilla de Acutis trae una nota de La Noche de los Chefs: va a su cliente.
  const reroute = (o: any) => (o.slug === "capilla-acutis" && /noche-de-los-chefs/i.test(o.url) ? "noche-de-los-chefs" : o.slug)
  const batch: Record<string, any[]> = {}
  for (const o of out) {
    if (!SCOPE.has(o.slug) || o.status !== "new" || o.platform) continue
    const slug = reroute(o)
    // si tras el reruteo ya está en el cliente destino, no se repite
    if (inDb.get(slug)?.has(o.key)) continue
    ;(batch[slug] ??= []).push(o)
  }
  const dir = process.argv[3] ?? "clippings-nov2026"
  fs.mkdirSync(dir, { recursive: true })
  const q = (x: string) => (/[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x)
  for (const [slug, list] of Object.entries(batch)) {
    const seenKey = new Set<string>()
    const lines = ["medio,campania,url"]
    for (const o of list) {
      if (seenKey.has(o.key)) continue
      seenKey.add(o.key)
      lines.push([q(o.medio ?? ""), q(o.sheet), q(o.url)].join(","))
    }
    fs.writeFileSync(path.join(dir, `altas-${slug}.csv`), lines.join("\n") + "\n")
    console.log(`altas-${slug}.csv: ${lines.length - 1} notas`)
  }
  const skipped = out.filter((o) => SCOPE.has(o.slug) && o.status !== "en-db" && (o.platform || o.status !== "new"))
  fs.writeFileSync(path.join(dir, "no-cargadas.json"), JSON.stringify(skipped.map((o) => ({ cliente: o.slug, hoja: o.sheet, medio: o.medio, url: o.url, motivo: o.platform ? `red social / plataforma (${o.platform})` : o.status })), null, 1))
  const { data: chk } = await admin.from("clippings").select("client_id, url").ilike("url", "%36338%")
  console.log("¿36338 en la base?", chk?.map((r) => `${slugOf.get(r.client_id)}:${r.url.slice(0, 80)}`))
  const sum: Record<string, Record<string, number>> = {}
  for (const o of out) { const key = `${o.slug}${o.platform ? " [plataforma]" : ""}`; ((sum[key] ??= {})[o.status.split(":")[0]] = (sum[key][o.status.split(":")[0]] ?? 0) + 1) }
  console.table(sum)
})()
