"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import {
  fadeUp, fadeUpStagger, revealCard, viewportOnce,
} from "@/lib/animations"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { CampaignSlideshow } from "@/components/campaign-slideshow"
import type { Campaign } from "@/lib/types/campaign"

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
            style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--color-bordo)", marginBottom: 14 }}
          >
            Campañas activas
          </motion.p>

          <motion.div
            variants={fadeUp}
            style={{ width: 40, height: 1, background: "var(--color-dorado)", marginBottom: 32 }}
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
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.7, maxWidth: 520, marginTop: 24 }}
          >
            Campañas activas para marcas personales y empresas
            que confían en mi trabajo.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Stats band ───────────────────────────────────────────────────────────────

function CampanaStats({ campaigns }: { campaigns: Campaign[] }) {
  const active   = campaigns.filter(c => c.status === "ACTIVA").length
  const lastDate = campaigns[0]?.date ?? "—"

  const STATS = [
    { n: String(campaigns.length), label: "campañas" },
    { n: String(active),           label: "activas ahora mismo" },
    { n: lastDate,                 label: "última campaña" },
    { n: "+15",                    label: "medios activados" },
  ]

  return (
    <section className="bg-bordo" style={{ padding: "48px 0" }}>
      <div className="max-w-7xl mx-auto" style={{ padding: "0 clamp(20px, 5vw, 64px)" }}>
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
                  style={{ width: 1, height: 48, background: "var(--color-dorado)", opacity: 0.2 }}
                />
              )}
              <p
                className="font-playfair leading-none"
                style={{ fontSize: "clamp(36px, 4vw, 48px)", color: "var(--color-hueso)", fontWeight: 700 }}
              >
                {s.n}
              </p>
              <p
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-hueso)", opacity: 0.55, marginTop: 12 }}
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

// ─── Card de campaña ──────────────────────────────────────────────────────────

interface CampanaCardProps {
  marca: string
  titulo: string
  estado: "ACTIVA" | "FINALIZADA"
  fecha: string
  descripcion: string
  scrollTarget?: string
}

