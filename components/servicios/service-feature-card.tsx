import type { ReactNode } from "react"

/**
 * Card visual única compartida por /servicios y la vidriera de servicios del
 * home: borde dorado 25%, radius 16px, fondo hueso, padding 32/20, hover a
 * borde bordó 40% (solo desktop, 0.3s ease-out). Es un div puro (sin hooks),
 * así que sirve tanto en Server como en Client Components.
 */
export function ServiceFeatureCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-dorado/25 bg-hueso p-5 transition-colors duration-300 ease-out md:p-8 md:hover:border-bordo/40${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  )
}
