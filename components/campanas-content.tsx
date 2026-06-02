"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import {
  fadeUp, fadeUpStagger, revealCard, viewportOnce,
} from "@/lib/animations"
import { TextureOverlay } from "@/components/ui/texture-overlay"

// ─── Stats data ───────────────────────────────────────────────────────────────

const STATS = [
  { n: "3",          label: "campañas" },
  { n: "activas",    label: "ahora mismo" },
  { n: "Jun. 2026",  label: "última campaña" },
  { n: "+15",        label: "medios activados" },
] as const

// ─── Hero ─────────────────────────────────────────────────────────────────────

function CampanaHero() {
  return (
    <section
      className="relative bg-hueso overflow-hidden"
      style={{
        paddingTop:    "clamp(80px, 12vh, 140px)",
        paddingBottom: "clamp(60px, 8vh, 100px)",
      }}
    >
      <TextureOverlay texture="paperGrain" opacity={0.2} />
      <div
        className="relative max-w-7xl mx-auto"
        style={{ padding: "0 clamp(20px, 5vw, 64px)" }}
      >
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase"
            style={{
              fontSize:      11,
              letterSpacing: "0.15em",
              color:         "var(--color-bordo)",
              marginBottom:  14,
            }}
          >
            Campañas activas
          </motion.p>

          <motion.div
            variants={fadeUp}
            style={{
              width:        40,
              height:       1,
              background:   "var(--color-dorado)",
              marginBottom: 32,
            }}
          />

          <motion.h1 variants={fadeUp} style={{ margin: 0 }}>
            <span
              style={{
                display:    "block",
                fontFamily: "var(--font-playfair-display), serif",
                fontSize:   "clamp(1.6rem, 3.5vw, 2.8rem)",
                fontWeight: 600,
                color:      "var(--color-negro-bordo)",
                lineHeight: 1.15,
                opacity:    0.9,
              }}
            >
              Estrategias en acción.
            </span>
            <em
              style={{
                display:    "block",
                fontFamily: "var(--font-playfair-display), serif",
                fontSize:   "clamp(1.2rem, 2.5vw, 2rem)",
                fontStyle:  "italic",
                fontWeight: 700,
                color:      "var(--color-bordo)",
                lineHeight: 1.1,
              }}
            >
              Prensa que está pasando ahora.
            </em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-sans"
            style={{
              fontSize:   15,
              color:      "var(--color-gris-bordo)",
              lineHeight: 1.7,
              maxWidth:   520,
              marginTop:  24,
            }}
          >
            Campañas de prensa activas para marcas y proyectos
            que confían en nuestra gestión.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Stats band ───────────────────────────────────────────────────────────────

function CampanaStats() {
  return (
    <section className="bg-bordo" style={{ padding: "48px 0" }}>
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: "0 clamp(20px, 5vw, 64px)" }}
      >
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={revealCard}
              className="relative flex flex-col items-center text-center px-6 py-4"
            >
              {i < STATS.length - 1 && (
                <span
                  className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2"
                  style={{
                    width:      1,
                    height:     48,
                    background: "var(--color-dorado)",
                    opacity:    0.2,
                  }}
                />
              )}
              <p
                className="font-playfair leading-none"
                style={{
                  fontSize:   "clamp(36px, 4vw, 48px)",
                  color:      "var(--color-hueso)",
                  fontWeight: 700,
                }}
              >
                {s.n}
              </p>
              <p
                className="font-mono uppercase"
                style={{
                  fontSize:      11,
                  letterSpacing: "0.12em",
                  color:         "var(--color-hueso)",
                  opacity:       0.55,
                  marginTop:     12,
                }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Grid de campañas ─────────────────────────────────────────────────────────

function CampanaGrid() {
  return (
    <section className="bg-hueso-oscuro" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: "0 clamp(20px, 5vw, 64px)" }}
      >
        {/* Header */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col mb-12"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono uppercase"
            style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--color-bordo)" }}
          >
            En curso
          </motion.p>
          <motion.div
            variants={fadeUp}
            style={{
              width:        40,
              height:       1,
              background:   "var(--color-dorado)",
              margin:       "16px 0 20px",
            }}
          />
          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold"
            style={{
              fontSize: "clamp(28px, 3vw, 36px)",
              color:    "var(--color-negro-bordo)",
            }}
          >
            Campañas en curso
          </motion.h2>
        </motion.div>

        {/* Placeholder mientras no hay campañas cargadas */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          style={{
            padding:      60,
            textAlign:    "center",
            background:   "var(--color-hueso)",
            borderRadius: 16,
            border:       "1px dashed rgba(201, 168, 130, 0.3)",
          }}
        >
          <p
            className="font-sans"
            style={{
              fontSize:   15,
              color:      "var(--color-gris-bordo)",
              fontStyle:  "italic",
            }}
          >
            Las campañas se irán cargando próximamente.
          </p>
        </motion.div>

        {/*
          ESTRUCTURA de cada CampañaCard cuando se carguen campañas:

          <CampanaCard
            slug="nombre-marca"
            marca="Nombre Marca"
            titulo="Título de la campaña"
            estado="ACTIVA"
            fecha="Junio 2026"
            descripcion="Descripción de la campaña..."
            link="/campanas/nombre-marca"
          />
        */}
      </div>
    </section>
  )
}

// ─── CampañaCard (estructura lista para cuando se carguen campañas) ────────────

interface CampanaCardProps {
  slug: string
  marca: string
  titulo: string
  estado: "ACTIVA" | "FINALIZADA"
  fecha: string
  descripcion: string
  link?: string
}

export function CampanaCard({
  slug,
  marca,
  titulo,
  estado,
  fecha,
  descripcion,
  link,
}: CampanaCardProps) {
  const [hov, setHov] = useState(false)

  return (
    <motion.div
      variants={revealCard}
      id={`campana-${slug}`}
      style={{ scrollMarginTop: 100 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          background:    "var(--color-hueso)",
          borderRadius:  16,
          border:        `1px solid ${hov ? "rgba(102,0,31,0.12)" : "rgba(102,0,31,0.06)"}`,
          overflow:      "hidden",
          transform:     hov ? "translateY(-3px)" : "translateY(0)",
          boxShadow:     hov ? "0 8px 32px rgba(102,0,31,0.06)" : "none",
          transition:    "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          cursor:        link ? "pointer" : "default",
        }}
      >
        {/* Zona superior */}
        <div
          style={{
            padding:        "32px 36px 24px",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-start",
            gap:            16,
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              className="font-mono uppercase"
              style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
            >
              {marca}
            </p>
            <p
              className="font-playfair"
              style={{
                fontSize:   22,
                fontWeight: 600,
                color:      "var(--color-negro-bordo)",
                lineHeight: 1.3,
                marginTop:  8,
                maxWidth:   600,
              }}
            >
              {titulo}
            </p>
          </div>

          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <span
              className="font-mono uppercase"
              style={{
                fontSize:        10,
                letterSpacing:   "0.1em",
                borderRadius:    100,
                padding:         "5px 16px",
                display:         "inline-block",
                background:      estado === "ACTIVA" ? "var(--color-bordo)" : "var(--color-arena)",
                color:           estado === "ACTIVA" ? "var(--color-hueso)" : "var(--color-gris-bordo)",
              }}
            >
              {estado}
            </span>
            <p
              className="font-mono"
              style={{
                fontSize:  11,
                color:     "var(--color-gris-bordo)",
                opacity:   0.45,
                marginTop: 8,
              }}
            >
              {fecha}
            </p>
          </div>
        </div>

        {/* Zona inferior */}
        <div
          style={{
            padding:     "0 36px 32px",
            borderTop:   "1px solid rgba(201, 168, 130, 0.12)",
            paddingTop:  20,
          }}
        >
          <p
            className="font-sans"
            style={{
              fontSize:                14,
              color:                   "var(--color-gris-bordo)",
              lineHeight:              1.7,
              maxWidth:                640,
              overflow:                "hidden",
              display:                 "-webkit-box",
              WebkitLineClamp:         3,
              WebkitBoxOrient:         "vertical",
            } as React.CSSProperties}
          >
            {descripcion}
          </p>

          {link && (
            <Link
              href={link}
              className="font-sans"
              style={{
                fontSize:    14,
                color:       "var(--color-bordo)",
                fontWeight:  500,
                display:     "inline-flex",
                alignItems:  "center",
                gap:         hov ? 8 : 4,
                marginTop:   16,
                transition:  "gap 0.3s ease",
                textDecoration: "none",
              }}
            >
              Ver campaña completa
              <ArrowRight size={13} strokeWidth={2} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Sección de detalle vacía (preparada para campañas) ───────────────────────

function CampanaDetalle() {
  return (
    <section className="bg-hueso" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: "0 clamp(20px, 5vw, 64px)" }}
      >
        {/* Separador */}
        <div
          style={{
            width:        80,
            height:       1,
            background:   "var(--color-dorado)",
            opacity:      0.15,
            margin:       "0 auto 80px",
          }}
        />

        {/*
          ESTRUCTURA de cada sección de detalle:

          <div id="campana-{slug}" style={{ scrollMarginTop: 100 }}>
            <div style={{ display: "flex", gap: 40, alignItems: "center", marginBottom: 48 }}>
              Logo placeholder:
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "var(--color-bordo)", color: "var(--color-hueso)",
                display: "grid", placeItems: "center",
                fontFamily: "var(--font-playfair-display)", fontSize: 22, fontWeight: 700,
              }}>
                {inicial}
              </div>
              Texto:
              <div>
                <p font-mono 11px uppercase bordo>marca</p>
                <p font-playfair 28px negro-bordo lineHeight 1.25>título</p>
                <span font-mono 11px gris-bordo opacity 0.5>fecha + badge ACTIVA</span>
              </div>
            </div>

            <div style={{ maxWidth: 720 }}>
              Texto del comunicado con font-sans 15px gris-bordo lineHeight 1.85
              Subtítulos: Playfair 20px negro-bordo mt-10 mb-4
              Párrafos: mb-5
            </div>

            Galería placeholder:
            <div style={{ marginTop: 48, padding: "60px 40px", background: "var(--color-arena)", borderRadius: 12, textAlign: "center" }}>
              <p font-sans 14px gris-bordo italic>Fotos próximamente</p>
            </div>
          </div>
        */}

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="font-sans text-center"
          style={{
            fontSize:  14,
            color:     "var(--color-gris-bordo)",
            fontStyle: "italic",
            opacity:   0.5,
          }}
        >
          El detalle de cada campaña se publicará próximamente.
        </motion.p>
      </div>
    </section>
  )
}

// ─── CTA final ────────────────────────────────────────────────────────────────

function CampanaCta() {
  const [hov, setHov] = useState(false)

  return (
    <section
      className="relative"
      style={{
        background:  "radial-gradient(ellipse at 25% 40%, rgba(140,26,53,0.35) 0%, transparent 65%), var(--color-bordo)",
        padding:     "80px 0",
      }}
    >
      <motion.div
        variants={fadeUpStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="max-w-7xl mx-auto text-center"
        style={{ padding: "0 clamp(20px, 5vw, 64px)" }}
      >
        <motion.h2
          variants={fadeUp}
          className="font-playfair"
          style={{
            fontSize:   "clamp(24px, 4vw, 32px)",
            color:      "var(--color-hueso)",
            fontStyle:  "italic",
            lineHeight: 1.2,
            margin:     0,
          }}
        >
          ¿Tenés una historia para contar?
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans"
          style={{
            fontSize:  15,
            color:     "var(--color-hueso)",
            opacity:   0.6,
            marginTop: 12,
          }}
        >
          Hablemos de cómo llevarla a los medios.
        </motion.p>

        <motion.div variants={fadeUp}>
          <Link
            href="/contacto"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="font-sans inline-flex items-center gap-2"
            style={{
              marginTop:     32,
              display:       "inline-flex",
              alignItems:    "center",
              gap:           8,
              background:    "var(--color-hueso)",
              color:         "var(--color-bordo)",
              borderRadius:  100,
              padding:       "14px 36px",
              fontSize:      14,
              fontWeight:    600,
              textDecoration: "none",
              transform:     hov ? "translateY(-1px)" : "translateY(0)",
              boxShadow:     hov ? "0 4px 16px rgba(0,0,0,0.15)" : "none",
              transition:    "transform 0.25s ease, box-shadow 0.25s ease",
            }}
          >
            Conversemos
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function CampanasContent() {
  return (
    <>
      <CampanaHero />
      <CampanaStats />
      <CampanaGrid />
      <CampanaDetalle />
      <CampanaCta />
    </>
  )
}
