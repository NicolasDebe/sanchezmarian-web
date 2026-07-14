/**
 * Carga de clippings reales — BATCH 2 (julio 2026): QuienVino + Agrocosecha.
 * Ejecutar con: npx tsx scripts/seed-clippings-julio-2026-batch2.ts
 *
 * Mismas reglas duras que scripts/seed-clippings-julio-2026.ts (batch 1),
 * idempotente y no destructivo:
 *  - Dedup GLOBAL por `url`: si la URL ya existe, se saltea con log (no update).
 *  - Clientes resueltos contra `clients` (select id, slug). Slug inexistente →
 *    log + salteo (no se crea cliente). slugs usados: quienvino, agrocosecha
 *    (verificados contra la DB; matchean exacto).
 *  - Enriquecimiento con cheerio (reutiliza fetchUrlMetadata de
 *    lib/extract-metadata): og:title, og:site_name, article:published_time y,
 *    porque la columna `image_url` EXISTE en la tabla (verificado en runtime),
 *    también og:image → se persiste en image_url. Si la columna no existiera,
 *    el script omite ese campo y sigue como el batch 1.
 *  - Si el fetch falla (403/timeout/404): título de respaldo desde la URL o el
 *    medio; fecha = fallback_date; imagen = null. Nunca aborta.
 *  - order_position = 0 (orden público por published_at DESC).
 *  - format no viene en el array → default 'Digital' de la tabla.
 *
 * Fechas: si `published_at` viene seteada, se usa tal cual. Si es null:
 *   a) cheerio (article:published_time / JSON-LD datePublished),
 *   b) si el fetch da algo válido, se usa,
 *   c) si falla, se usa `fallback_date`.
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
  published_at: string | null
  url: string
  fallback_date?: string
  title?: string
}

const CLIPPINGS: SeedEntry[] = [
  // ═══════════════════ QUIENVINO ═══════════════════

  // — Marzo 2026: apariciones sueltas —
  { clientSlug: "quienvino", medium: "Canal 9", scope: "Local", published_at: "2026-03-04", url: "https://www.youtube.com/watch?si=zU8g1FYEH0hDr9K-&v=nqgQXwqJA4w&feature=youtu.be" },
  { clientSlug: "quienvino", medium: "Radio Aconcagua", scope: "Local", published_at: "2026-03-06", url: "https://x.com/i/status/2029939625884581960" },
  { clientSlug: "quienvino", medium: "Radio Aconcagua", scope: "Local", published_at: "2026-03-06", url: "https://open.spotify.com/episode/7G4fiCgdch3G8xfxbDzn7I" },

  // — Marzo 2026: Premio FEM (fecha aproximada, cheerio la refina) —
  { clientSlug: "quienvino", medium: "El Sol", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.elsol.com.ar/mendoza/patricia-soria-creadora-de-quienvino-fue-distinguida-por-la-federacion-economica-de-mendoza/" },
  { clientSlug: "quienvino", medium: "MDZ Online", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.mdzol.com/dinero/quien-es-la-mendocina-elegida-como-la-mujer-empresaria-innovacion-y-redes-del-ano-n1479861" },
  { clientSlug: "quienvino", medium: "Diario Uno", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.diariouno.com.ar/sociedad/una-experta-tecnologia-fue-premiada-la-fem-como-mujer-empresaria-innovacion-y-redes-2026-n1538485" },
  { clientSlug: "quienvino", medium: "Los Andes", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.losandes.com.ar/economia/quienes-son-las-tres-mendocinas-premiadas-la-fem-innovacion-inspiracion-y-trayectoria-n5984782" },
  { clientSlug: "quienvino", medium: "Info Negocios", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://infomendoza.info/y-ademas/patricia-soria-creadora-de-quienvino-es-distinguida-como-la-mujer-empresaria-en-innovacion-y-redes-del-ano-2026-por-la-fem" },
  { clientSlug: "quienvino", medium: "Ciudadano News", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://ciudadano.news/sociedad/exito-quienvino-plataforma-gestion-personal-latinoamerica-n116713" },
  { clientSlug: "quienvino", medium: "Punto a Punto", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://mendoza.puntoapunto.com.ar/patricia-soria-creadora-de-quienvino-fue-distinguida-como-la-mujer-empresaria-en-innovacion-y-redes-del-ano-2026-por-la-fem/" },
  { clientSlug: "quienvino", medium: "Entorno Económico", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://entornoeconomico.com/la_columna/26929-El-ecosistema-ejecutivo-de-Mendoza-destaca-la-premiacion-de-Patricia-Soria-y-su-startup-QuienVino" },
  { clientSlug: "quienvino", medium: "Los Andes", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.losandes.com.ar/tecno/mujeres-empresas-y-tecnologia-patricia-soria-fue-distinguida-la-fem-como-empresaria-2026-n5985382" },

  // — Abril 2026: IA para ahorrar tiempo administrativo —
  { clientSlug: "quienvino", medium: "Los Andes", scope: "Local", published_at: "2026-04-24", url: "https://www.losandes.com.ar/sociedad/como-ahorrar-85-del-tiempo-administrativo-usando-inteligencia-artificial-organizar-equipos-trabajo-n5988862" },
  { clientSlug: "quienvino", medium: "Info Negocios", scope: "Local", published_at: "2026-04-24", url: "https://infomendoza.info/amp/default/como-ahorrar-un-85-del-tiempo-administrativo-usando-ia-para-organizar-equipos-de-trabajo" },
  { clientSlug: "quienvino", medium: "Sitio Andino", scope: "Local", published_at: "2026-04-29", url: "https://www.sitioandino.com.ar/economia/la-inteligencia-artificial-redefine-las-logicas-del-trabajo-el-caso-una-app-mendocina-n5721995" },

  // — Mayo 2026: Sitevinitech (QuienVino) —
  { clientSlug: "quienvino", medium: "Ciudadano News", scope: "Local", published_at: "2026-05-13", url: "https://ciudadano.news/sociedad/rrhh-tecnologia-pymes-automatizacion-n118218" },
  { clientSlug: "quienvino", medium: "617 News", scope: "Local", published_at: "2026-05-15", url: "https://617.news/quienvino-enseno-como-digitalizar-el-capital-humano-del-agro-y-el-vino/" },
  { clientSlug: "quienvino", medium: "Info Negocios", scope: "Local", published_at: "2026-05-15", url: "https://infomendoza.info/y-ademas/quienvino-enseno-como-digitalizar-el-capital-humano-del-agro-y-el-vino" },
  { clientSlug: "quienvino", medium: "Mendovoz", scope: "Local", published_at: "2026-05-15", url: "https://www.mendovoz.com/actualidad/panorama-vitivinicola/2026/5/15/sitevinitech-2026-quienvino-enseno-como-digitalizar-el-capital-humano-del-agro-el-vino-171976.html" },

  // — Mayo 2026: menciones Directorio Polo TIC —
  { clientSlug: "quienvino", medium: "Ecocuyo", scope: "Local", published_at: null, fallback_date: "2026-05-04", url: "https://ecocuyo.com/nota/150079/el-polo-tic-mendoza-renovo-directorio-y-apuesta-por-consolidar-la-economia-del-conocimiento/" },
  { clientSlug: "quienvino", medium: "Los Andes", scope: "Local", published_at: null, fallback_date: "2026-05-04", url: "https://www.losandes.com.ar/economia/el-polo-tic-mendoza-renovo-sus-autoridades-n5989349" },
  { clientSlug: "quienvino", medium: "Portal TIC", scope: "Local", published_at: null, fallback_date: "2026-05-04", url: "https://portaltic.com.ar/el-polo-tic-mendoza-renovo-sus-autoridades-y-proyecta-una-nueva-etapa-para-fortalecer-la-economia-del-conocimiento/" },
  { clientSlug: "quienvino", medium: "Constructiva Online", scope: "Local", published_at: null, fallback_date: "2026-05-04", url: "https://constructivaonline.com.ar/nota/1646/el-polo-tic-mendoza-renueva-autoridades-y-se-concentra-en-sumar-calidad-al-ecosistema-tecnologico/" },

  // — Junio 2026: Webinar IA + Fútbol + Liderazgo —
  { clientSlug: "quienvino", medium: "Entorno Económico", scope: "Local", published_at: "2026-06-19", url: "https://entornoeconomico.com/negocios_empresas/30962-%C2%BFTu-equipo-juega-para-ganar?-IA-futbol-y-las-claves-del-liderazgo-empresarial-mendocino-para-lo-que-resta-de-2026" },
  { clientSlug: "quienvino", medium: "Mendoza 24", scope: "Local", published_at: "2026-06-19", url: "https://mendoza24.com.ar/negocios_empresas/30962-%C2%BFTu-equipo-juega-para-ganar?-IA-futbol-y-las-claves-del-liderazgo-empresarial-mendocino-para-lo-que-resta-de-2026" },
  { clientSlug: "quienvino", medium: "Los Andes", scope: "Local", published_at: "2026-06-20", url: "https://www.losandes.com.ar/sociedad/modo-mundial-como-aplicar-la-inteligencia-artificial-y-las-lecciones-del-futbol-al-liderazgo-una-empresa-n5995457" },
  { clientSlug: "quienvino", medium: "Ecocuyo", scope: "Local", published_at: "2026-06-22", url: "https://ecocuyo.com/nota/150247/tu-equipo-juega-para-ganar-webinar-para-empresas-mendocinas-sobre-ia-futbol-y-liderazgo/" },
  { clientSlug: "quienvino", medium: "Info Negocios", scope: "Local", published_at: "2026-06-22", url: "https://infomendoza.info/y-ademas/tu-equipo-juega-para-ganar-ia-futbol-y-las-claves-del-liderazgo-empresarial-mendocino-para-lo-que-resta-de-2026" },
  { clientSlug: "quienvino", medium: "NDI", scope: "Local", published_at: "2026-06-22", url: "https://diariondi.com/mentalidad-y-liderazgo-en-equipos-el-evento-que-apunta-a-empresas/" },

  // ═══════════════════ AGROCOSECHA ═══════════════════

  // — Marzo 2026: tendencias agro 2026 —
  { clientSlug: "agrocosecha", medium: "Sitio Andino", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.sitioandino.com.ar/economia/como-sera-el-agro-2026-automatizacion-datos-y-el-desafio-del-cambio-climatico-n5714659" },
  { clientSlug: "agrocosecha", medium: "Radio Aconcagua", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://open.spotify.com/episode/14bQ9T7FaWBVax4M89mRXG" },
  { clientSlug: "agrocosecha", medium: "Los Andes", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.losandes.com.ar/agroindustria/agro-mendoza-tendencias-y-tecnologia-que-marcaran-el-modelo-productivo-2026-n5981938" },
  { clientSlug: "agrocosecha", medium: "MDZ Online", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.mdzol.com/dinero/como-impactaran-mendoza-las-5-tendencias-globales-que-marcaran-el-agro-2026-n1418903" },
  { clientSlug: "agrocosecha", medium: "Ciudadano News", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.youtube.com/watch?v=FD4qrV9Qk18" },
  { clientSlug: "agrocosecha", medium: "El Descorche", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://eldescorchediario.com/lucas-gilbert-la-unica-forma-de-bajar-costos-es-adoptando-tecnologia/" },
  { clientSlug: "agrocosecha", medium: "Diario Uno", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.diariouno.com.ar/economia/el-agro-2026-exige-tecnologia-y-pone-mendoza-un-cambio-historico-n1540901" },
  { clientSlug: "agrocosecha", medium: "Info Negocios", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://infomendoza.info/enfoque/las-cinco-tendencias-globales-que-marcaran-el-agro-en-2026-y-su-impacto-en-mendoza" },
  { clientSlug: "agrocosecha", medium: "Sitio Andino", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://www.sitioandino.com.ar/economia/el-agro-mendoza-avanza-un-nuevo-modelo-basado-tecnologia-eficiencia-y-sustentabilidad-n5718216" },
  { clientSlug: "agrocosecha", medium: "Diario San Rafael", scope: "Local", published_at: null, fallback_date: "2026-03-15", url: "https://diariosanrafael.com.ar/el-agro-del-futuro-automatizacion-e-inteligencia-artificial-como-motores-de-la-eficiencia-en-2026/" },

  // — Abril 2026: cosechadora de olivo —
  { clientSlug: "agrocosecha", medium: "Mendoza Económico", scope: "Local", published_at: null, fallback_date: "2026-04-15", url: "https://mendozaeconomico.com.ar/nota/2387/revolucion-en-la-olivicultura-nueva-cosechadora-multiplica-la-productividad-y-reduce-la-dependencia-de-mano-de-obra/" },
  { clientSlug: "agrocosecha", medium: "Mendoza 24", scope: "Local", published_at: null, fallback_date: "2026-04-15", url: "https://mendoza24.com.ar/tecnologia/27821-La-revolucion-del-olivo-la-cosechadora-arrastrada-que-multiplica-la-productividad-con-minima-mano-de-obra" },
  { clientSlug: "agrocosecha", medium: "Entorno Económico", scope: "Local", published_at: null, fallback_date: "2026-04-15", url: "https://entornoeconomico.com.ar/tecnologia/27821-La-revolucion-del-olivo-la-cosechadora-arrastrada-que-multiplica-la-productividad-con-minima-mano-de-obra" },
  { clientSlug: "agrocosecha", medium: "Info Negocios", scope: "Local", published_at: null, fallback_date: "2026-04-15", url: "https://infomendoza.info/plus/la-revolucion-del-olivo-la-cosechadora-arrastrada-que-multiplica-la-productividad-con-minima-mano-de-obra" },
  { clientSlug: "agrocosecha", medium: "Protagonistas del Campo", scope: "Local", published_at: null, fallback_date: "2026-04-15", url: "https://www.youtube.com/watch?si=2Vzi0Z2a8ie6xMph&v=xCIFfU5Oni8&feature=youtu.be" },

  // — Mayo 2026: Sitevinitech previo —
  { clientSlug: "agrocosecha", medium: "El Descorche", scope: "Local", published_at: null, fallback_date: "2026-05-05", url: "https://eldescorchediario.com/sitevinitech-2026-innovacion-robotica-y-nuevas-tendencias-marcaran-el-pulso-de-la-vitivinicultura/" },
  { clientSlug: "agrocosecha", medium: "Enolife", scope: "Local", published_at: null, fallback_date: "2026-05-05", url: "https://enolife.com.ar/es/sitevinitech-2026-innovacion-robotica-y-nuevas-tendencias-que-marcaran-el-pulso-de-la-vitivinicultura/" },
  { clientSlug: "agrocosecha", medium: "Info Campo", scope: "Nacional", published_at: null, fallback_date: "2026-05-05", url: "https://www.infocampo.com.ar/la-robotica-y-la-biotecnologia-se-abren-paso-en-el-vino-todo-lo-que-se-vera-en-sitevinitech-2026/" },
  { clientSlug: "agrocosecha", medium: "Mendoza Económico", scope: "Local", published_at: null, fallback_date: "2026-05-05", url: "https://mendozaeconomico.com.ar/nota/2438/sitevinitech-2026-mendoza-se-prepara-para-la-gran-feria-de-innovacion-vitivinicola/" },
  { clientSlug: "agrocosecha", medium: "Diario Uno", scope: "Local", published_at: null, fallback_date: "2026-05-05", url: "https://www.diariouno.com.ar/empresas/sitevinitech-2026-innovacion-robotica-y-nuevas-tendencias-marcaran-el-pulso-la-vitivinicultura-n1553862" },
  { clientSlug: "agrocosecha", medium: "Mendovoz", scope: "Local", published_at: "2026-05-08", url: "https://www.mendovoz.com/actualidad/panorama-vitivinicola/2026/5/8/cuenta-regresiva-para-la-gran-feria-de-la-industria-vitivinicola-170724.html" },

  // — Mayo 2026: Sitevinitech durante —
  { clientSlug: "agrocosecha", medium: "Info Negocios", scope: "Local", published_at: null, fallback_date: "2026-05-14", url: "https://infomendoza.info/enfoque/llega-sitevinitech-2026-innovacion-robotica-y-nuevas-tendencias-marcaran-el-pulso-de-la-vitivinicultura" },
  { clientSlug: "agrocosecha", medium: "Los Andes", scope: "Local", published_at: null, fallback_date: "2026-05-14", url: "https://www.losandes.com.ar/economia/innovacion-vitivinicola-que-novedades-presentara-sitevinitech-mendoza-n5990693" },
  { clientSlug: "agrocosecha", medium: "Sitio Andino", scope: "Local", published_at: null, fallback_date: "2026-05-14", url: "https://www.sitioandino.com.ar/economia/robots-membranas-y-espumantes-el-nuevo-mapa-la-industria-del-vino-n5722616" },
  { clientSlug: "agrocosecha", medium: "MDZ Online", scope: "Local", published_at: null, fallback_date: "2026-05-14", url: "https://www.mdzol.com/dinero/innovacion-robotica-y-vinos-alcohol-las-claves-la-feria-mas-grande-sudamerica-n1517892" },
  { clientSlug: "agrocosecha", medium: "Prensa Gobierno de Mendoza", scope: "Local", published_at: null, fallback_date: "2026-05-14", url: "https://prensa.mendoza.gob.ar/mendoza-vuelve-a-ser-epicentro-de-la-innovacion-vitivinicola-con-una-nueva-edicion-de-sitevinitech/" },
  { clientSlug: "agrocosecha", medium: "Info Negocios", scope: "Local", published_at: null, fallback_date: "2026-05-15", url: "https://infomendoza.info/plus/las-grandes-tendencias-de-sitevinitech-2026-automatizacion-sustentabilidad-y-tecnologia-inteligente" },
  { clientSlug: "agrocosecha", medium: "Los Andes", scope: "Local", published_at: null, fallback_date: "2026-05-15", url: "https://www.losandes.com.ar/economia/sitevinitech-apuesta-la-tecnologia-aplicada-al-vino-un-contexto-adverso-n5990892" },
  { clientSlug: "agrocosecha", medium: "Mendoza Económico", scope: "Local", published_at: null, fallback_date: "2026-05-15", url: "https://mendozaeconomico.com.ar/nota/2464/agrocosecha-mostro-en-sitevinitech-el-avance-de-la-inteligencia-artificial-aplicada-al-agro/" },
  { clientSlug: "agrocosecha", medium: "Radio Aconcagua", scope: "Local", published_at: null, fallback_date: "2026-05-15", url: "https://open.spotify.com/episode/1nNySUtycpBZJ7E0TSUB0c" },

  // — Junio 2026: tecnología contra heladas —
  { clientSlug: "agrocosecha", medium: "Punto Vid", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://puntovid.com.ar/como-proteger-de-heladas-a-los-cultivos-con-sistemas-dinamicos-digitales-y-sin-estructuras-permanentes/" },
  { clientSlug: "agrocosecha", medium: "Enolife", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://enolife.com.ar/es/torres-de-aire-caliente-riego-por-aspersion-y-mantas-termicas-tres-defensas-contra-las-heladas/" },
  { clientSlug: "agrocosecha", medium: "Info Negocios", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://infomendoza.info/enfoque/epoca-de-heladas-en-mendoza-como-la-tecnologia-aplicada-busca-frenar-perdidas-millonarias" },
  { clientSlug: "agrocosecha", medium: "Cuyo Noticias", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://cuyonoticias.com/contenido/22154/tecnologia-contra-las-heladas-para-salvar-cosechas" },
  { clientSlug: "agrocosecha", medium: "Entorno Económico", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://entornoeconomico.com.ar/negocios_empresas/30368-epoca-de-heladas-en-Mendoza-Como-la-tecnologia-aplicada-busca-frenar-perdidas-millonarias-en-fincas-durante-una-sola-noche" },
  { clientSlug: "agrocosecha", medium: "Más Negocios", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://massnegocios.com/heladas-en-mendoza-como-la-tecnologia-busca-frenar-perdidas-millonarias-en-fincas-durante-una-sola-noche/" },
  { clientSlug: "agrocosecha", medium: "Constructiva Online", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://constructivaonline.com.ar/nota/1731/epoca-de-heladas-en-mendoza-como-la-tecnologia-aplicada-busca-evitar-perdidas-millonarias/" },
  { clientSlug: "agrocosecha", medium: "Mendoza Económico", scope: "Local", published_at: null, fallback_date: "2026-06-15", url: "https://mendozaeconomico.com.ar/nota/2544/tecnologia-e-innovacion-para-enfrentar-el-desafio-de-las-heladas-en-mendoza/" },
]

/**
 * Título de respaldo derivado del slug de la URL (cuando el fetch falla), para
 * no romper el NOT NULL de `title`. Devuelve null si el segmento parece un id
 * (una sola "palabra": ids de YouTube, X, Spotify) → entonces se cae al medio.
 */
