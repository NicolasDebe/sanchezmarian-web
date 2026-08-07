"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { MotionLink } from "@/components/ui/motion-link"
import { tapScale } from "@/lib/animations"

/**
 * Barra CTA fija al fondo, solo mobile, que aparece tras pasar el 50% del
 * scroll de la página. Mantiene el "Hablemos" siempre a un toque sin tener que
 * llegar al final. Respeta safe-area-inset-bottom y prefers-reduced-motion.
 */
export function MobileCtaBar({
  label = "Hablemos",
  href = "/#contacto",
}: {
  label?: string
  href?: string
}) {
  const [show, setShow] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const past50 = max > 200 && window.scrollY / max > 0.5
      // Se oculta cerca del fondo para no tapar el CTA/footer propios de la página.
      const nearBottom = max - window.scrollY < 160
      setShow(past50 && !nearBottom)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: reduced ? 0 : 90, opacity: reduced ? 0 : 1 }}
          animate={{ y: 0, opacity: 1 }}
          // Salida más rápida que la entrada (~60% del spring de entrada).
          exit={{ y: reduced ? 0 : 90, opacity: 0, transition: { duration: 0.16, ease: "easeIn" } }}
          transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.7 }}
          className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <MotionLink
            href={href}
            whileTap={{ scale: tapScale }}
            transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.6 }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-bordo py-4 font-sans text-[length:var(--fs-caption)] font-semibold text-hueso shadow-[0_8px_30px_rgba(102,0,31,0.35)]"
          >
            {label}
            <span aria-hidden>→</span>
          </MotionLink>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
