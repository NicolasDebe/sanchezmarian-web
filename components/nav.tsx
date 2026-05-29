"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Servicios", href: "/servicios" },
  { label: "Sobre mí", href: "/sobre-marian" },
  { label: "Casos de éxito", href: "/casos-de-exito" },
]

export function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "var(--color-bordo)" }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo-marian-negativo.png"
            alt="Marian Sánchez"
            width={140}
            height={45}
            priority
            className="object-contain"
          />
        </Link>

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
          <Link
            href="/contacto"
            className="hidden md:inline-flex items-center gap-2 bg-hueso text-bordo px-5 py-2.5 rounded-full font-sans text-sm font-medium hover:bg-arena transition-colors"
          >
            Conversemos
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-hueso/70 hover:text-hueso transition-colors"
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
            className="md:hidden border-t border-hueso/10 px-6 pb-6 pt-4"
            style={{ background: "var(--color-bordo)" }}
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block font-sans text-base font-medium py-1 transition-colors",
                      pathname === link.href ? "text-hueso" : "text-hueso/60"
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
              className="mt-5 block w-full text-center bg-hueso text-bordo px-5 py-3 rounded-full font-sans text-sm font-medium"
            >
              Conversemos
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
