"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Menu, X, Mail, MapPin } from "lucide-react"
import { Instagram, Linkedin } from "@/components/ui/social-icons"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, WHATSAPP_HREF, SITE_EMAIL, SOCIAL_LINKS } from "@/lib/constants"
import { Logo } from "@/components/layout/Logo"
import { IconWhatsApp } from "@/components/ui/icon-whatsapp"
import { fsStyle, type FieldScaleMap } from "@/lib/text-size"

export function Navbar({
  content,
  social,
  scales,
}: {
  content?: Record<string, string>
  social?: { instagram: string; linkedin: string }
  scales?: FieldScaleMap
}) {
  // URLs sociales desde el CMS (global/footer); fallback a las constantes.
  const instagramUrl = social?.instagram || SOCIAL_LINKS.instagram
  const linkedinUrl = social?.linkedin || SOCIAL_LINKS.linkedin
  // El texto de cada link puede sobrescribirse desde el CMS (global/nav);
  // si no, usa el label canónico de NAV_ITEMS.
  const navLinks = NAV_ITEMS.map((item) => ({
    label: content?.[item.key] ?? item.label,
    href: item.href,
    // Mismo campo editable que en el footer (global/nav): un solo ajuste de
    // apariencia vale para el link acá arriba y el de abajo.
    fkey: `nav.${item.key}`,
  }))
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const reduced = useReducedMotion()

  // Cierra el menú al cambiar de ruta (navegación por link o atrás/adelante).
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Esc cierra el menú; bloquea el scroll del body mientras está abierto.
  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isMenuOpen])

  return (
    <header
      className="sticky top-0 z-50 h-[72px] flex items-center"
      style={{ background: "var(--color-bordo)" }}
    >
      <nav className="w-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <Logo variant="negative" height={40} priority />

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "font-sans text-[length:var(--fs-caption)] font-medium transition-colors tracking-wide",
                  pathname === link.href
                    ? "text-hueso"
                    : "text-hueso/60 hover:text-hueso"
                )}
                {...fsStyle(scales?.[link.fkey], undefined, link.fkey)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* CTA desktop. El header siempre tiene fondo --bordo, así que el botón
              va en variante --hueso/--bordo (consistente con el resto del nav). */}
          <div className="hidden md:flex items-center gap-3">
            {/* Presencia social mínima permanente. El nav siempre es fondo bordo,
                así que los íconos van en --hueso/70 → opacidad plena + scale al hover. */}
            <div className="flex items-center gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Marian Sánchez"
                className="text-hueso/70 transition-all duration-200 hover:text-hueso hover:scale-110"
              >
                <Instagram size={18} strokeWidth={1.75} />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn de Marian Sánchez"
                className="text-hueso/70 transition-all duration-200 hover:text-hueso hover:scale-110"
              >
                <Linkedin size={18} strokeWidth={1.75} />
              </a>
            </div>
            <Link
              href="/#contacto"
              className="rounded-md bg-hueso px-5 py-2.5 font-sans text-[length:var(--fs-caption)] font-medium text-bordo transition-colors hover:bg-arena"
            >
              Conversemos
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center justify-center min-h-11 min-w-11 -mr-2 text-hueso/70 hover:text-hueso transition-colors"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop: un tap fuera del panel cierra el menú. */}
            <motion.button
              type="button"
              aria-label="Cerrar menú"
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.13 } }}
              transition={{ duration: reduced ? 0 : 0.22 }}
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 top-[72px] z-40 cursor-default bg-black/30"
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: reduced ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              // Salida ~60% de la entrada (criterio exit-faster-than-enter).
              exit={{ opacity: 0, y: reduced ? 0 : -8, transition: { duration: reduced ? 0 : 0.13 } }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
              className="md:hidden absolute top-full inset-x-0 z-50 border-t border-hueso/10 px-6 pb-6 pt-2 shadow-xl shadow-black/20"
              style={{ background: "var(--color-bordo)" }}
            >
              <ul className="flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center font-sans text-[length:var(--fs-body-lg)] font-medium transition-colors",
                        pathname === link.href ? "text-hueso" : "text-hueso/60"
                      )}
                      {...fsStyle(scales?.[link.fkey], undefined, link.fkey)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Accesos de contacto directo */}
              <div className="mt-5 flex flex-col gap-3 border-t border-hueso/10 pt-6">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg py-3.5 font-sans text-[length:var(--fs-body-lg)] font-semibold text-white"
                  style={{ background: "#25D366" }}
                >
                  <IconWhatsApp size={20} />
                  Conversemos por WhatsApp
                </a>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-hueso/40 py-3.5 font-sans text-[length:var(--fs-body-lg)] font-medium text-hueso"
                >
                  <Mail size={18} strokeWidth={1.5} />
                  Escribime por email
                </a>
                <p className="flex items-center justify-center gap-1.5 pt-1 font-sans text-[length:var(--fs-eyebrow)] text-hueso/50">
                  <MapPin size={13} strokeWidth={1.5} />
                  Mendoza, Argentina
                </p>
              </div>

              {/* Presencia social en el menú mobile, al final, tras divisoria dorada. */}
              <div className="mt-5 flex flex-col gap-1 border-t border-dorado/30 pt-5">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Marian Sánchez"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-11 items-center gap-3 font-sans text-[length:var(--fs-caption)] text-hueso/80 transition-colors hover:text-hueso"
                >
                  <Instagram size={18} strokeWidth={1.5} className="shrink-0" />
                  Instagram @marian15s
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn de Marian Sánchez"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-11 items-center gap-3 font-sans text-[length:var(--fs-caption)] text-hueso/80 transition-colors hover:text-hueso"
                >
                  <Linkedin size={18} strokeWidth={1.5} className="shrink-0" />
                  LinkedIn Marian Sánchez
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
