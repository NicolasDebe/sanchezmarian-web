/**
 * Carga de clippings reales (julio 2026) — Capilla Carlo Acutis + Grupo Presidente.
 * Ejecutar con: npx tsx scripts/seed-clippings-julio-2026.ts
 *
 * Reglas (idempotente, no destructivo):
 *  - Dedup GLOBAL por `url`: si la URL ya existe en `clippings`, se saltea con
 *    log (no se actualiza el registro existente).
 *  - Los clientes se resuelven contra la tabla `clients` (select id, slug). Si
 *    un slug no existe, se loguea y se saltean esas entradas (no se crea cliente).
 *  - Enriquecimiento con cheerio (reutiliza fetchUrlMetadata de
 *    lib/extract-metadata): como el array no trae `title`, se busca og:title ||
 *    <title>. `medium` y `published_at` vienen curados en el array y se respetan.
 *  - Si el fetch falla (timeout/403/404), NO aborta: usa un título derivado de
 *    la URL (o el medio) y sigue con la próxima entrada.
 *  - order_position = 0 para todas (el orden público es por published_at DESC).
 *  - format no viene en el array → cae al default 'Digital' de la tabla.
 *
 * No borrar este script: queda commiteado por si hay que re-correrlo.
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"
import { fetchUrlMetadata } from "../lib/extract-metadata"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

const SCOPE_MAP: Record<string, string> = {
  Local: "local",
  Regional: "regional",
  Nacional: "nacional",
  Internacional: "internacional",
}

interface SeedEntry {
  clientSlug: string
  medium: string
  scope: string
  published_at: string
  url: string
  title?: string
}

// NOTA: el slug real de la capilla en `clients` es `capilla-acutis`
// (verificado contra la DB), no `capilla-carlo-acutis`. `grupo-presidente` sí
// coincide. El array se ajustó en consecuencia.
const CLIPPINGS: SeedEntry[] = [
  // ─────────── CAPILLA CARLO ACUTIS (slug: capilla-acutis) ───────────
  { clientSlug: "capilla-acutis", medium: "MDZ Online", scope: "Nacional", published_at: "2026-05-02", url: "https://www.mdzol.com/sociedad/en-mendoza-levantan-el-primer-templo-dedicado-carlo-acutis-n1510599" },
  { clientSlug: "capilla-acutis", medium: "La Nación", scope: "Nacional", published_at: "2026-05-09", url: "https://www.lanacion.com.ar/sociedad/8000-socios-fundadores-nueva-campana-solidaria-para-avanzar-con-las-obras-de-la-capilla-del-nid09052026/" },
  { clientSlug: "capilla-acutis", medium: "Mendovoz", scope: "Local", published_at: "2026-05-17", url: "https://www.mendovoz.com/lujan/vecinos/2026/5/17/peligra-la-capilla-de-carlo-acutis-en-chacras-piden-ayuda-para-no-frenar-la-obra-172025.html" },
  { clientSlug: "capilla-acutis", medium: "Sitio Andino", scope: "Local", published_at: "2026-05-17", url: "https://www.sitioandino.com.ar/sociedad/la-capilla-carlo-acutis-chacras-coria-corre-peligro-el-plan-salvar-la-obra-n5722844" },
  { clientSlug: "capilla-acutis", medium: "Los Andes", scope: "Local", published_at: "2026-05-18", url: "https://www.losandes.com.ar/sociedad/peligra-la-construccion-la-primera-capilla-del-influencer-dios-el-mundo-los-motivos-n5991494" },
  { clientSlug: "capilla-acutis", medium: "Elnueve", scope: "Local", published_at: "2026-05-20", url: "https://noticiero9.elnueve.com/sociedad/retoman-la-obra-de-la-capilla-de-carlo-acutis-en-mendoza-como-colaborar_20260520/" },
  { clientSlug: "capilla-acutis", medium: "Canal 9", scope: "Local", published_at: "2026-05-20", url: "https://www.youtube.com/watch?v=dqQ7ndnQQXs" },
  { clientSlug: "capilla-acutis", medium: "Ciudadano News", scope: "Local", published_at: "2026-05-21", url: "https://ciudadano.news/sociedad/lujan-de-cuyo-estan-recaudando-fondos-capilla-carlo-acutis-n118455" },
  { clientSlug: "capilla-acutis", medium: "Radio Mágica", scope: "Regional", published_at: "2026-05-21", url: "https://radiomagicadigital.com/peligra-la-continuidad-de-la-capilla-carlo-acutis-en-mendoza-lanzan-suscripcion-nacional-para-salvar-la-obra/" },
  { clientSlug: "capilla-acutis", medium: "261 Noticias", scope: "Local", published_at: "2026-05-21", url: "https://261noticias.com/nota/peligra-la-continuidad-de-la-capilla-carlo-acutis-en-mendoza-lanzan-suscripcion-nacional-para-salvar" },
  { clientSlug: "capilla-acutis", medium: "Diario Mendoza", scope: "Local", published_at: "2026-05-22", url: "https://www.diariomendoza.com.ar/sociedad/la-capilla-carlo-acutis-mendoza-podria-paralizar-su-construccion-falta-fondos-n162521" },
  { clientSlug: "capilla-acutis", medium: "617 News", scope: "Local", published_at: "2026-05-22", url: "https://617.news/capilla-carlo-acutis-lanzan-campana-nacional-para-reactivar-las-obras-del-templo/" },
  { clientSlug: "capilla-acutis", medium: "Mza Today News", scope: "Local", published_at: "2026-05-22", url: "https://mendozatoday.com.ar/2026/05/22/peligra-la-continuidad-de-la-capilla-carlo-acutis-en-lujan-de-cuyo-lanzan-suscripcion-nacional-para-salvar-la-obra/" },
  { clientSlug: "capilla-acutis", medium: "Canal 6 Paraná", scope: "Regional", published_at: "2026-05-22", url: "https://www.youtube.com/watch?v=ekeeGPCHBx0" },
  { clientSlug: "capilla-acutis", medium: "Mendoza Post", scope: "Local", published_at: "2026-05-26", url: "https://www.mendozapost.com/memo/peligra-la-continuidad-de-la-capilla-carlo-acutis/" },
  { clientSlug: "capilla-acutis", medium: "Uno Entre Ríos", scope: "Regional", published_at: "2026-06-05", url: "https://www.unoentrerios.com.ar/el-mundo/campana-solidaria-avanzar-las-obras-la-capilla-del-influencer-dios-n10263041.html" },
  { clientSlug: "capilla-acutis", medium: "Cadena 3", scope: "Nacional", published_at: "2026-06-09", url: "https://www.cadena3.com/amp/noticia/panorama-federal/el-primer-santuario-del-mundo-a-carlo-acutis-retoma-su-construccion-en-mendoza_560510" },
  { clientSlug: "capilla-acutis", medium: "Radio Nacional", scope: "Nacional", published_at: "2026-06-30", url: "https://www.radionacional.com.ar/mendoza-impulsan-la-construccion-del-templo-san-carlo-acutis-y-llaman-a-participar-a-8000-suscriptores-para-colaborar/" },

  // ─────────── GRUPO PRESIDENTE — Lynk & Co (junio 2026) ───────────
  { clientSlug: "grupo-presidente", medium: "Punto a Punto", scope: "Local", published_at: "2026-06-01", url: "https://mendoza.puntoapunto.com.ar/grupo-presidente-trae-a-mendoza-a-lynk-co-la-marca-de-movilidad-premium-de-adn-escandinavo/" },
  { clientSlug: "grupo-presidente", medium: "Cuyo Motor", scope: "Local", published_at: "2026-06-01", url: "https://cuyomotor.com.ar/2026/06/01/lynk-co-marca-asiatica-mendoza/" },
  { clientSlug: "grupo-presidente", medium: "Ecocuyo", scope: "Local", published_at: "2026-06-01", url: "https://ecocuyo.com/nota/150180/de-la-mano-de-grupo-presidente-llega-a-mendoza-una-nueva-automotriz-premium-de-origen-sueco/" },
  { clientSlug: "grupo-presidente", medium: "Entorno Económico", scope: "Local", published_at: "2026-06-01", url: "https://entornoeconomico.com/negocios_empresas/30021-Grupo-Presidente-trae-a-Mendoza-a-Lynk-&-Co-la-marca-escandinava-que-redefine-la-movilidad-premium-global" },
  { clientSlug: "grupo-presidente", medium: "Mendoza Económico", scope: "Local", published_at: "2026-06-01", url: "https://mendozaeconomico.com.ar/nota/2507/lynk-amp-co-llega-a-mendoza-grupo-presidente-lanza-la-preventa-exclusiva-de-la-marca-premium-de-movilidad-china-sueca/" },
  { clientSlug: "grupo-presidente", medium: "Info Negocios", scope: "Local", published_at: "2026-06-01", url: "https://infomendoza.info/nota-principal/grupo-presidente-trae-a-mendoza-a-lynk-co-la-marca-de-movilidad-premium-de-adn-escandinavo" },
  { clientSlug: "grupo-presidente", medium: "Sitio Andino", scope: "Local", published_at: "2026-06-01", url: "https://www.sitioandino.com.ar/economia/autos-chinos-lujo-dos-nuevas-marcas-desembarcan-mendoza-precios-competitivos-n5724001" },
  { clientSlug: "grupo-presidente", medium: "MDZ Online", scope: "Local", published_at: "2026-06-01", url: "https://www.mdzol.com/dinero/el-jugador-premium-que-llega-mendoza-disputarle-china-el-boom-autos-electricos-n1537057" },

  // ─────────── GRUPO PRESIDENTE — Antelo Winter Tour (julio 2026) ───────────
  { clientSlug: "grupo-presidente", medium: "Punto a Punto", scope: "Local", published_at: "2026-07-08", url: "https://mendoza.puntoapunto.com.ar/palmares-valley/" },
  { clientSlug: "grupo-presidente", medium: "Cuyo Motor", scope: "Local", published_at: "2026-07-08", url: "https://cuyomotor.com.ar/2026/07/08/test-drive-fin-de-semana-avanim-antelo/" },
  { clientSlug: "grupo-presidente", medium: "Ecocuyo", scope: "Local", published_at: "2026-07-08", url: "https://ecocuyo.com/nota/150302/una-experiencia-unica-llega-a-mendoza-el-driving-experience-winter-tour-2026/" },
  { clientSlug: "grupo-presidente", medium: "Entorno Económico", scope: "Local", published_at: "2026-07-08", url: "https://entornoeconomico.com.ar/negocios_empresas/31957-GWM-Changan-JMEV-y-Mitsubishi-presentan-todo-su-potencial-con-un-test-drive-en-Palmares-Valley" },
  { clientSlug: "grupo-presidente", medium: "Mendoza Económico", scope: "Local", published_at: "2026-07-08", url: "https://mendozaeconomico.com.ar/nota/2597/manejar-antes-de-comprar-llegan-a-mendoza-test-drives-de-autos-hibridos-electricos-y-camionetas/" },
  { clientSlug: "grupo-presidente", medium: "Info Negocios", scope: "Local", published_at: "2026-07-08", url: "https://infomendoza.info/plus/driving-experience-winter-tour-2026-paso-por-mendoza-y-acerco-las-ultimas-novedades-en-movilidad-a-palmares-valley" },
  { clientSlug: "grupo-presidente", medium: "MDZ Online", scope: "Local", published_at: "2026-07-08", url: "https://www.mdzol.com/mdz-autos/todo-el-winter-tour-2026-grupo-antelo-fechas-sedes-y-modelos-probar-n1543129" },
  { clientSlug: "grupo-presidente", medium: "MDZ Online", scope: "Local", published_at: "2026-07-10", url: "https://www.mdzol.com/sociedad/driving-experience-winter-tour-2026-una-gira-nacional-que-acerca-lo-mejor-gwm-changan-jmev-y-mitsubishi-n1562967" },
]

/**
 * Título de respaldo derivado del slug de la URL, para no romper el NOT NULL de
 * `title` cuando el fetch falla. Marian lo refina desde /admin con el botón de
 * auto-completar. Devuelve null si no hay un segmento razonable (ej. /watch).
 */
