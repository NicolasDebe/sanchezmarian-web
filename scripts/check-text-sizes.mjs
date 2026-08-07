/**
 * Verificador de los controles "Apariencia del texto" (tamaño + fuente por campo).
 *
 * El control solo FUNCIONA si se cumplen las dos mitades del contrato:
 *   1. el esquema de la página marca el campo con `resizable: true`
 *      → el admin dibuja el slider y guarda en text_sizes / field_fonts
 *   2. el JSX público emite `data-fkey="section.field"` (vía fsStyle/fsProps/RichText)
 *      → el sitio (y el preview en vivo) aplican el tamaño
 *
 * Si falta la mitad 2, Marian mueve el control, guarda… y no pasa nada: ese es
 * exactamente el "error" que este script existe para prevenir. Si falta la 1,
 * hay un data-fkey huérfano en el DOM (inofensivo, pero es código muerto).
 *
 * Uso:  node scripts/check-text-sizes.mjs
 * Sale con código 1 si hay campos resizables sin cablear.
 */

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..")

/** page (slug de content_blocks) → archivo de esquema. */
const SCHEMAS = {
  home: "lib/home-schema.ts",
  servicios: "lib/servicios-schema.ts",
  mis_valores: "lib/mis-valores-schema.ts",
  casos_de_exito: "lib/casos-schema.ts",
  contacto: "lib/contacto-schema.ts",
  global: "lib/global-schema.ts",
}

/** Import de esquema dentro de un componente → página a la que pertenecen sus fkeys. */
const SCHEMA_IMPORT_TO_PAGE = {
  "@/lib/home-schema": "home",
  "@/lib/servicios-schema": "servicios",
  "@/lib/mis-valores-schema": "mis_valores",
  "@/lib/casos-schema": "casos_de_exito",
  "@/lib/contacto-schema": "contacto",
  "@/lib/global-schema": "global",
}

const SOURCE_DIRS = ["components", "app"]

// ─── 1. Campos resizables declarados en los esquemas ─────────────────────────

/**
 * Extrae los campos `resizable: true` de un archivo de esquema.
 *
 * Los esquemas son arrays de objetos literales bien formateados; recorremos el
 * texto siguiendo el balance de llaves para saber qué `field:` cae dentro de qué
 * `section:`, sin necesidad de ejecutar TypeScript.
 */
function resizableFieldsOf(schemaPath) {
  const src = readFileSync(join(ROOT, schemaPath), "utf8")
  const found = []
  let section = null
  // Objetos de sección: profundidad de llaves en la que apareció `section:`.
  let sectionDepth = -1
  let depth = 0
  // Buffer del objeto de campo en curso (para ver si trae `resizable: true`).
  let fieldStart = -1
  let fieldDepth = -1

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === "{") {
      depth++
      // ¿Este objeto abre un campo? Lo sabremos al toparnos con `field:`.
      continue
    }
    if (ch === "}") {
      if (fieldDepth === depth) {
        const body = src.slice(fieldStart, i)
        const name = body.match(/\bfield:\s*"([^"]+)"/)
        if (name && /\bresizable:\s*true\b/.test(body)) {
          found.push({ section, field: name[1] })
        }
        fieldStart = -1
        fieldDepth = -1
      }
      if (sectionDepth === depth) {
        section = null
        sectionDepth = -1
      }
      depth--
      continue
    }
    // Detectamos las claves al vuelo, en el punto del texto donde aparecen.
    if (ch === "s" && src.startsWith("section:", i) && sectionDepth === -1) {
      const m = src.slice(i).match(/^section:\s*"([^"]+)"/)
      if (m) {
        section = m[1]
        sectionDepth = depth
      }
      continue
    }
    if (ch === "f" && src.startsWith("field:", i) && fieldDepth === -1) {
      // El objeto del campo empieza en la llave que lo contiene (depth actual).
      fieldStart = src.lastIndexOf("{", i)
      fieldDepth = depth
      continue
    }
  }
  return found
}

// ─── 2. fkeys emitidos por el JSX ────────────────────────────────────────────

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (full.endsWith(".tsx")) out.push(full)
  }
  return out
}

/**
 * fkeys de un archivo, como patrones. Un fkey puede ser literal ("hero.h1") o
 * un template con interpolación (`pilares.pilar_${n}_desc`): en ese caso lo
 * convertimos a regex con comodín, porque en runtime cubre varios campos.
 */
function fkeyPatternsOf(file) {
  const src = readFileSync(file, "utf8")
  const patterns = []

  // Literales "sec.field" (los que fsStyle/fsProps/RichText reciben como fkey).
  for (const m of src.matchAll(/"([a-z][a-z0-9_]*\.[a-z][a-z0-9_]*)"/gi)) {
    patterns.push(new RegExp(`^${escapeRe(m[1])}$`))
  }
  // Templates: `sec.pilar_${n}_desc`, `${section}.title`, …
  for (const m of src.matchAll(/`([^`]*\$\{[^`]*)`/g)) {
    const raw = m[1]
    if (!raw.includes(".")) continue
    const re = raw
      .split(/\$\{[^}]*\}/)
      .map(escapeRe)
      .join("[a-z0-9_]+")
    if (/^[a-z0-9_.\[\]()+*^$\\-]*$/i.test(re)) patterns.push(new RegExp(`^${re}$`))
  }
  // fsProps(scales, "seccion", "campo") → el par forma la clave.
  for (const m of src.matchAll(/fsProps\(\s*[^,]+,\s*"([^"]+)"\s*,\s*"([^"]+)"/g)) {
    patterns.push(new RegExp(`^${escapeRe(`${m[1]}.${m[2]}`)}$`))
  }
  return patterns
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function pageOf(file) {
  const src = readFileSync(file, "utf8")
  for (const [imp, page] of Object.entries(SCHEMA_IMPORT_TO_PAGE)) {
    if (src.includes(`"${imp}"`)) return page
  }
  return null
}

// ─── 3. Cruce ────────────────────────────────────────────────────────────────

const wiredByPage = {}
for (const dir of SOURCE_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const page = pageOf(file)
    if (!page) continue
    const patterns = fkeyPatternsOf(file)
    if (patterns.length === 0) continue
    ;(wiredByPage[page] ??= []).push(...patterns)
  }
}

let missing = 0
const lines = []

for (const [page, schemaPath] of Object.entries(SCHEMAS)) {
  const fields = resizableFieldsOf(schemaPath)
  if (fields.length === 0) {
    lines.push(`  ${page.padEnd(15)} —  sin campos resizables`)
    continue
  }
  const patterns = wiredByPage[page] ?? []
  const gaps = fields.filter(
    ({ section, field }) => !patterns.some((re) => re.test(`${section}.${field}`)),
  )
  missing += gaps.length
  const mark = gaps.length === 0 ? "OK " : "!! "
  lines.push(
    `  ${mark}${page.padEnd(15)} ${String(fields.length).padStart(3)} resizables · ${gaps.length} sin cablear`,
  )
  for (const g of gaps) lines.push(`        falta data-fkey="${g.section}.${g.field}"`)
}

console.log("\nControles de tamaño/fuente por campo — esquema ↔ JSX\n")
console.log(lines.join("\n"))

if (missing > 0) {
  console.log(
    `\n${missing} campo(s) muestran el control en /admin pero NO lo aplican en el sitio.\n`,
  )
  process.exit(1)
}
console.log("\nTodos los campos resizables están cableados en el sitio.\n")