function CampanaCard({ marca, titulo, estado, fecha, descripcion, scrollTarget }: CampanaCardProps) {
  const [hov, setHov] = useState(false)

  function handleScroll(e: React.MouseEvent) {
    e.preventDefault()
    if (!scrollTarget) return
    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <motion.div
      variants={revealCard}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        style={{
          background:   "var(--color-hueso)",
          borderRadius: 16,
          border:       `1px solid ${hov ? "rgba(102,0,31,0.12)" : "rgba(102,0,31,0.06)"}`,
          overflow:     "hidden",
          transform:    hov ? "translateY(-3px)" : "translateY(0)",
          boxShadow:    hov ? "0 8px 32px rgba(102,0,31,0.06)" : "none",
          transition:   "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            padding:        "32px clamp(20px, 3vw, 36px) 24px",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-start",
            gap:            16,
            flexWrap:       "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className="font-mono uppercase"
              style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
            >
              {marca}
            </p>
            <p
              className="font-playfair"
              style={{ fontSize: 22, fontWeight: 600, color: "var(--color-negro-bordo)", lineHeight: 1.3, marginTop: 8, maxWidth: 600 }}
            >
              {titulo}
            </p>
          </div>

          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <span
              className="font-mono uppercase"
              style={{
                fontSize:      10,
                letterSpacing: "0.1em",
                borderRadius:  100,
                padding:       "5px 16px",
                display:       "inline-block",
                background:    estado === "ACTIVA" ? "var(--color-bordo)" : "var(--color-arena)",
                color:         estado === "ACTIVA" ? "var(--color-hueso)" : "var(--color-gris-bordo)",
              }}
            >
              {estado}
            </span>
            <p
              className="font-mono"
              style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.45, marginTop: 8 }}
            >
              {fecha}
            </p>
          </div>
        </div>

        <div
          style={{
            padding:    "0 clamp(20px, 3vw, 36px) 32px",
            borderTop:  "1px solid rgba(201, 168, 130, 0.12)",
            paddingTop: 20,
          }}
        >
          <p
            className="font-sans"
            style={{
              fontSize:            14,
              color:               "var(--color-gris-bordo)",
              lineHeight:          1.7,
              maxWidth:            640,
              overflow:            "hidden",
              display:             "-webkit-box",
              WebkitLineClamp:     3,
              WebkitBoxOrient:     "vertical",
            } as React.CSSProperties}
          >
            {descripcion}
          </p>

          {scrollTarget && (
            <button
              onClick={handleScroll}
              className="font-sans"
              style={{
                fontSize:   14,
                color:      "var(--color-bordo)",
                fontWeight: 500,
                display:    "inline-flex",
                alignItems: "center",
                gap:        hov ? 8 : 4,
                marginTop:  16,
                transition: "gap 0.3s ease",
                background: "none",
                border:     "none",
                cursor:     "pointer",
                padding:    0,
              }}
            >
              Ver campaña completa
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Grid de campañas ─────────────────────────────────────────────────────────

function CampanaGrid({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <section className="bg-hueso-oscuro" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div className="max-w-7xl mx-auto" style={{ padding: "0 clamp(20px, 5vw, 64px)" }}>

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
            style={{ width: 40, height: 1, background: "var(--color-dorado)", margin: "16px 0 20px" }}
          />
          <motion.h2
            variants={fadeUp}
            className="font-playfair font-bold"
            style={{ fontSize: "clamp(28px, 3vw, 36px)", color: "var(--color-negro-bordo)" }}
          >
            Campañas en curso
          </motion.h2>
        </motion.div>

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col"
          style={{ gap: 24 }}
        >
          {campaigns.map((c) => (
            <CampanaCard
              key={c.id}
              marca={c.brand}
              titulo={c.title}
              estado={c.status}
              fecha={c.date}
              descripcion={c.description}
              scrollTarget={`campana-${c.slug}`}
            />
          ))}
        </motion.div>

      </div>
    </section>
  )
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

function CampanaEmpty() {
  const [hov, setHov] = useState(false)

  return (
    <section
      className="bg-hueso-oscuro"
      style={{ padding: "clamp(80px, 14vh, 140px) clamp(20px, 5vw, 64px)" }}
    >
      <div className="max-w-7xl mx-auto" style={{ textAlign: "center" }}>
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col items-center"
        >
          <motion.div
            variants={fadeUp}
            style={{ width: 40, height: 1, background: "var(--color-dorado)", marginBottom: 32 }}
          />

          <motion.p
            variants={fadeUp}
            className="font-playfair"
            style={{
              fontSize:   "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 600,
              color:      "var(--color-negro-bordo)",
              lineHeight: 1.3,
              marginBottom: 12,
            }}
          >
            Próximamente nuevas campañas.
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.7, maxWidth: 420, marginBottom: 40 }}
          >
            Estamos preparando las próximas estrategias. Si tenés una historia para contar, empezá hoy.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link
              href="/#contacto"
              onMouseEnter={() => setHov(true)}
              onMouseLeave={() => setHov(false)}
              className="font-sans inline-flex items-center gap-2"
              style={{
                border:         "1.5px solid rgba(102,0,31,0.25)",
                borderRadius:   100,
                padding:        "12px 28px",
                fontSize:       14,
                color:          "var(--color-bordo)",
                fontWeight:     500,
                textDecoration: "none",
                background:     hov ? "rgba(102,0,31,0.04)" : "transparent",
                transition:     "background 0.25s ease",
              }}
            >
              Conversemos
              <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Detalle genérico (datos de Supabase) ─────────────────────────────────────

function CampanaDetail({ campaign, index }: { campaign: Campaign; index: number }) {
  const bg     = index % 2 === 0 ? "bg-hueso" : "bg-hueso-oscuro"
  const images = (campaign.images ?? [])
    .sort((a, b) => a.position - b.position)
    .map(img => ({ src: img.url, alt: img.alt }))

  const initial = campaign.brand.trim()[0]?.toUpperCase() ?? "?"

  return (
    <section
      id={`campana-${campaign.slug}`}
      className={bg}
      style={{ scrollMarginTop: 80 }}
    >
      {index > 0 && (
        <div style={{ textAlign: "center", padding: "60px 0 0" }}>
          <div
            style={{
              width:      80,
              height:     1,
              background: "var(--color-dorado)",
              opacity:    0.15,
              margin:     "0 auto",
            }}
          />
        </div>
      )}

      <div
        className="max-w-7xl mx-auto"
        style={{ padding: "clamp(48px, 8vh, 80px) clamp(20px, 5vw, 64px) clamp(60px, 10vh, 120px)" }}
      >
        {/* Header */}
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-start sm:items-center"
            style={{ gap: "clamp(16px, 3vw, 40px)", marginBottom: 40 }}
          >
            <div
              className="font-playfair"
              style={{
                width:        56,
                height:       56,
                borderRadius: "50%",
                background:   "var(--color-bordo)",
                color:        "var(--color-hueso)",
                display:      "grid",
                placeItems:   "center",
                fontSize:     24,
                fontWeight:   700,
                flexShrink:   0,
              }}
            >
              {initial}
            </div>

            <div>
              <p
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
              >
                {campaign.brand}
              </p>
              <p
                className="font-playfair"
                style={{
                  fontSize:   "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 600,
                  color:      "var(--color-negro-bordo)",
                  lineHeight: 1.25,
                  marginTop:  8,
                  maxWidth:   700,
                }}
              >
                {campaign.title}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <span
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.5 }}
                >
                  {campaign.date}
                </span>
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize:      10,
                    letterSpacing: "0.1em",
                    borderRadius:  100,
                    padding:       "3px 12px",
                    background:    campaign.status === "ACTIVA" ? "var(--color-bordo)" : "var(--color-arena)",
                    color:         campaign.status === "ACTIVA" ? "var(--color-hueso)" : "var(--color-gris-bordo)",
                  }}
                >
                  {campaign.status}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ width: 60, height: 1, background: "var(--color-dorado)", marginBottom: 40 }}
          />
        </motion.div>

        {/* Contenido HTML */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          style={{ maxWidth: 720 }}
        >
          <style>{`
            .campana-prose p          { font-size: 15px; color: var(--color-gris-bordo); line-height: 1.85; margin-bottom: 20px; }
            .campana-prose p.lead     { font-size: 17px; color: var(--color-negro-bordo); line-height: 1.8; font-weight: 400; margin-bottom: 40px; padding-left: clamp(16px,3vw,20px); border-left: 2px solid rgba(201,168,130,0.4); }
            .campana-prose h3         { font-family: var(--font-playfair-display), serif; font-size: 20px; color: var(--color-negro-bordo); font-style: italic; margin-top: 48px; margin-bottom: 16px; }
            .campana-prose blockquote { padding: clamp(16px,3vw,24px) clamp(20px,3vw,28px); background: var(--color-arena); border-radius: 12px; border-left: 3px solid var(--color-bordo); margin: 0 0 32px; }
            .campana-prose blockquote p { font-style: italic; }
            .campana-prose blockquote footer { font-family: var(--font-dm-mono), monospace; font-size: 10px; color: var(--color-bordo); opacity: 0.6; margin-top: 10px; }
            .campana-prose blockquote.dark  { background: var(--color-bordo); border: none; }
            .campana-prose blockquote.dark p { color: var(--color-hueso); }
            .campana-prose blockquote.dark footer { color: var(--color-hueso); }
          `}</style>
          <div
            className="campana-prose"
            dangerouslySetInnerHTML={{ __html: campaign.content }}
          />
        </motion.div>

        {images.length > 0 && (
          <CampaignSlideshow campaignName={campaign.brand} images={images} />
        )}
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
        background: "radial-gradient(ellipse at 25% 40%, rgba(140,26,53,0.35) 0%, transparent 65%), var(--color-bordo)",
        padding:    "80px 0",
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
          style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "var(--color-hueso)", fontStyle: "italic", lineHeight: 1.2, margin: 0 }}
        >
          ¿Tenés una historia para contar?
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans"
          style={{ fontSize: 15, color: "var(--color-hueso)", opacity: 0.6, marginTop: 12 }}
        >
          Hablemos de cómo llevarla a los medios.
        </motion.p>

        <motion.div variants={fadeUp}>
          <Link
            href="/#contacto"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="font-sans inline-flex items-center gap-2"
            style={{
              marginTop:      32,
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              background:     "var(--color-hueso)",
              color:          "var(--color-bordo)",
              borderRadius:   100,
              padding:        "14px 36px",
              fontSize:       14,
              fontWeight:     600,
              textDecoration: "none",
              transform:      hov ? "translateY(-1px)" : "translateY(0)",
              boxShadow:      hov ? "0 4px 16px rgba(0,0,0,0.15)" : "none",
              transition:     "transform 0.25s ease, box-shadow 0.25s ease",
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

export function CampanasContent({ campaigns = [] }: { campaigns?: Campaign[] }) {
  return (
    <>
      <CampanaHero />
      <CampanaStats campaigns={campaigns} />
      {campaigns.length === 0 ? (
        <>
          <CampanaEmpty />
        </>
      ) : (
        <>
          <CampanaGrid campaigns={campaigns} />
          {campaigns.map((c, i) => (
            <CampanaDetail key={c.id} campaign={c} index={i} />
          ))}
        </>
      )}
      <CampanaCta />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCIA — Secciones hardcodeadas originales (pre-Supabase)
// Conservadas para guiar el seed de datos y como fallback visual.
// No eliminar hasta confirmar que el seed reproduce fielmente el diseño.
// ─────────────────────────────────────────────────────────────────────────────

/*
const STATS_HARDCODED = [
  { n: "3",          label: "campañas" },
  { n: "activas",    label: "ahora mismo" },
  { n: "Jun. 2026",  label: "última campaña" },
  { n: "+15",        label: "medios activados" },
]

const MODELOS_LYNKCO = [
  {
    nombre: "Lynk & Co 01",
    desc: "El SUV que inaugura la experiencia premium, equilibrando versatilidad, eficiencia y diseño atemporal.",
  },
  {
    nombre: "Lynk & Co 06",
    desc: "Mayor refinamiento interior y dinámica de conducción deportiva, pensado para quienes buscan destacarse.",
  },
  {
    nombre: "Lynk & Co 08",
    desc: "El flagship. Lujo, espacio y tecnología sin límites para el segmento ejecutivo que busca confort superior.",
  },
]

const PILLS_LYNKCO    = ["PHEV", "5★ Euro NCAP", "Diseño escandinavo"]
const PILLS_MATERIALES = ["Ladrillos", "Hierro", "Cemento"]

function LynkCoGrupoPresidente() { ... }  // ver git history para código completo
function BolsaComercioMosto()    { ... }
function CapillaCarloAcutis()    { ... }
*/
