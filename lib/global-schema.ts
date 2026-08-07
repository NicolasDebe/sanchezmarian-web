/**
 * Esquema de contenido global (Nav + Footer). Aparece en todas las páginas.
 * Los destinos (href) de los links quedan hardcoded; solo el texto es editable.
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn } from "@/lib/content-schema"
import { SITE_EMAIL, SITE_TAGLINE, SOCIAL_LINKS, WHATSAPP_CHANNEL_URL } from "@/lib/constants"

export const GLOBAL_PAGE = "global"

export const GLOBAL_SECTIONS: SectionDef[] = [
  {
    section: "nav",
    title: "Menú de navegación",
    legend: "Solo se edita el texto de cada link; los destinos no cambian.",
    fields: [
      { field: "link_servicios", type: "text", label: "Link — Servicios", fallback: "Servicios", maxChars: 40, resizable: true },
      { field: "link_valores", type: "text", label: "Link — Mis valores", fallback: "Mis valores", maxChars: 40, resizable: true },
      { field: "link_casos", type: "text", label: "Link — Casos de éxito", fallback: "Casos de éxito", maxChars: 40, resizable: true },
      { field: "link_campanas", type: "text", label: "Link — Campañas", fallback: "Campañas", maxChars: 40, resizable: true },
    ],
  },
  {
    section: "metadata",
    title: "Compartir en redes (OpenGraph por defecto)",
    legend:
      "Título, descripción e imagen que aparecen al compartir CUALQUIER página del sitio en WhatsApp, Twitter/X, LinkedIn o Facebook. Cada página puede tener su propia versión desde el editor de SEO; si no la tiene, usa estos valores.",
    fields: [
      { field: "og_default_title", type: "text", label: "Título por defecto", fallback: "Marian Sánchez — Comunicación estratégica · Mendoza", maxChars: 70 },
      { field: "og_default_description", type: "longtext", plain: true, label: "Descripción por defecto", fallback: "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.", maxChars: 200 },
      { field: "og_default_image", type: "text", label: "Imagen por defecto (URL, 1200×630px)", fallback: "/og/default.jpg", maxChars: 500 },
      { field: "og_site_name", type: "text", label: "Nombre del sitio", fallback: "Marian Sánchez", maxChars: 60 },
      { field: "twitter_handle", type: "text", label: "Usuario de Twitter/X (opcional, ej: @marian)", fallback: "", maxChars: 30 },
    ],
  },
  {
    section: "newsletter",
    title: "Newsletter (captura de mails)",
    legend:
      "Textos del recuadro de suscripción que aparece en el Home, Campañas y Casos de éxito. El acento del título va en itálica + bordó (editás solo el texto).",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "MANTENETE AL DÍA", maxChars: 40, resizable: true },
      {
        field: "title_pre",
        type: "text",
        label: "Título — parte normal",
        fallback: "Recibí cada nueva campaña",
        maxChars: 80,
        help: "El tamaño y la fuente que elijas acá se aplican al título completo.",
        resizable: true,
      },
      { field: "title_accent", type: "text", label: "Título — parte con acento (itálica/bordó)", fallback: "en tu casilla.", maxChars: 60 },
      { field: "subtitle", type: "text", label: "Subtítulo", fallback: "", maxChars: 120, resizable: true },
      { field: "name_label", type: "text", label: "Etiqueta del campo Nombre", fallback: "Tu nombre", maxChars: 40, resizable: true },
      { field: "email_label", type: "text", label: "Etiqueta del campo Email", fallback: "Tu email", maxChars: 40, resizable: true },
      { field: "button_label", type: "text", label: "Texto del botón", fallback: "Quiero recibirla", maxChars: 40, resizable: true },
      { field: "success_title", type: "text", label: "Título del estado de éxito", fallback: "¡Listo!", maxChars: 40, resizable: true },
      { field: "success_message", type: "text", label: "Mensaje del estado de éxito", fallback: "Te aviso apenas haya algo nuevo.", maxChars: 120, resizable: true },
      { field: "privacy_note", type: "text", label: "Nota de privacidad", fallback: "Tu email es privado. No lo compartimos.", maxChars: 120, resizable: true },
      {
        field: "whatsapp_channel_url",
        type: "text",
        label: "URL del canal de WhatsApp",
        fallback: WHATSAPP_CHANNEL_URL,
        maxChars: 200,
        help: "Enlace al canal de WhatsApp de Marian (botón secundario del recuadro). Tiene que empezar con https://whatsapp.com/  ·  Ejemplo: https://whatsapp.com/channel/0029Vb8FH5e2kNFqiBaeSZ2k  ·  Si lo dejás vacío o mal, el sitio usa el enlace por defecto.",
      },
    ],
  },
  {
    section: "footer",
    title: "Pie de página (Footer)",
    fields: [
      {
        field: "tagline",
        type: "text",
        label: "Frase bajo el logo",
        fallback: SITE_TAGLINE,
        maxChars: 180,
        help: "Aparece bajo el logo en el footer. Si pasás de ~140 caracteres se ve cargado: idealmente una o dos líneas, hasta 4 si es necesario.",
        resizable: true,
      },
      { field: "email", type: "text", label: "Email de contacto", fallback: SITE_EMAIL, maxChars: 80, resizable: true },
      { field: "phone", type: "text", label: "Teléfono", fallback: "+54 261 543-3882", maxChars: 30, resizable: true },
      { field: "location_tag", type: "text", label: "Ubicación / cobertura", fallback: "Mendoza, Argentina · Trabajo remoto en LATAM", maxChars: 80, resizable: true },
      { field: "cta_text", type: "text", label: "Texto del botón CTA", fallback: "Conversemos", maxChars: 30, resizable: true },
      { field: "instagram_url", type: "text", label: "URL de Instagram", fallback: SOCIAL_LINKS.instagram, maxChars: 200 },
      { field: "linkedin_url", type: "text", label: "URL de LinkedIn", fallback: SOCIAL_LINKS.linkedin, maxChars: 200 },
      { field: "copyright_name", type: "text", label: "Nombre en el copyright", fallback: "Mariana Sánchez", maxChars: 60, resizable: true },
    ],
  },
]

export function globalFallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(GLOBAL_SECTIONS, section)
}
