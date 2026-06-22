import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { getGlobalContent } from "@/lib/global-content"

/**
 * Layout del sitio público. Incluye <Navbar> y <Footer> una sola vez para todas
 * las páginas del grupo (site); las páginas solo renderizan su contenido.
 * El admin (app/admin) y /gracias quedan fuera de este grupo a propósito.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const global = await getGlobalContent()

  return (
    <>
      {/* Skip link: primer elemento focuseable; salta navegación con teclado/lector. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-bordo focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:font-semibold focus:text-hueso focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <Navbar
        content={global.nav}
        social={{
          instagram: global.footer.instagram_url,
          linkedin: global.footer.linkedin_url,
        }}
      />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer content={global.footer} nav={global.nav} />
      <WhatsAppFloat />
    </>
  )
}
