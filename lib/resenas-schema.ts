/**
 * Esquema de contenido editable de /resenas (página pública de reseñas).
 *
 * Fuente ÚNICA de verdad para el sitio público (fallbacks), el seed y el editor
 * del admin, igual que el resto de las páginas.
 *
 * Tres secciones:
 *  - `hero`    → encabezado de /resenas + el recuadro del pie
 *  - `preview` → el bloque reutilizable que va en el home y en /servicios
 *  - `empty`   → qué se muestra cuando todavía no hay ninguna reseña publicada
 *
 * OJO con el copy: la publicación pasa por una aprobación interna. Ningún texto
 * de acá puede decir ni sugerir que se publican TODAS las reseñas recibidas, o
 * que no hay selección. Lo que sí es cierto, y es lo que se dice: cada reseña la
 * escribe quien la firma y se publica sin editar el texto.
 */

import type { FieldType, FieldDef, SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export type { FieldType, FieldDef, SectionDef }

/** Slug de `page` en content_blocks. */
export const RESENAS_PAGE = "resenas"

export const RESENAS_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Encabezado y pie",
    legend:
      "En el título, la parte del medio se muestra en cursiva bordó automáticamente.",
    fields: [
      {
        field: "eyebrow",
        type: "text",
        label: "Eyebrow (línea superior)",
        fallback: "Reseñas",
        maxChars: 30,
        resizable: true,
      },
      {
        field: "title_pre",
        type: "text",
        label: "Título — parte normal",
        fallback: "Lo que dicen",
        maxChars: 60,
        help: "El tamaño y la fuente que elijas acá se aplican a todo el título.",
        resizable: true,
      },
      {
        field: "title_accent",
        type: "text",
        label: "Título — parte destacada (cursiva bordó)",
        fallback: "quienes trabajaron",
        maxChars: 60,
      },
      {
        field: "title_post",
        type: "text",
        label: "Título — cierre",
        fallback: "conmigo.",
        maxChars: 60,
      },
      {
        field: "subtitle",
        type: "longtext",
        label: "Bajada",
        // En primera persona, igual que el título ("trabajaron conmigo"): la
        // página la firma Marian, no habla de ella en tercera.
        fallback:
          "Marcas que me eligieron para contar su historia y periodistas con los que trabajo todos los días.",
        maxChars: 400,
        help: "Una o dos oraciones debajo del título.",
        resizable: true,
      },
      {
        field: "footer_note",
        type: "longtext",
        label: "Texto del recuadro al pie",
        plain: true,
        fallback:
          "Cada reseña la escribe la persona que la firma y se publica sin editar el texto. Podés verificar quién es cada una desde su perfil público.",
        maxChars: 300,
        help: "Aclaración sobre cómo se publican las reseñas. No escribas que se publican todas las que se reciben: antes pasan por una revisión.",
      },
    ],
  },
  {
    section: "preview",
    title: "Bloque del home y de Servicios",
    legend:
      "El adelanto de reseñas que aparece en el home y en Servicios, como un carrusel: se ve una reseña por vez y se pasa con las flechas o los puntos. Muestra las 3 más recientes.",
    fields: [
      {
        field: "eyebrow",
        type: "text",
        label: "Eyebrow",
        fallback: "Reseñas",
        maxChars: 30,
        resizable: true,
      },
      {
        field: "title_pre",
        type: "text",
        label: "Título — parte normal",
        fallback: "Trabajar con Marian,",
        maxChars: 60,
        help: "El tamaño y la fuente que elijas acá se aplican a todo el título.",
        resizable: true,
      },
      {
        field: "title_accent",
        type: "text",
        label: "Título — parte destacada (cursiva bordó)",
        fallback: "contado por",
        maxChars: 60,
      },
      {
        field: "title_post",
        type: "text",
        label: "Título — cierre",
        fallback: "quienes ya lo hicieron.",
        maxChars: 60,
      },
      {
        field: "cta_label",
        type: "text",
        label: "Texto del link al final",
        fallback: "Ver todas las reseñas",
        maxChars: 40,
      },
      {
        field: "cta_secondary_label",
        type: "text",
        label: "Texto del segundo link (dejar una reseña)",
        fallback: "Dejá la tuya",
        maxChars: 40,
        help: "Link discreto al lado del anterior. Lleva al formulario para dejar una reseña nueva.",
      },
    ],
  },
  {
    section: "empty",
    title: "Cuando todavía no hay reseñas",
    legend:
      "Solo se ve mientras no haya ninguna reseña publicada. Después desaparece solo.",
    fields: [
      {
        field: "title",
        type: "text",
        label: "Título",
        fallback: "Todavía no hay reseñas publicadas.",
        maxChars: 80,
      },
      {
        field: "body",
        type: "longtext",
        label: "Texto",
        plain: true,
        fallback: "Si trabajaste con Marian, podés ser la primera persona en contarlo.",
        maxChars: 300,
      },
      {
        field: "cta_label",
        type: "text",
        label: "Texto del botón",
        fallback: "Dejar mi reseña",
        maxChars: 40,
      },
    ],
  },
]

/** Fallbacks de una sección, listos para mergear con lo que venga de la DB. */
export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(RESENAS_SECTIONS, section)
}

/** Fallback de un campo puntual. */
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(RESENAS_SECTIONS, section, field)
}
