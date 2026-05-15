"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Servicios", href: "/servicios" },
  { label: "Sobre mí", href: "/sobre-marian" },
  { label: "En medios", href: "/en-medios" },
  { label: "Blog", href: "/blog" },
]

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(28,46,74,0.08)]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-playfair text-2xl font-bold italic text-marino hover:text-terracota transition-colors"
        >
          Marian.
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "font-sans text-sm font-medium transition-colors tracking-wide",
                  pathname === link.href
                    ? "text-marino"
                    : "text-marino/60 hover:text-marino"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/contacto"
            className="hidden md:inline-flex items-center gap-2 bg-terracota text-white px-5 py-2.5 rounded-full font-sans text-sm font-medium hover:bg-terracota/90 transition-colors"
          >
            Consulta gratis
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-marino hover:text-terracota transition-colors"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/98 backdrop-blur-md border-t border-marino/10 px-6 pb-6 pt-4"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block font-sans text-base font-medium py-1 transition-colors",
                      pathname === link.href ? "text-marino" : "text-marino/70"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contacto"
              onClick={() => setIsMenuOpen(false)}
              className="mt-5 block w-full text-center bg-terracota text-white px-5 py-3 rounded-full font-sans text-sm font-medium"
            >
              Consulta gratis
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
