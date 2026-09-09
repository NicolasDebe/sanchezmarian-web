"use client"

import { useId } from "react"
import { motion, useReducedMotion } from "motion/react"
import { springSnappy } from "@/lib/animations"

/**
 * Puntaje de 1 a 5 estrellas.
 *
 * Es un radiogroup REAL: `<fieldset>` + cinco `<input type="radio">` visualmente
 * ocultos (no `display:none`, que los saca del orden de tabulación). El
 * navegador ya sabe hacer todo lo demás: las flechas mueven entre opciones, el
 * grupo entero es una sola parada de tab y los lectores de pantalla lo anuncian
 * como "3 de 5, opción 3 de 5". Por eso no hay ni un onClick sobre un div.
 *
 * El SVG de la estrella es decorativo (`aria-hidden`): lo que se lee es el
 * `aria-label` del input, que es la etiqueta del `<label>` en sr-only.
 */

const STARS = [1, 2, 3, 4, 5] as const

/** Dorado de la paleta. Las inactivas van en gris-bordo al 20%. */
const ACTIVE = "#C9A882"
const INACTIVE = "rgba(74, 48, 64, 0.2)"

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill={filled ? ACTIVE : INACTIVE}
      aria-hidden="true"
      style={{ display: "block", transition: "fill 160ms ease" }}
    >
      <path d="M12 2.5l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.33l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.95L12 2.5z" />
    </svg>
  )
}

export function StarInput({
  value,
  onChange,
  name = "rating",
  label = "¿Cómo calificarías la experiencia?",
  error,
  disabled = false,
}: {
  /** null = sin elegir. No hay valor por defecto a propósito. */
  value: number | null
  onChange: (value: number) => void
  name?: string
  label?: string
  error?: string
  disabled?: boolean
}) {
  const uid = useId()
  const reduced = useReducedMotion()
  const errorId = `${uid}-error`

  return (
    <fieldset
      disabled={disabled}
      className="flex flex-col gap-1.5 border-0 p-0 m-0 min-w-0"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="font-mono text-[length:var(--fs-micro)] uppercase tracking-[0.15em] text-gris-bordo mb-1.5 p-0">
        {label}
      </legend>

      <div className="flex items-center gap-1.5">
        {STARS.map((n) => {
          const id = `${uid}-star-${n}`
          const active = value !== null && n <= value

          return (
            <span key={n} className="relative">
              <input
                type="radio"
                id={id}
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                aria-label={`${n} de 5`}
                // sr-only: sigue siendo focuseable y navegable con flechas.
                // Con display:none o visibility:hidden dejaría de serlo.
                className="sr-only peer"
              />
              <motion.label
                htmlFor={id}
                title={`${n} de 5`}
                whileHover={disabled || reduced ? undefined : { scale: 1.12 }}
                whileTap={disabled ? undefined : { scale: 0.92 }}
                transition={springSnappy}
                className={`block h-9 w-9 sm:h-10 sm:w-10 rounded-lg p-0.5 ${
                  disabled ? "cursor-not-allowed" : "cursor-pointer"
                } peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bordo`}
              >
                <Star filled={active} />
              </motion.label>
            </span>
          )
        })}

        {/* Refuerzo en texto: el ícono solo no siempre alcanza. aria-hidden
            porque el radio marcado ya lo anuncia y si no se leería dos veces. */}
        <span
          aria-hidden="true"
          className="ml-2 font-sans text-gris-bordo/70"
          style={{ fontSize: "var(--fs-caption)" }}
        >
          {value === null ? "Elegí un puntaje" : `${value} de 5`}
        </span>
      </div>

      {error && (
        <p id={errorId} className="font-mono text-[10px] text-bordo">
          {error}
        </p>
      )}
    </fieldset>
  )
}
