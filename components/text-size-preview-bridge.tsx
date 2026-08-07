"use client"

import { useEffect } from "react"
import { sizeFactor, fontCss } from "@/lib/text-size"

/**
 * Puente de preview del tamaño de texto POR CAMPO para /admin/edit/*. Solo
 * actúa cuando la URL trae ?preview=text-sizes: escucha mensajes postMessage
 * del editor y aplica los tamaños EN VIVO sobre los elementos marcados con
 * data-fkey, sin recargar. Fuera del modo preview no hace nada (no toca el
 * sitio público real).
 *
 * Mensajes que entiende (desde ContentEditor):
 *  - { type: "fieldSize", fkey, m, d, font }  → tamaño mobile/desktop + fuente.
 *  - { type: "scrollToField", fkey }          → centra ese texto en la vista.
 *
 * `m`/`d` pueden venir como clave de preset ("l", "xl", …) o como número ya
 * resuelto; sizeFactor tolera ambos (número desconocido → 1). `font` es una
 * clave de FIELD_FONTS ("default" | "playfair" | "sans" | "mono").
 */
export function TextSizePreviewBridge() {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("preview") !== "text-sizes") return

    const applyFieldSize = (fkey: string, m: unknown, d: unknown, font: unknown) => {
      const mf = typeof m === "number" ? m : sizeFactor(m as string)
      const df = typeof d === "number" ? d : sizeFactor(d as string)
      const family = typeof font === "string" ? fontCss(font) : undefined
      const els = document.querySelectorAll<HTMLElement>(
        `[data-fkey="${cssEscape(fkey)}"]`,
      )
      els.forEach((el) => {
        const sizeBefore = getComputedStyle(el).fontSize

        if (mf === 1 && df === 1) {
          el.removeAttribute("data-fscale")
          el.style.removeProperty("--fs-local-m")
          el.style.removeProperty("--fs-local-d")
        } else {
          el.setAttribute("data-fscale", "")
          el.style.setProperty("--fs-local-m", String(mf))
          el.style.setProperty("--fs-local-d", String(df))
        }
        // Guardamos UNA vez la fuente inline original (puede ser la del diseño):
        // al volver a "default" la restauramos en vez de borrarla a ciegas.
        if (!("fkeyFontOrig" in el.dataset)) el.dataset.fkeyFontOrig = el.style.fontFamily
        el.style.fontFamily = family ?? el.dataset.fkeyFontOrig ?? ""

        // En algunos elementos el navegador no recomputa el font-size al recibir
        // [data-fscale] por JS: los tokens --fs-* locales quedan bien, pero el
        // tamaño usado no se actualiza (ni forzando un font-size absoluto). Un
        // toggle de display lo obliga a recalcular. Solo pasa acá, aplicando en
        // caliente: el sitio público trae el atributo en el HTML del servidor y
        // computa de cero. Se hace únicamente si el tamaño no reaccionó, para
        // no forzar reflows de más mientras se mueve el slider.
        if (getComputedStyle(el).fontSize === sizeBefore) {
          const prev = el.style.display
          el.style.display = "none"
          void el.offsetHeight
          el.style.display = prev
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
        applyFieldSize(data.fkey, data.m, data.d, data.font)
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
