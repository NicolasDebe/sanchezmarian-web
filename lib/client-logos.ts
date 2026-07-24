/**
 * Catálogo de clientes y sus logos para las campañas.
 *
 * El logo de una campaña NO se guarda en la base: se deriva del cliente al que
 * pertenece (su "marca"). Así, las campañas existentes muestran el logo del
 * cliente al instante y las nuevas lo eligen desde un desplegable en /admin.
 *
 * Los archivos viven en /public/images/logos/ (los mismos que usan
 * components/clientes.tsx y el CLIENT_SEED de lib/clippings.ts). Módulo puro,
 * sin imports, para poder usarlo también en componentes cliente.
 */

export interface ClientLogo {
  /** Nombre que se muestra como marca de la campaña y como opción en /admin. */
  name: string
  /** Ruta pública del logo dentro de /public/images/logos/. */
  logo: string
  /** Variantes del nombre para emparejar campañas ya cargadas (case-insensitive). */
  aliases?: string[]
}

export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "Grupo Presidente",              logo: "/images/logos/logo-presidente.png",        aliases: ["presidente"] },
  { name: "Bolsa de Comercio de Mendoza",  logo: "/images/logos/logo-bolsa-comercio.png",    aliases: ["bolsa de comercio", "bcm"] },
  { name: "Colegio Notarial de Mendoza",   logo: "/images/logos/logo-colegio-notarial.png",  aliases: ["colegio notarial", "cnm"] },
  { name: "Capilla Carlo Acutis",          logo: "/images/logos/logo-capilla-acutis.png",     aliases: ["capilla acutis", "carlo acutis"] },
  { name: "Dra. Elina Meneo",              logo: "/images/logos/logo-meneo.png",              aliases: ["elina meneo", "meneo", "dra maria elina meneo", "maria elina meneo"] },
  { name: "Escuela de Vendimia Chakaymanta", logo: "/images/logos/logo-chakaymanta.png",      aliases: ["esc vendimia chakaymanta", "escuela de vendimia chakaymanta", "chakaymanta"] },
  { name: "QuienVino",                     logo: "/images/logos/logo-quienvino.png",          aliases: ["quienvino app"] },
  { name: "Agrocosecha",                   logo: "/images/logos/logo-agrocosecha.png" },
  { name: "Fuerza Silenciosa",             logo: "/images/logos/logo-fuerza-silenciosa.jpg" },
  { name: "Mendoza Regenera",              logo: "/images/logos/logo-mendoza-regenera.png",   aliases: ["cluster mendoza regenera"] },
  { name: "Flor Mouradian",                logo: "/images/logos/logo-mfmc.png",               aliases: ["florencia mouradian", "maria florencia mouradian", "mfmc"] },
]

/** minúsculas, sin acentos, espacios y puntuación colapsados. */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** Cliente del catálogo que corresponde a una marca, o null si no hay match. */
export function findClient(brand: string | null | undefined): ClientLogo | null {
  if (!brand) return null
  const b = normalize(brand)
  if (!b) return null
  for (const c of CLIENT_LOGOS) {
    if (normalize(c.name) === b) return c
    if (c.aliases?.some((a) => normalize(a) === b)) return c
  }
  return null
}

/** Logo del cliente al que pertenece una marca, o null si no se reconoce. */
export function findClientLogo(brand: string | null | undefined): string | null {
  return findClient(brand)?.logo ?? null
}