function titleFromUrl(raw: string): string | null {
  try {
    const p = new URL(raw).pathname.replace(/\/+$/, "")
    let seg = p.split("/").filter(Boolean).pop() ?? ""
    seg = seg.replace(/\.(html?|php|aspx?)$/i, "")
    seg = seg.replace(/[-_]n?\d{4,}$/i, "") // id final tipo -n1510599 / _20260520
    seg = seg.replace(/^\d+[-_]/, "") // id inicial tipo 27821-La-revolucion
    seg = decodeURIComponent(seg)
    seg = seg.replace(/[-_]+/g, " ").trim()
    if (seg.length < 8 || !seg.includes(" ")) return null // token único = id
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  } catch {
    return null
  }
}

const IMAGE_COLUMN = "image_url" // verificado: la columna existe en la tabla.

async function seed() {
  console.log("🌱 BATCH 2 — clippings QuienVino + Agrocosecha\n")

  // ── 1. Mapa de clientes por slug ──
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id, slug")
  if (clientsError) {
    console.error("✗ No se pudo leer `clients`:", clientsError.message)
    process.exit(1)
  }
  const idBySlug = new Map(clients!.map((c) => [c.slug as string, c.id as string]))

  // ── 2. Verificación de schema: ¿existe image_url? ──
  const probe = await admin.from("clippings").select(IMAGE_COLUMN).limit(1)
  const hasImageColumn = !probe.error
  console.log(
    hasImageColumn
      ? `📷 Camino: columna ${IMAGE_COLUMN} EXISTE → se extrae og:image y se persiste.`
      : `📷 Camino: sin columna de imagen → no se persiste foto (se resuelve en render).`,
  )

  // ── 3. URLs ya existentes (dedup global por url) ──
  const { data: existing, error: existingError } = await admin
    .from("clippings")
    .select("url")
  if (existingError) {
    console.error("✗ No se pudo leer `clippings`:", existingError.message)
    process.exit(1)
  }
  const existingUrls = new Set((existing ?? []).map((r) => r.url as string))

  // ── 4. Procesar ──
  let inserted = 0
  let dedup = 0
  let errors = 0
  let withImage = 0

  for (const entry of CLIPPINGS) {
    const clientId = idBySlug.get(entry.clientSlug)
    if (!clientId) {
      console.warn(`⚠ slug inexistente en clients: "${entry.clientSlug}" — salteada (${entry.url})`)
      errors++
      continue
    }

    if (existingUrls.has(entry.url)) {
      console.log(`↷ ya existía: ${entry.url}`)
      dedup++
      continue
    }

    // Enrichment: el array no trae title → siempre se busca. También sirve para
    // completar fecha (si es null) e imagen.
    const meta = await fetchUrlMetadata(entry.url)
    const title = meta.title?.trim() || titleFromUrl(entry.url) || entry.medium
    const medium = entry.medium || meta.medium?.trim() || entry.medium
    const published = entry.published_at ?? meta.published_at ?? entry.fallback_date ?? null

    if (!published) {
      console.error(`✗ sin fecha resoluble (ni provista, ni fetch, ni fallback): ${entry.url}`)
      errors++
      continue
    }

    const row: Record<string, unknown> = {
      client_id: clientId,
      medium,
      title,
      published_at: published,
      scope: SCOPE_MAP[entry.scope] ?? "local",
      // format omitido → default 'Digital'.
      url: entry.url,
      order_position: 0,
      created_by: "seed-julio-2026-batch2",
      updated_by: "seed-julio-2026-batch2",
    }
    if (hasImageColumn) {
      row[IMAGE_COLUMN] = meta.image ?? null
      if (meta.image) withImage++
    }

    const { error: insertError } = await admin.from("clippings").insert(row)
    if (insertError) {
      console.error(`✗ error al insertar ${entry.url}: ${insertError.message}`)
      errors++
      continue
    }
    existingUrls.add(entry.url)
    inserted++
    const img = hasImageColumn ? (meta.image ? " 🖼" : " —") : ""
    console.log(`✓ [${entry.clientSlug}] ${published}${img} ${title.slice(0, 55)}`)
  }

  // ── 5. Resumen ──
  console.log("\n────────── RESUMEN BATCH 2 ──────────")
  console.log(`total      : ${CLIPPINGS.length}`)
  console.log(`ya existían: ${dedup}`)
  console.log(`insertadas : ${inserted}`)
  console.log(`errores    : ${errors}`)
  console.log(`camino foto: ${hasImageColumn ? `CON columna image_url (${withImage} con og:image)` : "SIN columna"}`)
  console.log("─────────────────────────────────────")
}

seed().catch((e) => {
  console.error("THROW inesperado:", e)
  process.exit(1)
})
