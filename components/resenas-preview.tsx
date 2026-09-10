"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { ResenaQuote } from "@/components/resena-quote"
import { fadeUp, fadeUpStagger, viewportOnce, EASE_EXPO } from "@/lib/animations"
import { fsProps, type FieldScaleMap } from "@/lib/text-size"
import { fallbacksFor } from "@/lib/resenas-schema"
import type { PublicTestimonial } from "@/lib/testimonials"

/**
 * Adelanto de reseñas para el home y /servicios, en formato CARRUSEL: una
 * reseña grande por vez, con flechas, puntos y swipe. Recibe las publicadas por
 * props: el fetch lo hace el server component de cada página, nunca este
 * componente.
 *
 * Es un apartado de SOLO LECTURA. Dejar una reseña nueva sigue siendo /resenas/nueva,
 * a donde va el botón secundario del pie.
 *
 * `bg` ajusta el fondo según dónde se inserte, igual que <Conexiones>, para no
 * romper la alternancia hueso / hueso-oscuro / arena de cada página.
 *
 * POR QUÉ TODAS LAS DIAPOSITIVAS ESTÁN EN EL DOM
 * Van apiladas en la misma celda de un grid, y las inactivas se ocultan con
 * opacidad + `inert`. Así el alto del carrusel es siempre el de la reseña más
 * larga y la página no salta al pasar de una a otra, que es el defecto clásico
 * de los carruseles con AnimatePresence. `inert` las saca del foco y del lector
 * de pantalla, así que ocultas no molestan.
 */

/** Con ninguna reseña publicada el bloque no tiene nada que mostrar. */
const MIN_PARA_MOSTRAR = 1

/** Cuántas entran en el adelanto (el resto se ve en /resenas). */
const MAX_EN_ADELANTO = 3

/** Auto-avance. Pausa con hover, foco, drag y prefers-reduced-motion. */
const AUTOPLAY_MS = 8000

/** Píxeles de arrastre a partir de los cuales el swipe cambia de reseña. */
const SWIPE_MIN_PX = 60

/**
 * Las 3 a mostrar, siempre por published_at desc (nunca por rating).
 *
 * ÚNICA excepción: si hay alguna reseña de periodista publicada pero ninguna
 * entra en las 3 más recientes, la de periodista más reciente ocupa el tercer
 * lugar. Es la que más aporta acá, porque respalda la promesa de "relaciones
 * reales con periodistas" que hace el hero.
 */
export function pickPreview(resenas: PublicTestimonial[]): PublicTestimonial[] {
  const top = resenas.slice(0, MAX_EN_ADELANTO)

  if (top.some((r) => r.reviewer_type === "periodista")) return top

  const periodista = resenas.find((r) => r.reviewer_type === "periodista")
  if (!periodista || top.length < MAX_EN_ADELANTO) return top

  return [...top.slice(0, MAX_EN_ADELANTO - 1), periodista]
}

