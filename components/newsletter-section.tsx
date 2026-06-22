import { getNewsletterContent } from "@/lib/global-content"
import { globalFallbacksFor } from "@/lib/global-schema"
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

  return (
    <section
      style={{
        background: "var(--color-hueso)",
        padding: "clamp(80px, 12vw, 120px) 24px",
      }}
    >
      <NewsletterCard copy={copy} />
    </section>
  )
}