function titleFromUrl(raw: string): string | null {
  try {
    const p = new URL(raw).pathname.replace(/\/+$/, "")
    let seg = p.split("/").filter(Boolean).pop() ?? ""
    seg = seg.replace(/\.(html?|php|aspx?)$/i, "")
    seg = seg.replace(/[-_]n?\d{4,}$/i, "") // id final tipo -n1510599 / _20260520
    seg = seg.replace(/[-_]+/g, " ").trim()
    if (seg.length < 8) return null
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  } catch {
    return null
  }
}

async function seed() {
  console.log("🌱 Carga de clippings julio 2026 (Capilla Acutis + Grupo Presidente)\n")

  // ── 1. Mapa de clientes por slug (contra la DB) ──
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id, slug")

  if (clientsError) {
    console.error("✗ No se pudo leer `clients`:", clientsError.message)
    process.exit(1)
  }
  const idBySlug = new Map(clients!.map((c) => [c.slug as string, c.id as string]))

  // ── 2. URLs ya existentes (dedup global por url) ──
  const { data: existing, error: existingError } = await admin
    .from("clippings")
    .select("url")

  if (existingError) {
    console.error("✗ No se pudo leer `clippings`:", existingError.message)
    process.exit(1)
  }
  const existingUrls = new Set((existing ?? []).map((r) => r.url as string))

  // ── 3. Procesar cada entrada ──
  let inserted = 0
  let dedup = 0
  let errors = 0

  for (const entry of CLIPPINGS) {
    const clientId = idBySlug.get(entry.clientSlug)
    if (!clientId) {
      console.warn(`⚠ slug inexistente en clients: "${entry.clientSlug}" — salteada (${entry.url})`)
      errors++
      continue
    }

    // Dedup por url (global). No actualiza el registro existente.
    if (existingUrls.has(entry.url)) {
      console.log(`↷ ya existía: ${entry.url}`)
      dedup++
      continue
    }

    // Enriquecimiento: el array no trae title → buscarlo. medium/published_at
    // vienen curados; solo se usa el fetch como respaldo si algo faltara.
    let title = entry.title?.trim() || null
    let medium = entry.medium
    if (!title) {
      const meta = await fetchUrlMetadata(entry.url)
      title = meta.title?.trim() || titleFromUrl(entry.url) || medium
      // og:site_name solo como respaldo (el medio provisto es curado).
      medium = entry.medium || meta.medium?.trim() || medium
    }

    const row = {
      client_id: clientId,
      medium,
      title,
      published_at: entry.published_at,
      scope: SCOPE_MAP[entry.scope] ?? "local",
      // format omitido → default 'Digital' de la tabla.
      url: entry.url,
      order_position: 0,
      created_by: "seed-julio-2026",
      updated_by: "seed-julio-2026",
    }

    const { error: insertError } = await admin.from("clippings").insert(row)
    if (insertError) {
      console.error(`✗ error al insertar ${entry.url}: ${insertError.message}`)
      errors++
      continue
    }
    existingUrls.add(entry.url) // evita duplicar si la url se repitiera en el array
    inserted++
    console.log(`✓ insertada [${entry.clientSlug}] ${title.slice(0, 60)}`)
  }

  // ── 4. Resumen ──
  console.log("\n────────── RESUMEN ──────────")
  console.log(`total      : ${CLIPPINGS.length}`)
  console.log(`ya existían: ${dedup}`)
  console.log(`insertadas : ${inserted}`)
  console.log(`errores    : ${errors}`)
  console.log("─────────────────────────────")
}

seed().catch((e) => {
  console.error("THROW inesperado:", e)
  process.exit(1)
})
