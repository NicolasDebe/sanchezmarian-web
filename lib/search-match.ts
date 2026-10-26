/**
 * Matching y ranking del buscador global. Módulo PURO (sin imports de servidor
 * ni de React): corre en el browser sobre el índice que baja de /api/buscar.
 *
 * Decisiones:
 *  - Sin librería. El índice entero son unos cientos de documentos: un filtro
 *    a mano es más rápido que cargar fuse.js y mucho más predecible que el
 *    fuzzy matching, que con nombres propios ("Meneo", "Mouradian") devuelve
 *    cualquier cosa.
 *  - Insensible a acentos y mayúsculas de los dos lados de la comparación:
 *    "vendimia" encuentra "Vendimia" y "cordoba" encuentra "Córdoba".
 *  - AND entre palabras, prefijo por palabra: "colegio notarial" y "notarial
 *    colegio" encuentran lo mismo, y "mend" encuentra "Mendoza".
 */

import type { SearchDoc, SearchKind } from "@/lib/search"

/** minúsculas, sin acentos, puntuación colapsada a espacios. */
export function normalizeSearchText(text: string): string {
  return (text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** Mínimo de caracteres para empezar a buscar (con 1 letra matchea todo). */
export const MIN_QUERY_LENGTH = 2

/** Tope de resultados por grupo, para que el panel no sea una lista infinita. */
export const MAX_PER_KIND = 8

/** Peso de cada campo en el score. El título manda. */
const WEIGHTS = { title: 10, subtitle: 6, body: 2 } as const

/** Desempate entre tipos: primero lo que la gente busca más. */
const KIND_BONUS: Record<SearchKind, number> = {
  campana: 3,
  gacetilla: 2,
  pagina: 1,
  resena: 0,
}

export interface IndexedDoc {
  doc: SearchDoc
  title: string
  subtitle: string
  body: string
}

/**
 * Puntaje de un término dentro de un campo ya normalizado.
 * 0 = no aparece · prefijo de palabra = peso · palabra completa = peso doble.
 */
function fieldScore(haystack: string, term: string, weight: number): number {
  if (!haystack) return 0
  // Con espacios a los costados alcanza el includes para distinguir arranque
  // de palabra de palabra completa, sin armar un regex por término.
  const padded = " " + haystack + " "
  if (padded.includes(" " + term + " ")) return weight * 2
  if (padded.includes(" " + term)) return weight
  return 0
}

function docScore(entry: IndexedDoc, terms: string[]): number {
  let total = 0
  for (const term of terms) {
    const score =
      fieldScore(entry.title, term, WEIGHTS.title) +
      fieldScore(entry.subtitle, term, WEIGHTS.subtitle) +
      fieldScore(entry.body, term, WEIGHTS.body)
    // AND: si una palabra de la consulta no aparece en ningún campo, el
    // documento no es un resultado.
    if (score === 0) return 0
    total += score
  }
  return total + KIND_BONUS[entry.doc.kind]
}

/** Pre-normaliza el índice una sola vez, para no repetirlo en cada tecla. */
export function prepareIndex(docs: SearchDoc[]): IndexedDoc[] {
  return docs.map((doc) => ({
    doc,
    title: normalizeSearchText(doc.title),
    subtitle: normalizeSearchText(doc.subtitle),
    body: normalizeSearchText(doc.body),
  }))
}

export interface SearchGroup {
  kind: SearchKind
  docs: SearchDoc[]
}

/**
 * Resultados ordenados por score DESC y agrupados por tipo, respetando el
 * orden de `kindOrder`. Consulta corta o sin matches → [].
 */
export function searchIndex(
  index: IndexedDoc[],
  query: string,
  kindOrder: SearchKind[],
): SearchGroup[] {
  const normalized = normalizeSearchText(query)
  if (normalized.length < MIN_QUERY_LENGTH) return []
  const terms = normalized.split(" ").filter(Boolean)
  if (!terms.length) return []

  const scored: { doc: SearchDoc; score: number }[] = []
  for (const entry of index) {
    const score = docScore(entry, terms)
    if (score > 0) scored.push({ doc: entry.doc, score })
  }
  scored.sort((a, b) => b.score - a.score)

  return kindOrder
    .map((kind) => ({
      kind,
      docs: scored
        .filter((s) => s.doc.kind === kind)
        .slice(0, MAX_PER_KIND)
        .map((s) => s.doc),
    }))
    .filter((g) => g.docs.length > 0)
}

/** Cantidad total de resultados de un set de grupos. */
export function countResults(groups: SearchGroup[]): number {
  return groups.reduce((acc, g) => acc + g.docs.length, 0)
}

// ─── Resaltado ────────────────────────────────────────────────────────────────

export interface TextPart {
  text: string
  hit: boolean
}

/**
 * Parte un texto en tramos resaltados y no resaltados, comparando sobre la
 * versión normalizada pero devolviendo SIEMPRE los caracteres originales, con
 * acentos y mayúsculas intactos.
 *
 * El truco: normalizar el string completo cambia su largo (NFD descompone y la
 * puntuación se colapsa), así que acá se normaliza carácter por carácter
 * manteniendo un mapa de índices hacia el texto original.
 */
export function highlightParts(text: string, query: string): TextPart[] {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean)
  if (!text || !terms.length) return [{ text, hit: false }]

  // norm[i] corresponde a text[map[i]].
  let norm = ""
  const map: number[] = []
  for (let i = 0; i < text.length; i++) {
    const decomposed = text[i]
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
    // Un carácter puede normalizar a varios (ligaduras) o a ninguno: se
    // registra la posición original para cada carácter resultante.
    for (const nc of decomposed) {
      norm += /[a-z0-9]/.test(nc) ? nc : " "
      map.push(i)
    }
  }

  // Rangos [desde, hasta) sobre el texto ORIGINAL.
  const ranges: [number, number][] = []
  for (const term of terms) {
    let from = 0
    for (;;) {
      const at = norm.indexOf(term, from)
      if (at === -1) break
      // Solo arranques de palabra, igual que el matching.
      if (at === 0 || norm[at - 1] === " ") {
        const lastIdx = Math.min(at + term.length - 1, map.length - 1)
        ranges.push([map[at], map[lastIdx] + 1])
      }
      from = at + 1
    }
  }
  if (!ranges.length) return [{ text, hit: false }]

  // Une los rangos solapados y arma los tramos.
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([r[0], r[1]])
  }

  const parts: TextPart[] = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), hit: false })
    parts.push({ text: text.slice(start, end), hit: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false })
  return parts
}