export function ResenasPreview({
  resenas,
  content,
  scales,
  bg = "bg-hueso",
}: {
  /** Publicadas, ya ordenadas por published_at desc. */
  resenas: PublicTestimonial[]
  content?: Record<string, string>
  scales?: FieldScaleMap
  bg?: string
}) {
  const visibles = pickPreview(resenas)
  const total = visibles.length

  const reduced = useReducedMotion()
  const [indexGuardado, setIndex] = useState(0)
  // Si se despublica una reseña mientras alguien mira el carrusel, el índice
  // guardado puede quedar fuera de rango. Se acota acá, al leerlo, en vez de
  // corregirlo con un efecto (que dispararía un render en cascada).
  const index = indexGuardado >= total ? 0 : indexGuardado
  // Dirección del último cambio: decide de qué lado entra la reseña nueva.
  const [dir, setDir] = useState(1)
  // Cualquier motivo para no auto-avanzar: puntero encima, foco dentro, drag.
  const [pausado, setPausado] = useState(false)

  const hayVarias = total > 1
  const autoplay = hayVarias && !pausado && !reduced

  const irA = useCallback((next: number, direccion: number) => {
    setDir(direccion)
    setIndex(next)
  }, [])

  const siguiente = useCallback(() => {
    setDir(1)
    setIndex((i) => (i + 1) % total)
  }, [total])

  const anterior = useCallback(() => {
    setDir(-1)
    setIndex((i) => (i - 1 + total) % total)
  }, [total])

  // Auto-avance. El timer se re-crea en cada cambio de índice, así que tocar
  // una flecha o un punto también reinicia la cuenta (y no salta enseguida).
  useEffect(() => {
    if (!autoplay) return
    const id = setTimeout(siguiente, AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [autoplay, siguiente, index])

  const c = { ...fallbacksFor("preview"), ...content }

  if (total < MIN_PARA_MOSTRAR) return null

  return (
    <section className={`${bg} py-20 lg:py-28`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* ── Encabezado ── */}
        <motion.header
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col items-center text-center"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase text-bordo"
            {...fsProps(scales, "preview", "eyebrow", {
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: "0.2em",
            })}
          >
            {c.eyebrow}
          </motion.p>

          <motion.span
            variants={fadeUp}
            aria-hidden
            className="my-6 h-px bg-dorado"
            style={{ width: 40 }}
          />

          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold text-negro-bordo"
            {...fsProps(scales, "preview", "title_pre", {
              fontSize: "var(--fs-h2)",
              lineHeight: "var(--lh-tight)",
              letterSpacing: "-0.02em",
              maxWidth: "22ch",
            })}
          >
            {c.title_pre} <em className="italic text-bordo">{c.title_accent}</em>{" "}
            {c.title_post}
          </motion.h2>
        </motion.header>

        {/* ── Carrusel ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-12 flex items-center gap-4 lg:gap-6"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onFocusCapture={() => setPausado(true)}
          onBlurCapture={() => setPausado(false)}
        >
          {/* Flechas laterales: solo desde lg, donde hay margen fuera de la
              tarjeta. En pantallas chicas van abajo, junto a los puntos. */}
          {hayVarias && (
            <Flecha hacia="anterior" onClick={anterior} className="hidden lg:inline-flex" />
          )}

          <div
            role="group"
            aria-roledescription="carrusel"
            aria-label="Reseñas de quienes trabajaron con Marian"
            onKeyDown={(e) => {
              if (!hayVarias) return
              if (e.key === "ArrowRight") { e.preventDefault(); siguiente() }
              if (e.key === "ArrowLeft") { e.preventDefault(); anterior() }
            }}
            // max-w-4xl: a todo el ancho del contenedor (7xl) la cita queda
            // nadando en una tarjeta enorme con media columna vacía.
            className="mx-auto min-w-0 w-full max-w-4xl flex-1"
          >
            <motion.div
              // El drag es el swipe de mobile. dragConstraints en 0 lo deja
              // volver solo a su lugar: no desplaza nada, solo mide el gesto.
              drag={hayVarias ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragStart={() => setPausado(true)}
              onDragEnd={(_, info) => {
                setPausado(false)
                if (info.offset.x < -SWIPE_MIN_PX) siguiente()
                else if (info.offset.x > SWIPE_MIN_PX) anterior()
              }}
              className="grid cursor-grab touch-pan-y active:cursor-grabbing"
              aria-live={autoplay ? "off" : "polite"}
            >
              {visibles.map((r, i) => {
                const activa = i === index

                return (
                  <motion.div
                    key={r.id}
                    role="group"
                    aria-roledescription="reseña"
                    aria-label={`${i + 1} de ${total}`}
                    // Todas en la misma celda del grid: el alto lo fija la más
                    // larga y la página no salta al cambiar de reseña.
                    style={{ gridArea: "1 / 1" }}
                    className={activa ? "" : "pointer-events-none"}
                    inert={!activa}
                    aria-hidden={!activa}
                    initial={false}
                    animate={{
                      opacity: activa ? 1 : 0,
                      x: activa ? 0 : dir * 48,
                    }}
                    transition={
                      reduced
                        ? { duration: 0.2 }
                        : { duration: 0.5, ease: EASE_EXPO }
                    }
                  >
                    <ResenaQuote resena={r} />
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {hayVarias && (
            <Flecha hacia="siguiente" onClick={siguiente} className="hidden lg:inline-flex" />
          )}
        </motion.div>

        {/* ── Controles: flechas (solo mobile/tablet) + puntos ── */}
        {hayVarias && (
          <div className="mt-7 flex items-center justify-center gap-5">
            <Flecha hacia="anterior" onClick={anterior} className="inline-flex lg:hidden" />

            <ul className="flex items-center gap-2.5">
              {visibles.map((r, i) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => irA(i, i > index ? 1 : -1)}
                    aria-label={`Ver la reseña ${i + 1} de ${total}`}
                    aria-current={i === index}
                    className="group grid h-7 w-7 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
                  >
                    <span
                      aria-hidden
                      className={`block h-2 w-2 rounded-full transition-all duration-300 ${
                        i === index
                          ? "w-5 bg-bordo"
                          : "bg-gris-bordo/25 group-hover:bg-bordo/50"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>

            <Flecha hacia="siguiente" onClick={siguiente} className="inline-flex lg:hidden" />
          </div>
        )}

        {/* ── Cierre: ver todas + dejar la propia ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            href="/resenas"
            className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-bordo/40 px-5 py-2.5 font-sans font-semibold text-bordo transition-all duration-300 hover:border-bordo hover:bg-bordo hover:text-hueso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
            style={{ fontSize: "var(--fs-caption)" }}
          >
            {c.cta_label}
            <ArrowRight
              size={15}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {/* Secundario, sin borde: el apartado es de lectura, pero conviene que
              quien trabajó con Marian sepa que puede dejar la suya. */}
          <Link
            href="/resenas/nueva"
            className="inline-flex w-fit items-center rounded-full px-4 py-2.5 font-sans text-gris-bordo underline decoration-dorado decoration-1 underline-offset-4 transition-colors duration-300 hover:text-bordo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
            style={{ fontSize: "var(--fs-caption)" }}
          >
            {c.cta_secondary_label}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/**
 * Botón circular de navegación. Mismo estilo que los CTA outline del sitio.
 *
 * El `display` lo pone SIEMPRE quien lo usa (`className`), nunca la clase base:
 * las mismas flechas se muestran al costado en desktop y abajo en mobile, y si
 * la base trajera un `inline-flex` propio le ganaría al `hidden` del breakpoint
 * (el orden de las clases no decide nada, decide el orden del CSS generado).
 */
function Flecha({
  hacia,
  onClick,
  className,
}: {
  hacia: "anterior" | "siguiente"
  onClick: () => void
  /** Obligatorio: tiene que incluir las clases de display del breakpoint. */
  className: string
}) {
  const Icono = hacia === "anterior" ? ArrowLeft : ArrowRight

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hacia === "anterior" ? "Reseña anterior" : "Reseña siguiente"}
      className={`h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bordo/40 text-bordo transition-all duration-300 hover:border-bordo hover:bg-bordo hover:text-hueso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo ${className}`}
    >
      <Icono size={17} strokeWidth={2.2} aria-hidden />
    </button>
  )
}
