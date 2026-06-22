/**
 * Constantes globales del sitio — fuente ÚNICA de verdad para datos de marca
 * (email, WhatsApp, redes, navegación, tagline). Los esquemas del CMS
 * (global/contacto/home) usan estos valores como fallback, así Mariana puede
 * sobrescribirlos desde el admin sin que dejen de existir defaults consistentes.
 */

export const SITE_EMAIL = "contacto@sanchezmarian.com"

export const WHATSAPP_NUMBER = "542615433882"
export const WHATSAPP_MESSAGE =
  "Hola Marian, me gustaría consultarte sobre comunicación para mi negocio."

/** Link de WhatsApp listo para usar (texto pre-cargado y codificado). */
export const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/marians%C3%A1nchez/",
  instagram: "https://www.instagram.com/marian15s/",
} as const

/**
 * Navegación principal — un único array consumido por <Navbar> y <Footer>.
 * `key` mapea al campo editable del CMS (global/nav) para sobrescribir solo el
 * texto; el destino (href) es estructural y no se edita.
 */
export const NAV_ITEMS = [
  { key: "link_servicios", label: "Servicios", href: "/servicios" },
  { key: "link_valores", label: "Mis valores", href: "/mis-valores" },
  { key: "link_casos", label: "Casos de éxito", href: "/casos-de-exito" },
  { key: "link_campanas", label: "Campañas", href: "/campanas" },
] as const

export const SITE_TAGLINE = "Comunicación con propósito · Mendoza, Argentina."
