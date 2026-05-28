"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { CLIPPINGS, type Clipping } from "@/data/clippings"
import { fadeUp, fadeUpStagger, revealCard, viewportOnce } from "@/lib/animations"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { DestacadasRotativo } from "@/components/destacadas-rotativo"

// ─── Hero stats ───────────────────────────────────────────────────────────────

const STATS = [
  { n: "100+", label: "apariciones verificadas" },
  { n: "30+",  label: "medios distintos" },
  { n: "5",    label: "formatos cubiertos" },
  { n: "15",   label: "clientes activos" },
] as const

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

// ─── Timeline config ──────────────────────────────────────────────────────────

type TimelineCliente = {
  id: string
  label: string
  key: string
  logo: string | null
  inicial: string
}

const TIMELINE_CLIENTES: TimelineCliente[] = [
  { id: "bolsa-comercio",    label: "Bolsa de Comercio",         key: "Bolsa de Comercio de Mendoza",  logo: "/images/logos/logo-bolsa-comercio.png",    inicial: "B" },
  { id: "colegio-notarial",  label: "Colegio Notarial",          key: "Colegio Notarial de Mendoza",   logo: "/images/logos/logo-colegio-notarial.png",  inicial: "N" },
  { id: "grupo-presidente",  label: "Grupo Presidente",          key: "Grupo Presidente",              logo: "/images/logos/logo-presidente.png",        inicial: "P" },
  { id: "capilla-acutis",    label: "Capilla Carlo Acutis",      key: "Capilla Carlo Acutis",          logo: "/images/logos/logo-capilla-acutis.png",    inicial: "C" },
  { id: "dra-meneo",         label: "Dra. Elina Meneo",          key: "Dra. Elina Meneo",              logo: "/images/logos/logo-meneo.png",             inicial: "M" },
  { id: "chakaymanta",       label: "Esc. Vendimia Chakaymanta", key: "Esc. Vendimia Chakaymanta",     logo: "/images/logos/logo-chakaymanta.png",       inicial: "E" },
  { id: "quienvino",         label: "QuienVino App",             key: "QuienVino App",                 logo: "/images/logos/logo-quienvino.png",         inicial: "Q" },
  { id: "agrocosecha",       label: "Agrocosecha",               key: "Agrocosecha",                   logo: "/images/logos/logo-agrocosecha.png",       inicial: "A" },
  { id: "fuerza-silenciosa", label: "Fuerza Silenciosa",         key: "Fuerza Silenciosa",             logo: "/images/logos/logo-fuerza-silenciosa.jpg", inicial: "F" },
  { id: "mendoza-regenera",  label: "Mendoza Regenera",          key: "Mendoza Regenera",              logo: "/images/logos/logo-mendoza-regenera.png",  inicial: "M" },
  { id: "flor-mouradian",    label: "Flor Mouradian",            key: "Flor Mouradian",                logo: "/images/logos/logo-mfmc.png",              inicial: "F" },
]

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Timeline layout constants ────────────────────────────────────────────────

const COLS = 3
const ROW_H = 220      // px per grid row
const LINE_Y = 185     // y of zigzag line within each row (below cards)
const GAP = 24         // column gap

// ─── Timeline card ────────────────────────────────────────────────────────────

function TimelineCard({ ap }: { ap: Clipping }) {
  const borderColor = FORMAT_BORDER[ap.formato] ?? FORMAT_BORDER.Digital

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
          {ap.medio}
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
          {ap.alcance}
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
        {ap.titular}
      </p>

      <span
        className="font-mono"
        style={{ display: "block", marginTop: 6, fontSize: 10, color: "var(--color-gris-bordo)", opacity: 0.5 }}
      >
        {ap.año}
      </span>
    </div>
  )

  return ap.link ? (
    <a
      href={ap.link}
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
  apariciones: Clipping[]
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

  const sorted = useMemo(
    () =>
      [...apariciones].sort((a, b) =>
        b.año !== a.año ? b.año - a.año : b.id - a.id
      ),
    [apariciones]
  )

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
          const displayItems: (Clipping | null)[] = ltr
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
  config,
  apariciones,
  isOpen,
  onToggle,
}: {
  config: TimelineCliente
  apariciones: Clipping[]
  isOpen: boolean
  onToggle: () => void
}) {
  const [hov, setHov] = useState(false)

  return (
    <div
      id={`cliente-${config.id}`}
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
          {config.logo ? (
            <div
              className="shrink-0 flex items-center justify-center"
              style={{ width: 72, height: 72 }}
            >
              <Image
                src={config.logo}
                alt={`Logo ${config.label}`}
                width={72}
                height={72}
                style={{ objectFit: "contain", borderRadius: 6 }}
              />
            </div>
          ) : (
            // TODO: reemplazar por logo real
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
              {config.inicial}
            </div>
          )}

          <span
            className="font-sans flex-1"
            style={{ fontWeight: 600, fontSize: 16, color: "var(--color-negro-bordo)" }}
          >
            {config.label}
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
              <ZigzagTimeline
                apariciones={apariciones}
                clientId={config.id}
              />
              {apariciones.length === 0 && (
                <p
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.5, paddingBottom: 24 }}
                >
                  Próximamente
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

export function CasosClient() {
  const [openClients, setOpenClients] = useState<Set<string>>(new Set())
  const allExpanded = openClients.size === TIMELINE_CLIENTES.length

  const handleIndexClick = (id: string) => {
    setOpenClients((prev) => {
      if (prev.has(id)) return prev
      return new Set([id])
    })
    setTimeout(() => {
      document.getElementById(`cliente-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 40)
  }

  const handleHeaderToggle = (id: string) => {
    setOpenClients((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleAll = () => {
    if (allExpanded) {
      setOpenClients(new Set())
    } else {
      setOpenClients(new Set(TIMELINE_CLIENTES.map((c) => c.id)))
    }
  }

  const rotativo = useMemo(
    () => ROTATIVO_IDS.map((id) => CLIPPINGS.find((c) => c.id === id)!),
    []
  )

  const timelineData = useMemo(
    () =>
      TIMELINE_CLIENTES.map((config) => ({
        config,
        apariciones: CLIPPINGS.filter((c) => c.cliente === config.key),
      })),
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
              Casos de éxito
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
              El impacto de una buena estrategia
              <br />
              <em className="italic" style={{ color: "var(--color-bordo)" }}>
                se mide en presencia real.
              </em>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="font-sans mt-6"
              style={{ fontSize: 16, color: "var(--color-gris-bordo)", maxWidth: 560, lineHeight: 1.7 }}
            >
              Una selección de gestiones de prensa realizadas para marcas, empresas y
              profesionales que confiaron en la estrategia. Cada caso cuenta una historia.
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
            Apariciones destacadas
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
                Historial de apariciones
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
                Apariciones por cliente
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
            {TIMELINE_CLIENTES.map((c) => (
              <motion.div key={c.id} variants={fadeUp}>
                <IndexButton
                  label={c.label}
                  onClick={() => handleIndexClick(c.id)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Timeline blocks */}
          <div className="flex flex-col gap-8">
            {timelineData.map(({ config, apariciones }) => (
              <TimelineClientBlock
                key={config.id}
                config={config}
                apariciones={apariciones}
                isOpen={openClients.has(config.id)}
                onToggle={() => handleHeaderToggle(config.id)}
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
              href="/contacto"
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
