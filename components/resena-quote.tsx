import { StarRating } from "@/components/star-rating"
import type { PublicTestimonial } from "@/lib/testimonials"

/**
 * Reseña en formato CITA GRANDE: una sola, ocupando el ancho del bloque. Es la
 * diapositiva del carrusel del home y de /servicios (ver resenas-preview.tsx).
 *
 * No confundir con components/resena-card.tsx, que es la tarjeta chica de la
 * grilla de /resenas. Son dos piezas distintas a propósito: acá hay UNA reseña
 * con todo el espacio disponible, así que el texto puede respirar y la firma
 * pesa; allá hay muchas compitiendo en una grilla.
 *
 * Server component puro (sin estado ni handlers): el carrusel que lo envuelve
 * es el que lleva "use client".
 */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

/**
 * "2026-03-14T…" → "marzo 2026".
 *
 * Lee el año y el mes del string ISO en vez de construir un Date: así el
 * resultado es idéntico en el server y en el browser. Con `new Date()` el mes
 * depende del huso horario de cada uno y una reseña del 1º a la madrugada
 * saldría con meses distintos en cada lado (error de hidratación).
 */
function formatMonthYear(iso: string | null): string | null {
  if (!iso) return null
  const m = /^(\d{4})-(\d{2})/.exec(iso)
  if (!m) return null
  const mes = MESES[Number(m[2]) - 1]
  return mes ? `${mes} ${m[1]}` : null
}

const MONO_MICRO =
  "font-mono uppercase tracking-[0.14em] text-[length:var(--fs-micro)]"

/**
 * A partir de acá una cita deja de leerse bien en Playfair grande y pasa a sans
 * en cuerpo normal. El límite del formulario es 1200 caracteres: una reseña
 * larga en serie display serían ~20 líneas de titular, ilegibles. Corto en 340
 * porque es más o menos donde una cita deja de entrar en 4-5 líneas anchas.
 */
const LARGO_MAXIMO_PARA_SERIF = 340

function TypeBadge({ type }: { type: PublicTestimonial["reviewer_type"] }) {
  const isPeriodista = type === "periodista"

  return (
    <span
      className={`${MONO_MICRO} shrink-0 rounded-full px-2.5 py-1 leading-none ${
        isPeriodista
          ? "border border-bordo/50 bg-transparent text-bordo"
          : "text-gris-bordo/55"
      }`}
    >
      {isPeriodista ? "Periodista" : "Marca"}
    </span>
  )
}

export function ResenaQuote({ resena }: { resena: PublicTestimonial }) {
  const fecha = formatMonthYear(resena.published_at)
  const esCorta = resena.body.length <= LARGO_MAXIMO_PARA_SERIF

  return (
    <article className="relative flex h-full flex-col rounded-3xl border border-gris-bordo/12 bg-arena px-7 py-9 sm:px-12 sm:py-12 lg:px-16 lg:py-14">
      {/* Estrellas y tipo de quien firma, arriba de todo. */}
      <header className="flex items-center justify-between gap-3">
        <StarRating rating={resena.rating} size={19} />
        <TypeBadge type={resena.reviewer_type} />
      </header>

      {/* Comilla decorativa. Va en su propio renglón, con alto casi nulo para
          que el cuerpo se le meta abajo: así abre la cita sin pisar las
          estrellas. aria-hidden porque no le aporta nada al lector de pantalla. */}
      <span
        aria-hidden
        className="mt-6 block select-none font-playfair leading-none text-dorado/50"
        style={{ fontSize: "clamp(52px, 6vw, 76px)", height: "0.42em" }}
      >
        &ldquo;
      </span>

      {/* Cuerpo. flex-1 empuja la firma al pie: como todas las diapositivas
          comparten alto, la firma queda siempre en el mismo lugar y no salta
          al pasar de una reseña a la otra. */}
      <p
        className={
          esCorta
            ? "mt-5 flex-1 font-playfair text-negro-bordo"
            : "mt-5 flex-1 font-sans text-negro-bordo/90"
        }
        style={
          esCorta
            ? { fontSize: "var(--fs-h3)", lineHeight: 1.45, maxWidth: "38ch" }
            : { fontSize: "var(--fs-body-lg)", lineHeight: 1.75, maxWidth: "66ch" }
        }
      >
        {resena.body}
      </p>

      {/* Separador dorado corto */}
      <span aria-hidden className="mt-9 mb-4 h-px w-10 shrink-0 bg-dorado" />

      {/* Firma */}
      <footer className="flex flex-col gap-1.5">
        <a
          href={resena.author_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit font-sans font-semibold text-negro-bordo underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-bordo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
          style={{ fontSize: "var(--fs-lead)" }}
        >
          {resena.author_name}
        </a>

        <p className={`${MONO_MICRO} text-gris-bordo/75`}>
          {resena.author_role} · {resena.author_brand}
        </p>

        {/* La fecha va en minúscula ("marzo 2026"), a diferencia del resto de
            los labels mono: en versalitas el mes compite con el cargo y la
            marca, que son el dato que importa. */}
        {fecha && (
          <p className="mt-1 font-mono tracking-[0.08em] text-[length:var(--fs-micro)] text-gris-bordo/45">
            {fecha}
          </p>
        )}
      </footer>
    </article>
  )
}
