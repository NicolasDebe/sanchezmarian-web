import { getNewsletterContent } from "@/lib/global-content"
import { globalFallbacksFor } from "@/lib/global-schema"
import { WHATSAPP_CHANNEL_URL, WHATSAPP_CHANNEL_PREFIX } from "@/lib/constants"
import { NewsletterCard, type NewsletterCopy } from "@/components/newsletter-card"

/**
 * Sección server-side que lee el copy editable (global/newsletter) y monta el
 * NewsletterCard. Padding vertical generoso (80px mobile → 120px desktop).
 */
export async function NewsletterSection() {
  const c = await getNewsletterContent()
  const fb = globalFallbacksFor("newsletter")
  // Merge defensivo: si faltara algún campo, cae al fallback del esquema.
  const copy = { ...fb, ...c } as NewsletterCopy

  // Blindaje del link de WhatsApp: si lo guardado no es un canal válido
  // (vacío o mal tipeado desde el admin), caemos al enlace por defecto. Así el
  // botón público nunca apunta a una URL rota.
  copy.whatsapp_channel_url = copy.whatsapp_channel_url?.startsWith(
    WHATSAPP_CHANNEL_PREFIX,
  )
    ? copy.whatsapp_channel_url
    : WHATSAPP_CHANNEL_URL

  return (
    <section
      id="newsletter"
      // scroll-margin para que el ancla (#newsletter, usada desde los mails de
      // Brevo) no quede tapada por el nav fijo al aterrizar.
      style={{
        scrollMarginTop: 96,
        background: "var(--color-hueso)",
        padding: "clamp(80px, 12vw, 120px) 24px",
      }}
    >
      <NewsletterCard copy={copy} />
    </section>
  )
}
