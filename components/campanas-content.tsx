"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import {
  fadeUp, fadeUpStagger, revealCard, viewportOnce,
} from "@/lib/animations"
import { TextureOverlay } from "@/components/ui/texture-overlay"
import { STATUS_LABELS, type Campaign, type CampaignStatus } from "@/lib/types/campaign"
import { hasHtmlTags, htmlToPlainText } from "@/lib/rich-text"

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
  const active   = campaigns.filter(c => c.status === "active").length
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
          {STATS.map((s, i) => {
            // El stat "última campaña" es una fecha de texto largo ("Junio 2026"):
            // a tamaño de número gigante desborda la celda de 2 columnas en mobile.
            const isText = /[a-zA-Z]/.test(s.n)
            return (
            <motion.div
              key={s.label}
              variants={revealCard}
              className="relative flex flex-col items-center text-center px-3 sm:px-6 py-4"
            >
              {i < STATS.length - 1 && (
                <span
                  className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2"
                  style={{ width: 1, height: 48, background: "var(--color-dorado)", opacity: 0.2 }}
                />
              )}
              <p
                className="font-playfair leading-none"
                style={{
                  fontSize: isText ? "clamp(22px, 3vw, 34px)" : "clamp(34px, 4vw, 48px)",
                  color: "var(--color-hueso)",
                  fontWeight: 700,
                }}
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
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Card de campaña ──────────────────────────────────────────────────────────

const BADGE_STYLES: Record<CampaignStatus, React.CSSProperties> = {
  draft:    { background: "var(--color-arena)",        color: "var(--color-gris-bordo)" },
  active:   { background: "var(--color-bordo)",        color: "var(--color-hueso)" },
  finished: { background: "var(--color-bordo-oscuro)", color: "var(--color-hueso)" },
}

interface FeaturedImage {
  url: string
  alt: string
}

interface CampanaCardProps {
  marca: string
  titulo: string
  estado: CampaignStatus
  fecha: string
  descripcion: string
  href: string
  featuredImage: FeaturedImage | null
  priority?: boolean
}

// Placeholder mostrado cuando la campaña aún no tiene fotos cargadas:
// fondo --arena + ícono de imagen sutil en --dorado a 0.3 de opacidad.
function ImagePlaceholder({ size = 40 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width:           "100%",
        height:          "100%",
        background:      "var(--color-arena)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-dorado)"
        strokeWidth="1.5"
        style={{ opacity: 0.3 }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="var(--color-dorado)" stroke="none" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  )
}

function CampanaCard({
  marca, titulo, estado, fecha, descripcion, href,
  featuredImage, priority = false,
}: CampanaCardProps) {
  const [hov, setHov] = useState(false)

  const altText = featuredImage?.alt?.trim() || titulo

  return (
    <motion.div variants={revealCard}>
      <Link
        href={href}
        aria-label={`Ver campaña completa: ${titulo}`}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onFocus={() => setHov(true)}
        onBlur={() => setHov(false)}
        className="campana-card-link block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-bordo"
        style={{
          background:     "var(--color-hueso)",
          borderRadius:   16,
          border:         `1px solid ${hov ? "rgba(102,0,31,0.12)" : "rgba(102,0,31,0.06)"}`,
          overflow:       "hidden",
          transform:      hov ? "translateY(-3px)" : "translateY(0)",
          boxShadow:      hov ? "0 12px 32px -8px rgba(102, 0, 31, 0.12)" : "none",
          transition:     "transform 500ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1), border-color 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          textDecoration: "none",
          color:          "inherit",
        }}
      >
        {/* ─── DESKTOP layout (≥768px): grid 40% imagen / 60% texto ─── */}
        <div className="hidden md:grid md:grid-cols-[40%_60%]">
          <div
            className="relative"
            style={{ aspectRatio: "4 / 3", overflow: "hidden" }}
          >
            {featuredImage ? (
              <Image
                src={featuredImage.url}
                alt={altText}
                fill
                sizes="(max-width: 768px) 96px, 40vw"
                priority={priority}
                style={{
                  objectFit:  "cover",
                  transform:  hov ? "scale(1.04)" : "scale(1)",
                  transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ) : (
              <ImagePlaceholder size={48} />
            )}
          </div>

          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              padding:       "32px clamp(24px, 3vw, 40px) 32px 40px",
            }}
          >
            <div
              style={{
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "flex-start",
                gap:            16,
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
                  style={{ fontSize: 22, fontWeight: 600, color: "var(--color-negro-bordo)", lineHeight: 1.3, marginTop: 8 }}
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
                    ...BADGE_STYLES[estado],
                  }}
                >
                  {STATUS_LABELS[estado]}
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
                borderTop:  "1px solid rgba(201, 168, 130, 0.12)",
                marginTop:  20,
                paddingTop: 20,
              }}
            >
              <p
                className="font-sans"
                style={{
                  fontSize:        14,
                  color:           "var(--color-gris-bordo)",
                  lineHeight:      1.7,
                  overflow:        "hidden",
                  display:         "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                } as React.CSSProperties}
              >
                {descripcion}
              </p>

              <span
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
                }}
              >
                Ver campaña completa
                <ArrowRight size={13} strokeWidth={2} />
              </span>
            </div>
          </div>
        </div>

        {/* ─── MOBILE layout (<768px): thumbnail 96x96 + texto ─── */}
        <div
          className="md:hidden"
          style={{ padding: "20px clamp(20px, 4vw, 28px)" }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div
              style={{
                width:        96,
                height:       96,
                flexShrink:   0,
                borderRadius: 8,
                overflow:     "hidden",
                position:     "relative",
              }}
            >
              {featuredImage ? (
                <Image
                  src={featuredImage.url}
                  alt={altText}
                  fill
                  sizes="96px"
                  priority={priority}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <ImagePlaceholder size={28} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "flex-start",
                  gap:            8,
                }}
              >
                <p
                  className="font-mono uppercase"
                  style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
                >
                  {marca}
                </p>
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize:      9,
                    letterSpacing: "0.1em",
                    borderRadius:  100,
                    padding:       "4px 12px",
                    display:       "inline-block",
                    flexShrink:    0,
                    ...BADGE_STYLES[estado],
                  }}
                >
                  {STATUS_LABELS[estado]}
                </span>
              </div>
              <p
                className="font-playfair"
                style={{ fontSize: 18, fontWeight: 600, color: "var(--color-negro-bordo)", lineHeight: 1.3, marginTop: 6 }}
              >
                {titulo}
              </p>
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
              borderTop:  "1px solid rgba(201, 168, 130, 0.12)",
              marginTop:  16,
              paddingTop: 16,
            }}
          >
            <p
              className="font-sans"
              style={{
                fontSize:        14,
                color:           "var(--color-gris-bordo)",
                lineHeight:      1.7,
                overflow:        "hidden",
                display:         "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              } as React.CSSProperties}
            >
              {descripcion}
            </p>

            <span
              className="font-sans"
              style={{
                fontSize:   14,
                color:      "var(--color-bordo)",
                fontWeight: 500,
                display:    "inline-flex",
                alignItems: "center",
                gap:        4,
                marginTop:  14,
              }}
            >
              Ver campaña completa
              <ArrowRight size={13} strokeWidth={2} />
            </span>
          </div>
        </div>
      </Link>
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
          {campaigns.map((c, i) => {
            // images viene ya ordenado por position ASC desde lib/campaigns.ts.
            // La foto destacada es siempre la primera (menor position).
            const first = c.images?.[0]
            const featuredImage = first
              ? { url: first.url, alt: first.alt }
              : null
            return (
              <CampanaCard
                key={c.id}
                marca={c.brand}
                titulo={c.title}
                estado={c.status}
                fecha={c.date}
                descripcion={hasHtmlTags(c.description) ? htmlToPlainText(c.description) : c.description}
                href={`/campanas/${c.slug}`}
                featuredImage={featuredImage}
                priority={i === 0}
              />
            )
          })}
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
        <CampanaEmpty />
      ) : (
        <CampanaGrid campaigns={campaigns} />
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
