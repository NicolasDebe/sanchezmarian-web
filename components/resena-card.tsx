import { StarRating } from "@/components/star-rating"
import type { PublicTestimonial } from "@/lib/testimonials"

/**
 * Tarjeta de una reseña publicada. La comparten /resenas y el bloque de
 * adelanto del home y de /servicios, así que las dos vistas se ven idénticas.
 *
 * La etiqueta de tipo NO es decorativa: una reseña de un periodista respalda
 * algo distinto que la de un cliente (una habla del trabajo contratado, la otra
 * de cómo la trata una redacción), así que las dos tienen que distinguirse de
 * un vistazo. Periodista va en bordó con borde; marca, en gris discreto.
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

export function ResenaCard({ resena }: { resena: PublicTestimonial }) {
  const fecha = formatMonthYear(resena.published_at)

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gris-bordo/12 bg-arena p-6 sm:p-8">
      {/* Estrellas arriba de todo; la etiqueta de tipo en la esquina opuesta. */}
      <header className="mb-5 flex items-start justify-between gap-3">
        <StarRating rating={resena.rating} size={17} />
        <TypeBadge type={resena.reviewer_type} />
      </header>

      {/* Cuerpo. Sin comillas decorativas: el texto se sostiene solo.
          flex-1 empuja la firma al pie y alinea las tarjetas de una misma fila. */}
      <p
        className="flex-1 font-sans leading-[1.7] text-negro-bordo/90"
        style={{ fontSize: "var(--fs-body-lg)" }}
      >
        {resena.body}
      </p>

      {/* Separador dorado corto */}
      <span aria-hidden className="mt-7 mb-4 h-px w-10 shrink-0 bg-dorado" />

      {/* Firma */}
      <footer className="flex flex-col gap-1.5">
        <a
          href={resena.author_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit font-sans font-semibold text-negro-bordo underline decoration-dorado decoration-1 underline-offset-4 transition-colors hover:text-bordo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
          style={{ fontSize: "var(--fs-body)" }}
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
