"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { CLIPPINGS } from "@/data/clippings"
import {
  SCOPE_LABELS,
  clippingYear,
  type ClientWithClippings,
  type DbClient,
  type DbClipping,
} from "@/lib/clippings"
import { fadeUp, fadeUpStagger, revealCard, viewportOnce } from "@/lib/animations"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { DestacadasRotativo } from "@/components/destacadas-rotativo"
import { fallbacksFor } from "@/lib/casos-schema"

// 12 apariciones rotativas — 4 grupos × 3 cards
// Grupo 1: La Nación · Vatican News · Los Andes (Notarial)
// Grupo 2: Clarín · Los Andes (Vendimia Martín Fierro) · Canal 9 (Notarial)
// Grupo 3: Los Andes Cosquín · El Sol (Meneo) · Constructiva Online
// Grupo 4: MDZ Online (Vendimia) · Canal 9 Cada Tarde (Meneo) · Infobae
const ROTATIVO_IDS = [1, 10, 25, 2, 35, 28, 44, 49, 30, 36, 53, 9] as const

const FORMAT_BORDER: Record<string, string> = {
  Digital:   "var(--color-bordo)",
  Gráfico:   "var(--color-negro-bordo)",
  TV:        "var(--color-dorado)",
  Radio:     "var(--color-gris-bordo)",
  Streaming: "var(--color-bordo-claro)",
}

const FORMAT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  TV:        { bg: "var(--color-bordo)",       color: "var(--color-hueso)",      label: "TV" },
  Radio:     { bg: "var(--color-gris-bordo)",  color: "var(--color-hueso)",      label: "Radio" },
  Gráfico:   { bg: "var(--color-negro-bordo)", color: "var(--color-hueso)",      label: "Diario" },
  Digital:   { bg: "var(--color-dorado)",      color: "var(--color-negro-bordo)", label: "Digital" },
  Streaming: { bg: "var(--color-bordo-claro)", color: "var(--color-negro-bordo)", label: "Stream" },
}

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Timeline layout constants ────────────────────────────────────────────────

const COLS = 3
const ROW_H = 220      // px per grid row
const LINE_Y = 185     // y of zigzag line within each row (below cards)
const GAP = 24         // column gap

// ─── Timeline card ────────────────────────────────────────────────────────────

