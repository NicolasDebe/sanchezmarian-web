/**
 * Utilidades compartidas de texto enriquecido.
 * Las usan: <RichText /> (render público), el editor del admin y los scripts
 * de migración. Módulo puro (sin imports de servidor ni de React).
 */

/** ¿El string contiene tags HTML? */
export function hasHtmlTags(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value)
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Texto plano → HTML: doble salto de línea = nuevo <p>, salto simple = <br />.
 * Escapa caracteres especiales. Vacío → "".
 */
export function plainToHtml(text: string): string {
  const trimmed = (text ?? "").trim()
  if (!trimmed) return ""
  return trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("\n")
}

/** HTML → texto plano (para contadores de caracteres y vistas breves). */
export function htmlToPlainText(html: string): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Sanitización por allowlist. El contenido viene solo del admin autenticado
 * (Tiptap ya limita el esquema al editar), esto es defensa en profundidad sin
 * sumar dependencias pesadas (DOMPurify isomórfico arrastra jsdom al server).
 *
 * Incluye los tags/atributos del contenido legacy de campañas
 * (p.lead, blockquote.dark, footer, a con style) para no romper el diseño.
 */
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "footer", "span",
])
const ALLOWED_ATTRS = new Set(["href", "target", "rel", "class", "style"])

export function sanitizeHtml(html: string): string {
  let out = (html ?? "")
    // comentarios y doctypes
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<![^>]*>/g, "")
    // bloques peligrosos enteros (tag + contenido)
    .replace(/<(script|style|iframe|object|embed|form|svg|math|title)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|svg|math|title)\b[^>]*\/?>/gi, "")

  out = out.replace(
    /<\/?([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)\/?>/g,
    (match, tag: string, attrs: string) => {
      const t = tag.toLowerCase()
      if (!ALLOWED_TAGS.has(t)) return ""
      if (match.startsWith("</")) return `</${t}>`
      if (t === "br") return "<br />"

      let safeAttrs = ""
      const attrRe = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
      let m: RegExpExecArray | null
      while ((m = attrRe.exec(attrs))) {
        const name = m[1].toLowerCase()
        const value = m[2] ?? m[3] ?? ""
        if (!ALLOWED_ATTRS.has(name)) continue
        if (name === "href" && /^\s*(javascript|data|vbscript):/i.test(value)) continue
        if (name === "style" && /expression|javascript|@import|url\s*\(/i.test(value)) continue
        safeAttrs += ` ${name}="${value.replace(/"/g, "&quot;")}"`
      }
      return `<${t}${safeAttrs}>`
    },
  )
  return out
}
