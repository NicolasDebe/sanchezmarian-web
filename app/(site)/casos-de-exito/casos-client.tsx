"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { ArrowRight, ChevronDown, Headphones } from "lucide-react"
import { CLIPPINGS } from "@/data/clippings"
import { AudioPlayer } from "@/components/audio-player"
import {
  SCOPE_LABELS,
  clippingYear,
  type ClientWithClippings,
  type DbClient,
  type DbClipping,
} from "@/lib/clippings"
import { fadeUp, fadeUpStagger, revealCard, viewportOnce, springSnappy, tapScale } from "@/lib/animations"
import { MotionLink } from "@/components/ui/motion-link"
import { RichText } from "@/components/ui/RichText"
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

// ─── Timeline card ────────────────────────────────────────────────────────────

function TimelineCard({ ap }: { ap: DbClipping }) {
  const borderColor = FORMAT_BORDER[ap.format] ?? FORMAT_BORDER.Digital
  const hasAudio = !!ap.audio_url
  const hasUrl = !!ap.url

  // Imagen de la tarjeta: OG del enlace o subida propia. Si no hay ninguna, no
  // se renderiza NADA (ni placeholder ni hueco): la tarjeta queda como siempre.
  const imageEl = ap.image_url ? (
    <div
      style={{
        marginBottom: 14,
        borderRadius: 6,
        overflow: "hidden",
        aspectRatio: "16 / 9",
        background: "var(--color-arena)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ap.image_url}
        alt=""
        loading="lazy"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        // Si la imagen (típicamente una OG remota) no carga o dejó de existir,
        // ocultamos el contenedor: la tarjeta colapsa a su diseño de solo texto,
        // sin caja vacía. Respeta la regla "sin imagen = diseño de siempre".
        onError={(e) => {
          const box = e.currentTarget.parentElement
          if (box) box.style.display = "none"
        }}
      />
    </div>
  ) : null

  const head = (
    <div className="flex items-start justify-between gap-2" style={{ marginBottom: 6 }}>
      <span
        className="font-mono uppercase"
        style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.12em", color: "var(--color-bordo)" }}
      >
        {ap.medium}
      </span>
      <span
        className="font-mono shrink-0"
        style={{
          fontSize: "calc(8px * var(--text-scale))",
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
  )

  const titleEl = (
    <p
      className="font-sans"
      style={{
        fontSize: "var(--fs-caption)",
        color: "var(--color-negro-bordo)",
        lineHeight: "var(--lh-base)",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      } as React.CSSProperties}
    >
      {ap.title}
    </p>
  )

  const yearEl = (
    <span
      className="font-mono"
      style={{ display: "block", marginTop: 6, fontSize: "var(--fs-micro)", color: "var(--color-gris-bordo)", opacity: 0.5 }}
    >
      {clippingYear(ap.published_at)}
    </span>
  )

  // ── Con audio: card NO clickeable (el player es interactivo) ──
  if (hasAudio) {
    return (
      <div
        style={{
          background: "var(--color-hueso)",
          borderRadius: 8,
          padding: "16px 20px",
          borderLeft: `2px solid ${borderColor}`,
        }}
      >
        {imageEl}
        {/* Badge de tipo */}
        <div
          className="flex items-center gap-1 font-mono uppercase"
          style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.1em", color: "var(--color-bordo)", marginBottom: 8 }}
        >
          <Headphones size={11} />
          {hasUrl ? "Audio + Nota" : "Audio"}
        </div>

        {head}
        {titleEl}

        <AudioPlayer src={ap.audio_url!} duration={ap.audio_duration_seconds} variant="full" />

        {hasUrl && (
          <a
            href={ap.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono inline-flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ marginTop: 10, fontSize: "var(--fs-eyebrow)", color: "var(--color-bordo)" }}
          >
            Ver nota original →
          </a>
        )}

        {yearEl}
      </div>
    )
  }

  // Filete dorado + año (footer de la variante editorial).
  const footerEl = (
    <div className="flex items-center gap-3" style={{ marginTop: 18 }}>
      <span aria-hidden style={{ width: 28, height: 1, background: "var(--color-dorado)" }} />
      <span
        className="font-mono"
        style={{ fontSize: "var(--fs-micro)", color: "var(--color-gris-bordo)", letterSpacing: "0.08em" }}
      >
        {clippingYear(ap.published_at)}
      </span>
    </div>
  )

  // ── Solo URL (o sin acción): card clickeable ──
  // Con imagen → diseño compacto de siempre. Sin imagen → "cita editorial":
  // fondo arena, titular Playfair serif grande y comilla dorada, para que la
  // tarjeta tenga presencia y no se lea como un hueco entre las fotos del muro.
  const inner = ap.image_url ? (
    <div
      style={{
        background: "var(--color-hueso)",
        borderRadius: 8,
        padding: "16px 20px",
        borderLeft: `2px solid ${borderColor}`,
      }}
    >
      {imageEl}
      {head}
      {titleEl}
      {yearEl}
    </div>
  ) : (
    <div
      className="flex flex-col"
      style={{
        background: "var(--color-arena)",
        borderRadius: 8,
        padding: "24px 24px 22px",
        borderLeft: `2px solid ${borderColor}`,
      }}
    >
      {/* Head editorial: medio + alcance (badge con tinte bordó para contrastar
          sobre el fondo arena). */}
      <div className="flex items-start justify-between gap-2" style={{ marginBottom: 4 }}>
        <span
          className="font-mono uppercase"
          style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.12em", color: "var(--color-bordo)" }}
        >
          {ap.medium}
        </span>
        <span
          className="font-mono shrink-0"
          style={{
            fontSize: "calc(8px * var(--text-scale))",
            padding: "2px 6px",
            borderRadius: 4,
            background: "rgba(102,0,31,0.10)",
            color: "var(--color-bordo)",
            whiteSpace: "nowrap",
          }}
        >
          {SCOPE_LABELS[ap.scope] ?? ap.scope}
        </span>
      </div>

      {/* Comilla decorativa. */}
      <span
        aria-hidden
        className="font-playfair"
        style={{
          fontSize: "calc(44px * var(--text-scale))",
          lineHeight: 0.7,
          color: "var(--color-dorado)",
          marginTop: 8,
        }}
      >
        &ldquo;
      </span>

      {/* Titular serif tipo cita. */}
      <p
        className="font-playfair"
        style={{
          fontSize: "var(--fs-lead)",
          color: "var(--color-negro-bordo)",
          lineHeight: "var(--lh-snug)",
          marginTop: 6,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 6,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {ap.title}
      </p>

      {footerEl}
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

// ─── Client timeline (masonry) ────────────────────────────────────────────────
// Muro de tarjetas tipo masonry: tolera alturas variables (tarjetas con imagen
// y sin imagen conviven) sin dejar huecos, y respira más que el zigzag anterior.
// Responsive por column-count: 1 (mobile) · 2 (sm) · 3 (lg). Cada tarjeta entra
// con un fade-up escalonado cuando el bloque del cliente se despliega.

function ClientTimeline({ apariciones }: { apariciones: DbClipping[] }) {
  if (apariciones.length === 0) return null

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 [column-gap:24px]">
      {apariciones.map((ap, i) => (
        <motion.div
          key={ap.id}
          className="mb-6 break-inside-avoid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + Math.min(i, 10) * 0.06, duration: 0.4, ease: EASE }}
        >
          <TimelineCard ap={ap} />
        </motion.div>
      ))}
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
                fontSize: "calc(24px * var(--text-scale))",
              }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
          )}

          <span
            className="font-sans flex-1"
            style={{ fontWeight: 600, fontSize: "var(--fs-body-lg)", color: "var(--color-negro-bordo)" }}
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
            // Colapso (exit) más rápido que la apertura (~60%).
            exit={{ height: 0, opacity: 0, transition: { duration: 0.22, ease: "easeIn" } }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 20 }}>
              {apariciones.length > 0 && (
                <ClientTimeline apariciones={apariciones} />
              )}
              {apariciones.length === 0 && (
                <p
                  className="font-mono"
                  style={{ fontSize: "var(--fs-eyebrow)", color: "var(--color-gris-bordo)", opacity: 0.5, paddingBottom: 24 }}
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
        fontSize: "var(--fs-eyebrow)",
        color: hov ? "var(--color-bordo)" : "var(--color-gris-bordo)",
        background: "transparent",
        border: `1px solid ${hov ? "rgba(201,168,130,0.8)" : "rgba(201,168,130,0.3)"}`,
        borderRadius: 22,
        // Área táctil ≥44px (mobile): minHeight + centrado flex.
        minHeight: 44,
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 18px",
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
        fontSize: "var(--fs-eyebrow)",
        color: "var(--color-bordo)",
        background: "transparent",
        border: `1px solid ${hov ? "var(--color-dorado)" : "rgba(201,168,130,0.5)"}`,
        borderRadius: 4,
        // Área táctil ≥44px (mobile): minHeight + centrado flex.
        minHeight: 44,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 16px",
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
  // El primer cliente arranca expandido por default (el resto colapsado), para
  // que la sección no se vea vacía y se entienda el patrón de acordeón.
  const [openClients, setOpenClients] = useState<Set<string>>(
    () => new Set(clientsData[0] ? [clientsData[0].client.slug] : []),
  )
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
        style={{ paddingTop: "clamp(120px, 20vw, 160px)", paddingBottom: 80 }}
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
              className="font-mono uppercase tracking-[0.22em]"
              style={{ color: "var(--color-bordo)", fontSize: "var(--fs-eyebrow)" }}
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
                fontSize: "var(--fs-h1)",
                maxWidth: 700,
              }}
            >
              {hero.h1_pre}
              <br />
              <em className="italic" style={{ color: "var(--color-bordo)" }}>
                {hero.h1_accent}
              </em>
            </motion.h1>
            <motion.div
              variants={fadeUp}
              className="font-sans mt-6"
              style={{ fontSize: "var(--fs-body-lg)", color: "var(--color-gris-bordo)", maxWidth: 560, lineHeight: "var(--lh-relaxed)" }}
            >
              <RichText html={hero.description} className="rich-inline" />
            </motion.div>
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
                  <p className="font-playfair leading-none" style={{ fontSize: "calc(48px * var(--text-scale))", color: "var(--color-bordo)" }}>
                    {s.n}
                  </p>
                  <p
                    className="font-mono uppercase mt-2"
                    style={{ color: "var(--color-gris-bordo)", letterSpacing: "0.12em", fontSize: "var(--fs-eyebrow)" }}
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
                <p className="font-playfair leading-none" style={{ fontSize: "calc(36px * var(--text-scale))", color: "var(--color-bordo)" }}>
                  {s.n}
                </p>
                <p
                  className="font-mono uppercase mt-2"
                  style={{ color: "var(--color-gris-bordo)", letterSpacing: "0.12em", lineHeight: 1.4, fontSize: "var(--fs-eyebrow)" }}
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
            style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.2em", color: "rgba(254,252,239,0.5)" }}
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
                style={{ fontSize: "var(--fs-micro)", letterSpacing: "0.2em", color: "var(--color-bordo)" }}
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
                style={{ fontSize: "var(--fs-h2)", color: "var(--color-negro-bordo)" }}
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
            className="flex flex-wrap gap-3 mb-14"
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
              fontSize: "var(--fs-h2)",
              color: "var(--color-hueso)",
              lineHeight: "var(--lh-snug)",
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
            <MotionLink
              href="/#contacto"
              whileTap={{ scale: tapScale }}
              transition={springSnappy}
              className="inline-flex items-center gap-2 font-sans font-semibold transition-opacity hover:opacity-85 group"
              style={{
                background: "var(--color-hueso)",
                color: "var(--color-bordo)",
                fontSize: "var(--fs-body)",
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
            </MotionLink>
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
