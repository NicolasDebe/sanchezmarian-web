/**
 * Esquema de contenido editable de /mis-valores.
 * Fuente única de verdad: sitio público (fallback), seed y editor admin.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export const MIS_VALORES_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Hero",
    legend:
      "El título tiene dos líneas: la segunda (destacada) se muestra grande y en cursiva automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Mis valores", maxChars: 30 },
      { field: "h1_pre", type: "text", label: "Título — primera línea", fallback: "Detrás de la estrategia:", maxChars: 80, resizable: true },
      { field: "h1_accent", type: "text", label: "Título — segunda línea (destacada, cursiva)", fallback: "mi historia.", maxChars: 60 },
    ],
  },
  {
    section: "bio",
    title: "Bio (historia)",
    legend:
      "En el primer párrafo, la frase final destacada se muestra en cursiva bordó automáticamente.",
    fields: [
      {
        field: "paragraph_1_pre",
        type: "longtext",
        // Parte del patrón pre/accent: fluye inline con el acento, no puede ser HTML.
        plain: true,
        label: "Párrafo 1 — parte normal",
        fallback:
          "Mi camino en el mundo de la comunicación comenzó hace más de una década, impulsado por una certeza que hoy es el motor de mi negocio:",
        maxChars: 400,
        resizable: true,
      },
      {
        field: "paragraph_1_accent",
        type: "text",
        label: "Párrafo 1 — frase destacada (cursiva bordó)",
        fallback: "comunicar es conectar.",
        maxChars: 80,
      },
      {
        field: "paragraph_2",
        type: "longtext",
        label: "Párrafo 2",
        fallback:
          "Me formé en la universidad, pero mi verdadero oficio se moldeó en la experiencia en los medios de comunicación. Esas “horas calle” me dieron las herramientas esenciales para entender el ritmo de las noticias y aprender qué busca realmente un periodista. También he dedicado mis días a la comunicación institucional y corporativa, donde descubrí la complejidad de construir y blindar la reputación de marcas, empresas y organismos públicos y privados.",
        maxChars: 800,
        resizable: true,
      },
      {
        field: "paragraph_3",
        type: "longtext",
        label: "Párrafo 3",
        fallback:
          "A lo largo de este recorrido, entendí que para ofrecer un servicio de excelencia no podía trabajar aislada. Por eso, hoy lidero mis proyectos y negocio tejiendo alianzas estratégicas con colegas de confianza, lo que me permite ofrecer soluciones integrales y multiplataforma, garantizando que cada mensaje brille en el soporte adecuado.",
        maxChars: 800,
        resizable: true,
      },
      { field: "signature", type: "text", label: "Firma", fallback: "— Marian Sánchez", maxChars: 50 },
    ],
  },
  {
    section: "pilares",
    title: "Pilares",
    legend:
      "En el título, la parte destacada se muestra en cursiva bordó automáticamente.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Mis valores", maxChars: 30 },
      { field: "title_pre", type: "text", label: "Título — parte normal", fallback: "Los pilares que", maxChars: 60, resizable: true },
      { field: "title_accent", type: "text", label: "Título — texto destacado (cursiva bordó)", fallback: "guían mi trabajo.", maxChars: 60 },
      { field: "intro", type: "longtext", label: "Texto introductorio", fallback: "Esta trayectoria es la que hoy me permite dar vida a mis valores en cada consultoría:", maxChars: 300, resizable: true },
      { field: "pilar_1_title", type: "text", label: "Pilar 1 — Título", fallback: "Inteligencia y Oficio", maxChars: 60, resizable: true },
      { field: "pilar_1_desc", type: "longtext", label: "Pilar 1 — Descripción", fallback: "Combino el respaldo de mis años de estudio con la experiencia real del terreno y una capacitación constante para tomar decisiones estratégicas y con criterio.", maxChars: 400, resizable: true },
      { field: "pilar_2_title", type: "text", label: "Pilar 2 — Título", fallback: "Integridad", maxChars: 60, resizable: true },
      { field: "pilar_2_desc", type: "longtext", label: "Pilar 2 — Descripción", fallback: "Construyo puentes honestos y transparentes. Prefiero cuidar la confianza a largo plazo con un periodista que forzar una noticia sin valor real.", maxChars: 400, resizable: true },
      { field: "pilar_3_title", type: "text", label: "Pilar 3 — Título", fallback: "Libertad", maxChars: 60, resizable: true },
      { field: "pilar_3_desc", type: "longtext", label: "Pilar 3 — Descripción", fallback: "Mi negocio y trabajo está basado en objetivos, no en horarios rígidos. Esa misma independencia me da la libertad de palabra para asesorarte con total franqueza y decirte siempre lo que tu marca necesita escuchar.", maxChars: 400, resizable: true },
      { field: "pilar_4_title", type: "text", label: "Pilar 4 — Título", fallback: "Responsabilidad y Compromiso", maxChars: 60, resizable: true },
      { field: "pilar_4_desc", type: "longtext", label: "Pilar 4 — Descripción", fallback: "No soy una proveedora externa más; me involucro en tu negocio como una aliada estratégica para cuidar cada detalle.", maxChars: 400, resizable: true },
      { field: "pilar_5_title", type: "text", label: "Pilar 5 — Título", fallback: "Pasión", maxChars: 60, resizable: true },
      { field: "pilar_5_desc", type: "longtext", label: "Pilar 5 — Descripción", fallback: "Amo profundamente lo que hago. Disfruto el ecosistema multiplataforma y me entusiasma transformar el propósito de las personas y empresas en historias que merecen ser contadas.", maxChars: 400, resizable: true },
    ],
  },
  {
    section: "cierre",
    title: "Cierre",
    fields: [
      {
        field: "paragraph",
        type: "longtext",
        label: "Párrafo de cierre",
        fallback:
          "Mi propósito en este mundo es abrir caminos para que las historias que merecen ser contadas encuentren su lugar. Creo firmemente que todos tenemos una voz única y el derecho a ser vistos, reconocidos y potenciados desde nuestras propias inteligencias. Mi negocio no es moldear a las marcas o a las personas bajo un formato rígido, sino descubrir su brillo auténtico, darles herramientas estratégicas y tender los puentes necesarios para que su mensaje resuene con fuerza y claridad en la comunidad.",
        maxChars: 800,
        resizable: true,
      },
      { field: "button_text", type: "text", label: "Texto del botón", fallback: "Conversemos →", maxChars: 40 },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(MIS_VALORES_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(MIS_VALORES_SECTIONS, section, field)
}
