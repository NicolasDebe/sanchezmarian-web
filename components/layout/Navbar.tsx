"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "@/lib/constants"
import { Logo } from "@/components/layout/Logo"

export function Navbar({ content }: { content?: Record<string, string> }) {
  // El texto de cada link puede sobrescribirse desde el CMS (global/nav);
  // si no, usa el label canónico de NAV_ITEMS.
  const navLinks = NAV_ITEMS.map((item) => ({
    label: content?.[item.key] ?? item.label,
    href: item.href,
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
                  "font-sans text-sm font-medium transition-colors tracking-wide",
                  pathname === link.href
                    ? "text-hueso"
                    : "text-hueso/60 hover:text-hueso"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
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
                        "flex min-h-12 items-center font-sans text-base font-medium transition-colors",
                        pathname === link.href ? "text-hueso" : "text-hueso/60"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
