/**
 * Estrellas de SOLO LECTURA para mostrar el puntaje de una reseña.
 *
 * No confundir con components/star-input.tsx, que es el control del formulario
 * (radiogroup navegable con teclado). Este es puramente visual: se anuncia como
 * una sola imagen con su texto ("4 de 5 estrellas") en vez de cinco íconos
 * sueltos, que es lo que un lector de pantalla necesita escuchar acá.
 *
 * Sin "use client" a propósito: no tiene estado ni handlers, así que funciona
 * igual en Server y en Client Components.
 */

/** Dorado de la paleta para las llenas; gris-bordo al 20% para las vacías. */
const ACTIVE = "#C9A882"
const INACTIVE = "rgba(74, 48, 64, 0.2)"

const STARS = [1, 2, 3, 4, 5] as const

export function StarRating({
  rating,
  size = 16,
  className = "",
}: {
  rating: number
  /** Lado del ícono en px. */
  size?: number
  className?: string
}) {
  // Blindaje: un rating fuera de rango no puede romper el render.
  const value = Math.max(0, Math.min(5, Math.round(rating)))

  return (
    <span
      role="img"
      aria-label={`${value} de 5 estrellas`}
      className={`inline-flex items-center ${className}`}
      style={{ gap: size * 0.18 }}
    >
      {STARS.map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill={n <= value ? ACTIVE : INACTIVE}
          aria-hidden="true"
          style={{ display: "block", flexShrink: 0 }}
        >
          <path d="M12 2.5l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.33l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.95L12 2.5z" />
        </svg>
      ))}
    </span>
  )
}
