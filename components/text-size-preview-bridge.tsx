"use client"

import { useEffect } from "react"
import { sizeFactor } from "@/lib/text-size"

/**
 * Puente de preview del tamaño de texto POR CAMPO para /admin/edit/*. Solo
 * actúa cuando la URL trae ?preview=text-sizes: escucha mensajes postMessage
 * del editor y aplica los tamaños EN VIVO sobre los elementos marcados con
 * data-fkey, sin recargar. Fuera del modo preview no hace nada (no toca el
 * sitio público real).
 *
 * Mensajes que entiende (desde ContentEditor):
 *  - { type: "fieldSize", fkey, m, d }  → aplica factores mobile/desktop.
 *  - { type: "scrollToField", fkey }    → centra ese texto en la vista.
 *
 * `m`/`d` pueden venir como clave de preset ("l", "xl", …) o como número ya
 * resuelto; sizeFactor tolera ambos (número desconocido → 1).
 */
export function TextSizePreviewBridge() {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("preview") !== "text-sizes") return

    const applyFieldSize = (fkey: string, m: unknown, d: unknown) => {
      const mf = typeof m === "number" ? m : sizeFactor(m as string)
      const df = typeof d === "number" ? d : sizeFactor(d as string)
      const els = document.querySelectorAll<HTMLElement>(
        `[data-fkey="${cssEscape(fkey)}"]`,
      )
      els.forEach((el) => {
        if (mf === 1 && df === 1) {
          el.removeAttribute("data-fscale")
          el.style.removeProperty("--fs-local-m")
          el.style.removeProperty("--fs-local-d")
        } else {
          el.setAttribute("data-fscale", "")
          el.style.setProperty("--fs-local-m", String(mf))
          el.style.setProperty("--fs-local-d", String(df))
        }
      })
    }

    const scrollToField = (fkey: string) => {
      const el = document.querySelector<HTMLElement>(
        `[data-fkey="${cssEscape(fkey)}"]`,
      )
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    const handler = (e: MessageEvent) => {
      const data = e.data
      if (!data || typeof data !== "object") return
      if (data.type === "fieldSize" && typeof data.fkey === "string") {
        applyFieldSize(data.fkey, data.m, data.d)
      } else if (data.type === "scrollToField" && typeof data.fkey === "string") {
        scrollToField(data.fkey)
      }
    }

    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  return null
}

/** Escapa comillas en la clave para el selector de atributo (fkey es simple). */
function cssEscape(value: string): string {
  return value.replace(/["\\]/g, "\\$&")
}
