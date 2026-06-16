"use client"

import { useEffect, useState } from "react"

/**
 * Hook SSR-safe para media queries.
 *
 * - Devuelve `null` durante el render del servidor y el primer render del
 *   cliente (antes de hidratar): así nunca hay mismatch de hidratación.
 * - Después de montar, lee `matchMedia` y se actualiza ante cambios.
 *
 * Patrón de uso: renderizar la versión "liviana"/mobile mientras es `null`,
 * y recién activar lógica pesada (scrollytelling) cuando devuelve `true`.
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}
