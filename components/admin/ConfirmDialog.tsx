"use client"

import { useEffect, useId, useRef } from "react"

/**
 * Modal de confirmación reusable del admin.
 *
 * Pensado para que Mariana nunca borre nada por accidente: foco accesible al
 * abrir, Escape para cerrar, click fuera para cancelar y un botón primario
 * (bordó por defecto) bien diferenciado del "Cancelar" en outline.
 *
 * Es controlado: el padre decide cuándo se muestra (`open`) y qué hacer en
 * `onConfirm` / `onCancel`. No renderiza nada si `open` es false.
 */
export interface ConfirmDialogProps {
  open: boolean
  /** Título — la pregunta principal. Ej: «¿Eliminar «Foo»? No se puede deshacer.» */
  title: string
  /** Texto secundario opcional bajo el título. */
  body?: React.ReactNode
  /** Texto del botón primario. Default: "Sí, eliminar". */
  confirmLabel?: string
  /** Texto del botón secundario. Default: "Cancelar". */
  cancelLabel?: string
  /** Color del botón primario. "danger" = bordó (default), "primary" = dorado. */
  tone?: "danger" | "primary"
  /** Mientras la acción está en curso: deshabilita botones y muestra busyLabel. */
  busy?: boolean
  /** Texto del botón primario mientras `busy`. Default: "Eliminando…". */
  busyLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Sí, eliminar",
  cancelLabel = "Cancelar",
  tone = "danger",
  busy = false,
  busyLabel = "Eliminando…",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null)
  const titleId = useId()

  // Foco en el botón primario al abrir + Escape para cerrar.
  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,9,16,0.5)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full rounded-2xl border p-6 shadow-xl sm:p-8"
        style={{
          maxWidth: 440,
          backgroundColor: "var(--color-hueso)",
          borderColor: "rgba(201,168,130,0.4)",
        }}
      >
        <h2
          id={titleId}
          className="font-playfair text-xl font-bold"
          style={{ color: "var(--color-negro-bordo)" }}
        >
          {title}
        </h2>
        {body && (
          <p
            className="mt-3 font-sans text-sm leading-relaxed"
            style={{ color: "var(--color-gris-bordo)" }}
          >
            {body}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border px-4 py-2 font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.04)] disabled:opacity-50"
            style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={
              tone === "primary"
                ? { backgroundColor: "var(--color-dorado)", color: "var(--color-negro-bordo)" }
                : { backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }
            }
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
