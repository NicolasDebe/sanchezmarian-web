import type { CSSProperties, ElementType } from "react"
import { hasHtmlTags, plainToHtml, sanitizeHtml } from "@/lib/rich-text"

interface RichTextProps {
  /** Contenido HTML (o texto plano legacy — se envuelve en <p> automáticamente) */
  html: string | null | undefined
  className?: string
  style?: CSSProperties
  /** Tag del wrapper (default: div) */
  as?: ElementType
}

/**
 * Render de contenido enriquecido editable desde el admin.
 *
 * - Texto plano legacy → se convierte a párrafos (doble salto = <p>,
 *   salto simple = <br/>), así las páginas se ven idénticas antes y después
 *   de la migración a HTML.
 * - HTML → se sanitiza por allowlist y se renderiza.
 * - Vacío → null (no genera <p></p> vacíos).
 *
 * Estilos: pasar `.rich-content` (artículos, p. ej. detalle de campañas) o
 * `.rich-inline` (textos embebidos en componentes diseñados: hereda
 * tipografía/color del wrapper y solo estiliza la estructura).
 */
export function RichText({ html, className, style, as: Tag = "div" }: RichTextProps) {
  if (!html || !html.trim()) return null

  const raw = hasHtmlTags(html) ? html : plainToHtml(html)
  const safe = sanitizeHtml(raw).trim()
  if (!safe || !htmlHasVisibleContent(safe)) return null

  return (
    <Tag
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}

/** Evita renderizar wrappers para HTML sin contenido visible (ej. "<p></p>"). */
function htmlHasVisibleContent(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length > 0
}
