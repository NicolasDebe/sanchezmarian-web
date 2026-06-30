"use client"

import { useEffect } from "react"
import { getScaleValue, isValidPreset } from "@/lib/design"

/**
 * Puente de preview para /admin/tipografia. Solo actúa cuando la URL trae
 * ?preview=design: lee los presets iniciales (sm/sd) y luego escucha mensajes
 * postMessage del panel admin para actualizar la escala EN VIVO sin recargar.
 * Fuera del modo preview no hace nada (no toca el sitio público real).
 */
export function DesignPreviewBridge() {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("preview") !== "design") return

    const sm = url.searchParams.get("sm")
    const sd = url.searchParams.get("sd")

    if (sm && isValidPreset(sm)) {
      document.documentElement.style.setProperty(
        "--text-scale-mobile",
        String(getScaleValue(sm)),
      )
    }
    if (sd && isValidPreset(sd)) {
      document.documentElement.style.setProperty(
        "--text-scale-desktop",
        String(getScaleValue(sd)),
      )
    }

    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "updateScale") return
      const { mobile, desktop } = e.data
      if (mobile && isValidPreset(mobile)) {
        document.documentElement.style.setProperty(
          "--text-scale-mobile",
          String(getScaleValue(mobile)),
        )
      }
      if (desktop && isValidPreset(desktop)) {
        document.documentElement.style.setProperty(
          "--text-scale-desktop",
          String(getScaleValue(desktop)),
        )
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  return null
}
