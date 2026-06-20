"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { IconWhatsApp } from "@/components/ui/icon-whatsapp"
import { WHATSAPP_HREF } from "@/lib/constants"

/**
 * Botón flotante de WhatsApp, global a todo el sitio público (se monta en
 * app/(site)/layout.tsx, que ya excluye /admin y /gracias).
 *
 * - Aparece 1.5s después de cargar (fade + slide-up desde y=20).
 * - Pulso sutil (scale 1→1.08→1 cada 3s) que se pausa al hacer hover.
 * - Tooltip "Hablar por WhatsApp" solo en desktop.
 * - En mobile se eleva cuando la <MobileCtaBar> (barra inferior de /servicios y
 *   /campanas, visible tras el 50% de scroll) está activa, para no superponerse.
 */
export function WhatsAppFloat() {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [liftForBar, setLiftForBar] = useState(false)

  // Entrada diferida 1.5s tras la carga.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1500)
    return () => clearTimeout(t)
  }, [])

  // Réplica de la condición de <MobileCtaBar> para elevar el botón en mobile y
  // que no quede encima de esa barra (solo afecta cuando hay barra: <768px).
  useEffect(() => {
    const onScroll = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches
      if (!isMobile) {
        setLiftForBar(false)
        return
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      const past50 = max > 200 && window.scrollY / max > 0.5
      const nearBottom = max - window.scrollY < 160
      setLiftForBar(past50 && !nearBottom)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  // El pulso se pausa en hover y se desactiva con prefers-reduced-motion.
  const pulsing = mounted && !hovered && !reduced

  return (
    <AnimatePresence>
      {mounted && (
        <motion.a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: pulsing ? [1, 1.08, 1] : 1,
          }}
          exit={{ opacity: 0, y: reduced ? 0 : 20 }}
          transition={{
            opacity: { duration: 0.4, ease: "easeOut" },
            y: { duration: 0.4, ease: "easeOut" },
            scale: pulsing
              ? { duration: 3, ease: "easeInOut", repeat: Infinity }
              : { duration: 0.2, ease: "easeOut" },
          }}
          whileHover={
            reduced
              ? undefined
              : { scale: 1.05, boxShadow: "0 6px 24px rgba(102,0,31,0.35)" }
          }
          className="fixed z-50 right-5 bottom-5 md:right-6 md:bottom-6 flex h-[52px] w-[52px] items-center justify-center rounded-full text-hueso md:h-14 md:w-14 transition-[bottom] duration-300"
          style={{
            // Sobrescribe el bottom de Tailwind solo al elevarse por la barra mobile.
            bottom: liftForBar ? "calc(20px + 72px)" : undefined,
            background: "var(--color-bordo)",
            boxShadow: "0 4px 16px rgba(102,0,31,0.25)",
          }}
        >
          <IconWhatsApp size={24} />

          {/* Tooltip — solo desktop, al hacer hover, a la izquierda del botón. */}
          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-hueso px-3 py-1.5 text-bordo shadow-md md:block"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: "11px",
                }}
              >
                Hablar por WhatsApp
              </motion.span>
            )}
          </AnimatePresence>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
