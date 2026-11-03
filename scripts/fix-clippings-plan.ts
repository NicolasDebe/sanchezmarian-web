/**
 * Retoques al plan de una tanda de clippings antes de aplicarlo (no escribe en la base).
 *
 *   npx tsx scripts/fix-clippings-plan.ts <carpeta> <diff.json>
 *
 *  - sin utm_*; AMP -> canónica si responde 200 (si no, se queda la AMP sin utm)
 *  - medios nuevos: nombre limpio y scope (otras provincias = regional)
 *  - solo-link: título real de la planilla si la celda lo trae
 *  - El Sol (429): reintento con pausa
 * Guarda el plan original en plan-altas.raw.json.
 */
import * as cheerio from "cheerio"
import fs from "fs"
import path from "path"
import { parseMetadata } from "../lib/extract-metadata"

const DIR = path.resolve(process.cwd(), process.argv[2])
const PLAN = path.join(DIR, "plan-altas.json")
const DIFF = process.argv[3]
// Se identifica como lo que es (vista previa de enlaces); los medios que lo rechacen quedan "solo link".
const UA = "Mozilla/5.0 (compatible; SanchezMarianLinkPreview/1.0; +https://www.sanchezmarian.com)"
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const plan: any[] = JSON.parse(fs.readFileSync(PLAN, "utf8"))
if (!fs.existsSync(path.join(DIR, "plan-altas.raw.json"))) fs.writeFileSync(path.join(DIR, "plan-altas.raw.json"), JSON.stringify(plan, null, 2))
const cells = new Map<string, string>(
  (JSON.parse(fs.readFileSync(DIFF, "utf8")) as any[]).filter((o) => o.url && o.text).map((o) => [o.url, o.text]),
)

async function get(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), redirect: "follow", headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8" } })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    let html = new TextDecoder("utf-8").decode(buf)
    if (html.includes("�")) html = new TextDecoder("windows-1252").decode(buf)
    return html
  } catch {
    return null
  }
}
async function isImage(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Range: "bytes=0-1023" }, signal: AbortSignal.timeout(10_000) })
    res.body?.cancel().catch(() => {})
    return (res.status === 200 || res.status === 206) && (res.headers.get("content-type") ?? "").startsWith("image/")
  } catch {
    return false
  }
}
const stripSite = (t: string) =>
  cheerio.load(`<p>${t}</p>`)("p").text().replace(/\s+/g, " ").replace(/\s+[|\-–—]\s+(Diario )?(El Sol|MendoVoz)\b.*$/i, "").trim()

const MEDIUM_FIX: Record<string, string> = {
  "Diario Río Negro | Periodismo en la Patagonia": "Diario Río Negro",
  "America DiarioOoo 10.0": "América Diario",
}
const SCOPE_BY_HOST: Record<string, string> = {
  "unosantafe.com.ar": "regional",
  "rafaelanoticias.com": "regional",
  "holasalta.com": "regional",
  "rosariofinanzas.ar": "regional",
  "rionegro.com.ar": "regional",
  "reconquistaradios.com.ar": "regional",
  "shale24.com": "nacional",
  "mineriaydesarrollo.com": "nacional",
}

function canonical(u: string): string {
  const x = new URL(u)
  for (const k of [...x.searchParams.keys()]) if (/^utm_/i.test(k) || k === "amp") x.searchParams.delete(k)
  x.pathname = x.pathname.split("/").filter((s) => s !== "amp").join("/") || "/"
  return x.href
}

;(async () => {
  for (const p of plan) {
    if (p.status !== "insert") continue
    const original = p.url
    const h = new URL(p.url).hostname.replace(/^www\./, "")

    // 1) URL limpia / canónica
    const needsCheck = /\/amp(\/|$|\?)|[?&]amp=/.test(p.url)
    const hasUtm = /[?&]utm_/.test(p.url)
    const clean = needsCheck || hasUtm ? canonical(p.url) : p.url
    if (clean !== p.url) {
      if (!needsCheck) {
        p.url = clean
      } else {
        const html = await get(clean)
        if (html) {
          const meta = parseMetadata(html, clean)
          if (!p.image_url && meta.image && (await isImage(meta.image))) {
            p.image_url = meta.image
            p.image_source = "og:image (canónica)"
          }
          p.url = clean
          console.log("canónica:", clean.slice(0, 100))
        } else {
          const x = new URL(p.url)
          for (const k of [...x.searchParams.keys()]) if (/^utm_/i.test(k)) x.searchParams.delete(k)
          p.url = x.href
          console.log("AMP sin canónica que responda:", p.url.slice(0, 100))
        }
        await sleep(400)
      }
    }

    // 2) medio y scope
    if (MEDIUM_FIX[p.medium]) p.medium = MEDIUM_FIX[p.medium]
    if (SCOPE_BY_HOST[h]) p.scope = SCOPE_BY_HOST[h]

    // 3) solo-link: título real de la planilla
    if (String(p.reason ?? "").startsWith("solo link")) {
      const cell = cells.get(original) ?? cells.get(original.replace(/\/$/, ""))
      if (cell && !/^https?:\/\//.test(cell)) p.title = stripSite(cell)
    }
  }

  // 4) El Sol (429): reintento con pausa
  for (const p of plan.filter((x) => x.status === "insert" && /elsol\.com\.ar/.test(x.url) && !x.image_url)) {
    await sleep(8000)
    const html = await get(p.url)
    if (!html) {
      console.log("El Sol sigue sin responder:", p.url.slice(-60))
      continue
    }
    const meta = parseMetadata(html, p.url)
    if (meta.title) p.title = stripSite(meta.title)
    if (meta.published_at && meta.published_at < new Date().toISOString().slice(0, 10)) {
      p.published_at = meta.published_at
      p.date_source = "medio"
    }
    if (meta.image && (await isImage(meta.image))) {
      p.image_url = meta.image
      p.image_source = "og:image"
    }
    delete p.reason
    console.log("El Sol OK:", p.title.slice(0, 70), "| img:", !!p.image_url, "|", p.published_at)
  }

  fs.writeFileSync(PLAN, JSON.stringify(plan, null, 2))
  const ins = plan.filter((x) => x.status === "insert")
  console.log(`\nPlan actualizado: ${ins.length} para insertar, ${ins.filter((x) => !x.image_url).length} sin imagen.`)
})()