function TimelineCard({ ap }: { ap: DbClipping }) {
  const borderColor = FORMAT_BORDER[ap.format] ?? FORMAT_BORDER.Digital

  const inner = (
    <div
      style={{
        background: "var(--color-hueso)",
        borderRadius: 8,
        padding: "16px 20px",
        borderLeft: `2px solid ${borderColor}`,
      }}
    >
      <div className="flex items-start justify-between gap-2" style={{ marginBottom: 6 }}>
        <span
          className="font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
        >
          {ap.medium}
        </span>
        <span
          className="font-mono shrink-0"
          style={{
            fontSize: 8,
            padding: "2px 6px",
            borderRadius: 4,
            background: "var(--color-arena)",
            color: "var(--color-gris-bordo)",
            whiteSpace: "nowrap",
          }}
        >
          {SCOPE_LABELS[ap.scope] ?? ap.scope}
        </span>
      </div>

      <p
        className="font-sans"
        style={{
          fontSize: 13,
          color: "var(--color-negro-bordo)",
          lineHeight: 1.4,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {ap.title}
      </p>

      <span
        className="font-mono"
        style={{ display: "block", marginTop: 6, fontSize: 10, color: "var(--color-gris-bordo)", opacity: 0.5 }}
      >
        {clippingYear(ap.published_at)}
      </span>
    </div>
  )

  return ap.url ? (
    <a
      href={ap.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-all hover:opacity-80"
      style={{ textDecoration: "none" }}
    >
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  )
}

// ─── Zigzag timeline ──────────────────────────────────────────────────────────

function ZigzagTimeline({
  apariciones,
  clientId,
}: {
  apariciones: DbClipping[]
  clientId: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerW(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => {
      setContainerW(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Ya vienen ordenadas por published_at DESC desde el servidor.
  const sorted = apariciones

  const isMobile = containerW > 0 && containerW < 640
  const rows = Math.ceil(sorted.length / COLS)
  const colW = containerW > 0 ? (containerW - GAP * (COLS - 1)) / COLS : 0
  const colCenter = (c: number) => c * (colW + GAP) + colW / 2

  // Build zigzag SVG path
  const svgPath = useMemo(() => {
    if (containerW <= 0 || sorted.length === 0) return ""
    const W = containerW
    let d = ""
    for (let r = 0; r < rows; r++) {
      const y = r * ROW_H + LINE_Y
      const ltr = r % 2 === 0
      if (r === 0) d = `M ${ltr ? 0 : W},${y}`
      d += ` L ${ltr ? W : 0},${y}`
      if (r < rows - 1) {
        d += ` L ${ltr ? W : 0},${(r + 1) * ROW_H + LINE_Y}`
      }
    }
    return d
  }, [containerW, rows, sorted.length])

  const svgH = rows * ROW_H + 20

  if (sorted.length === 0) return null

  // ── Mobile: simple vertical list ──
  if (isMobile) {
    return (
      <div ref={containerRef} style={{ position: "relative", paddingLeft: 28, paddingBottom: 24, width: "100%" }}>
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 0,
            bottom: 0,
            width: 1,
            background: "rgba(201,168,130,0.4)",
          }}
        />
        {sorted.map((ap, i) => (
          <motion.div
            key={ap.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.35, ease: EASE }}
            style={{ position: "relative", marginBottom: 10 }}
          >
            <div
              style={{
                position: "absolute",
                left: -22,
                top: 14,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-bordo)",
              }}
            />
            <TimelineCard ap={ap} />
          </motion.div>
        ))}
      </div>
    )
  }

  // ── Desktop: zigzag grid ──
  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", paddingBottom: 24 }}>
      {/* SVG zigzag overlay */}
      {containerW > 0 && svgPath && (
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: containerW,
            height: svgH,
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 0,
          }}
        >
          {/* Path draw animation */}
          <motion.path
            key={`p-${clientId}-${containerW}`}
            d={svgPath}
            fill="none"
            stroke="rgba(201,168,130,0.4)"
            strokeWidth={1.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Static dots at card positions */}
          {sorted.map((ap, i) => {
            const row = Math.floor(i / COLS)
            const col = i % COLS
            const ltr = row % 2 === 0
            const actualCol = ltr ? col : COLS - 1 - col
            return (
              <motion.circle
                key={`dot-${ap.id}`}
                cx={colCenter(actualCol)}
                cy={row * ROW_H + LINE_Y}
                r={4}
                fill="var(--color-bordo)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.2 }}
              />
            )
          })}

          {/* Traveling dot — infinite loop along the path */}
          {svgPath && (
            <circle
              key={`traveler-${clientId}-${containerW}`}
              r={3}
              fill="var(--color-bordo)"
              opacity={0.65}
            >
              <animateMotion dur="8s" repeatCount="indefinite" path={svgPath} />
            </circle>
          )}
        </svg>
      )}

      {/* Cards grid arranged by row */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {Array.from({ length: rows }).map((_, rowIdx) => {
          const rowItems = sorted.slice(rowIdx * COLS, (rowIdx + 1) * COLS)
          const ltr = rowIdx % 2 === 0
          const emptyCount = COLS - rowItems.length

          // L→R rows: items left-aligned, empty slots at end
          // R→L rows: items right-aligned, empty slots at start, items reversed
          const displayItems: (DbClipping | null)[] = ltr
            ? [...rowItems, ...Array<null>(emptyCount).fill(null)]
            : [
                ...Array<null>(emptyCount).fill(null),
                ...[...rowItems].reverse(),
              ]

          return (
            <div
              key={rowIdx}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: GAP,
                height: ROW_H,
                alignItems: "flex-start",
                paddingTop: 18,
              }}
            >
              {displayItems.map((ap, gridCol) => {
                if (!ap)
                  return <div key={`empty-${rowIdx}-${gridCol}`} />
                const sortedIdx = sorted.findIndex((item) => item.id === ap.id)
                return (
                  <motion.div
                    key={ap.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3 + sortedIdx * 0.1,
                      duration: 0.35,
                      ease: EASE,
                    }}
                  >
                    <TimelineCard ap={ap} />
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Timeline client block ────────────────────────────────────────────────────

function TimelineClientBlock({
  client,
  apariciones,
  isOpen,
  onToggle,
}: {
  client: DbClient
  apariciones: DbClipping[]
  isOpen: boolean
  onToggle: () => void
}) {
  const [hov, setHov] = useState(false)

  return (
    <div
      id={`cliente-${client.slug}`}
      style={{ scrollMarginTop: 100 }}
    >
      {/* Header button */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="w-full text-left"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          opacity: hov ? 0.82 : 1,
          transition: "opacity 0.15s ease",
          padding: 0,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          {client.logo_url ? (
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                background: "white",
                borderRadius: 8,
                padding: "8px 12px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Image
                src={client.logo_url}
                alt={`Logo ${client.name}`}
                width={72}
                height={48}
                style={{ objectFit: "contain" }}
              />
            </div>
          ) : (
            <div
              className="shrink-0 flex items-center justify-center rounded-full font-mono font-bold"
              style={{
                width: 72,
                height: 72,
                background: "var(--color-arena)",
                color: "var(--color-bordo)",
                fontSize: 24,
              }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
          )}

          <span
            className="font-sans flex-1"
            style={{ fontWeight: 600, fontSize: 16, color: "var(--color-negro-bordo)" }}
          >
            {client.name}
          </span>

          <div
            className="shrink-0"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <ChevronDown size={18} style={{ color: "var(--color-gris-bordo)" }} />
          </div>
        </div>

        {/* Gold separator */}
        <div
          style={{
            height: 1,
            background: "var(--color-dorado)",
            margin: "14px 0 0",
            opacity: 0.5,
          }}
        />
      </button>

      {/* Expandable timeline */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 20 }}>
              {apariciones.length > 0 && (
                <ZigzagTimeline
                  apariciones={apariciones}
                  clientId={client.slug}
                />
              )}
              {apariciones.length === 0 && (
                <p
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.5, paddingBottom: 24 }}
                >
                  Próximamente — sin clippings cargados todavía
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Index button ─────────────────────────────────────────────────────────────

function IndexButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      className="font-sans cursor-pointer"
      style={{
        fontSize: 12,
        color: hov ? "var(--color-bordo)" : "var(--color-gris-bordo)",
        background: "transparent",
        border: `1px solid ${hov ? "rgba(201,168,130,0.8)" : "rgba(201,168,130,0.3)"}`,
        borderRadius: 20,
        padding: "8px 16px",
        transition: "color 0.15s ease, border-color 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

// ─── Toggle all button ────────────────────────────────────────────────────────

function ToggleAllButton({
  allExpanded,
  onToggle,
}: {
  allExpanded: boolean
  onToggle: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onToggle}
      className="font-sans shrink-0 cursor-pointer self-end"
      style={{
        fontSize: 12,
        color: "var(--color-bordo)",
        background: "transparent",
        border: `1px solid ${hov ? "var(--color-dorado)" : "rgba(201,168,130,0.5)"}`,
        borderRadius: 4,
        padding: "8px 16px",
        transition: "border-color 0.15s ease",
        whiteSpace: "nowrap",
        marginBottom: 4,
      }}
    >
      {allExpanded ? "Contraer todo" : "Expandir todo"}
    </button>
  )
}

// ─── Featured card (Bloque 2) ─────────────────────────────────────────────────

// ─── Main export ──────────────────────────────────────────────────────────────

export function CasosClient({
  content,
  clientsData,
}: {
  content?: { hero?: Record<string, string>; stats?: Record<string, string> }
  clientsData: ClientWithClippings[]
}) {
  const hero = { ...fallbacksFor("hero"), ...content?.hero }
  const statsContent = { ...fallbacksFor("stats"), ...content?.stats }
  const STATS = [1, 2, 3, 4].map((n) => ({
    n: statsContent[`stat_${n}_number`] ?? "",
    label: statsContent[`stat_${n}_label`] ?? "",
  }))
  const [openClients, setOpenClients] = useState<Set<string>>(new Set())
  const allExpanded = openClients.size === clientsData.length

  const handleIndexClick = (slug: string) => {
    setOpenClients((prev) => {
      if (prev.has(slug)) return prev
      return new Set([slug])
    })
    setTimeout(() => {
      document.getElementById(`cliente-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 40)
  }

  const handleHeaderToggle = (slug: string) => {
    setOpenClients((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const handleToggleAll = () => {
    if (allExpanded) {
      setOpenClients(new Set())
    } else {
      setOpenClients(new Set(clientsData.map(({ client }) => client.slug)))
    }
  }

  // Las destacadas del carrusel son una curaduría fija (ids de data/clippings.ts).
  const rotativo = useMemo(
    () => ROTATIVO_IDS.map((id) => CLIPPINGS.find((c) => c.id === id)!),
    []
  )

  return (
    <>
      {/* ── BLOQUE 1 — HERO ───────────────────────────────────────────────── */}
      <section
        className="relative bg-hueso overflow-hidden"
        style={{ paddingTop: 160, paddingBottom: 80 }}
      >
        <TextureOverlay texture="paperGrain" opacity={0.25} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            <motion.p
              variants={fadeUp}
              className="font-mono text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--color-bordo)" }}
            >
              {hero.eyebrow}
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-4 mb-4"
              style={{ width: 40, height: 1, background: "var(--color-dorado)" }}
            />
            <motion.h1
              variants={fadeUp}
              className="font-playfair font-bold leading-[1.1]"
              style={{
                color: "var(--color-negro-bordo)",
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                maxWidth: 700,
              }}
            >
              {hero.h1_pre}
              <br />
              <em className="italic" style={{ color: "var(--color-bordo)" }}>
                {hero.h1_accent}
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="font-sans mt-6"
              style={{ fontSize: 16, color: "var(--color-gris-bordo)", maxWidth: 560, lineHeight: 1.7 }}
            >
              {hero.description}
            </motion.p>
          </motion.div>

          {/* Stats — desktop */}
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="hidden sm:flex items-center gap-0 mt-[60px]"
          >
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={revealCard} className="flex items-center">
                {i > 0 && (
                  <div
                    className="self-stretch mx-8"
                    style={{ width: 1, background: "rgba(201,168,130,0.3)" }}
                  />
                )}
                <div>
                  <p className="font-playfair leading-none" style={{ fontSize: 48, color: "var(--color-bordo)" }}>
                    {s.n}
                  </p>
                  <p
                    className="font-mono text-[11px] uppercase mt-2"
                    style={{ color: "var(--color-gris-bordo)", letterSpacing: "0.12em" }}
                  >
                    {s.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats — mobile */}
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-8 mt-[60px] sm:hidden"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={revealCard}>
                <p className="font-playfair leading-none" style={{ fontSize: 36, color: "var(--color-bordo)" }}>
                  {s.n}
                </p>
                <p
                  className="font-mono text-[11px] uppercase mt-2"
                  style={{ color: "var(--color-gris-bordo)", letterSpacing: "0.12em", lineHeight: 1.4 }}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BLOQUE 2 — APARICIONES DESTACADAS (rotativo) ─────────────────── */}
      <section className="bg-bordo" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-mono uppercase mb-10"
            style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(254,252,239,0.5)" }}
          >
            Coberturas destacadas
          </motion.p>
          <DestacadasRotativo apariciones={rotativo} />
        </div>
      </section>

      {/* ── BLOQUE 3 — HISTORIAL DE APARICIONES ───────────────────────────── */}
      <section className="bg-hueso-oscuro" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Header + toggle all */}
          <div className="flex items-end justify-between gap-4 mb-10">
            <motion.div
              variants={fadeUpStagger}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <motion.p
                variants={fadeUp}
                className="font-mono uppercase"
                style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--color-bordo)" }}
              >
                Historial de cobertura
              </motion.p>
              <motion.div
                variants={fadeUp}
                style={{ width: 40, height: 1, background: "var(--color-dorado)", margin: "16px 0 20px" }}
              />
              <motion.h2
                variants={fadeUp}
                className="font-playfair font-bold"
                style={{ fontSize: "clamp(28px, 3vw, 36px)", color: "var(--color-negro-bordo)" }}
              >
                Coberturas por marca
              </motion.h2>
            </motion.div>

            <ToggleAllButton allExpanded={allExpanded} onToggle={handleToggleAll} />
          </div>

          {/* Client index */}
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex flex-wrap gap-2 mb-14"
          >
            {clientsData.map(({ client }) => (
              <motion.div key={client.slug} variants={fadeUp}>
                <IndexButton
                  label={client.name}
                  onClick={() => handleIndexClick(client.slug)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Timeline blocks */}
          <div className="flex flex-col gap-8">
            {clientsData.map(({ client, clippings }) => (
              <TimelineClientBlock
                key={client.slug}
                client={client}
                apariciones={clippings}
                isOpen={openClients.has(client.slug)}
                onToggle={() => handleHeaderToggle(client.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOQUE 4 — CTA ────────────────────────────────────────────────── */}
      <section className="bg-bordo" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-7xl mx-auto px-6 lg:px-12 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-playfair"
            style={{
              fontSize: "clamp(32px, 4vw, 44px)",
              color: "var(--color-hueso)",
              lineHeight: 1.2,
              fontWeight: 400,
            }}
          >
            ¿Querés resultados así
            <br />
            <em className="italic font-bold" style={{ color: "var(--color-dorado)" }}>
              para tu marca?
            </em>
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-10">
            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 font-sans font-semibold transition-opacity hover:opacity-85 group"
              style={{
                background: "var(--color-hueso)",
                color: "var(--color-bordo)",
                fontSize: 15,
                padding: "14px 36px",
                borderRadius: 999,
              }}
            >
              Conversemos
              <ArrowRight
                size={15}
                strokeWidth={2.5}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
