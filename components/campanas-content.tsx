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

// ─── Datos estáticos ──────────────────────────────────────────────────────────

const STATS = [
  { n: "3",          label: "campañas" },
  { n: "activas",    label: "ahora mismo" },
  { n: "Jun. 2026",  label: "última campaña" },
  { n: "+15",        label: "medios activados" },
] as const

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

const PILLS_LYNKCO = ["PHEV", "5★ Euro NCAP", "Diseño escandinavo"]

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
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.7, maxWidth: 520, marginTop: 24 }}
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
          background:  "var(--color-hueso)",
          borderRadius: 16,
          border:      `1px solid ${hov ? "rgba(102,0,31,0.12)" : "rgba(102,0,31,0.06)"}`,
          overflow:    "hidden",
          transform:   hov ? "translateY(-3px)" : "translateY(0)",
          boxShadow:   hov ? "0 8px 32px rgba(102,0,31,0.06)" : "none",
          transition:  "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Zona superior */}
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
                fontSize:    10,
                letterSpacing: "0.1em",
                borderRadius: 100,
                padding:     "5px 16px",
                display:     "inline-block",
                background:  estado === "ACTIVA" ? "var(--color-bordo)" : "var(--color-arena)",
                color:       estado === "ACTIVA" ? "var(--color-hueso)" : "var(--color-gris-bordo)",
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

        {/* Zona inferior */}
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
                fontSize:    14,
                color:       "var(--color-bordo)",
                fontWeight:  500,
                display:     "inline-flex",
                alignItems:  "center",
                gap:         hov ? 8 : 4,
                marginTop:   16,
                transition:  "gap 0.3s ease",
                background:  "none",
                border:      "none",
                cursor:      "pointer",
                padding:     0,
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

function CampanaGrid() {
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
          <CampanaCard
            marca="Grupo Presidente"
            estado="ACTIVA"
            fecha="Junio 2026"
            titulo="Lynk & Co llega a Mendoza: preventa exclusiva de la marca de movilidad premium escandinava"
            descripcion="Grupo Presidente confirma el inicio de la preventa exclusiva de Lynk & Co en Mendoza. Tres modelos SUV híbridos premium con apertura de Urban Store en Palmares Mall prevista para el segundo semestre de 2026."
            scrollTarget="campana-lynk-co-grupo-presidente"
          />
          <CampanaCard
            marca="Bolsa de Comercio de Mendoza"
            estado="ACTIVA"
            fecha="Junio 2026"
            titulo="El mosto se consolida en el exterior como el endulzante premium de la industria"
            descripcion="La BCM reafirmó su posición como nexo articulador de la economía regional con un nuevo encuentro de la Comisión del Precio del Vino."
            scrollTarget="campana-bolsa-comercio-mosto"
          />
          <CampanaCard
            marca="Capilla Carlo Acutis"
            estado="ACTIVA"
            fecha="Junio 2026"
            titulo="Peligra la continuidad de la Capilla Carlo Acutis en Luján de Cuyo: lanzan suscripción nacional para salvar la obra"
            descripcion="La obra corre riesgo de paralizarse por falta de fondos. Se lanzó un sistema de donaciones con Mercado Pago buscando 8.000 donantes de todo el país."
            scrollTarget="campana-capilla-carlo-acutis"
          />
        </motion.div>

      </div>
    </section>
  )
}

// ─── Detalle: Lynk & Co / Grupo Presidente ───────────────────────────────────

function LynkCoGrupoPresidente() {
  return (
    <section
      id="campana-lynk-co-grupo-presidente"
      className="bg-hueso"
      style={{
        padding:         "clamp(60px, 10vh, 120px) clamp(20px, 5vw, 64px)",
        scrollMarginTop: 80,
      }}
    >
      <div className="max-w-7xl mx-auto">

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
            {/* Logo placeholder */}
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
              G
            </div>

            <div>
              <p
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
              >
                Grupo Presidente
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
                Lynk & Co llega a Mendoza: preventa exclusiva de la marca de movilidad premium escandinava
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <span
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.5 }}
                >
                  Junio 2026
                </span>
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize:     10,
                    letterSpacing: "0.1em",
                    borderRadius: 100,
                    padding:      "3px 12px",
                    background:   "var(--color-bordo)",
                    color:        "var(--color-hueso)",
                  }}
                >
                  ACTIVA
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ width: 60, height: 1, background: "var(--color-dorado)", marginBottom: 40 }}
          />
        </motion.div>

        {/* Cuerpo — maxWidth 720px */}
        <div style={{ maxWidth: 720 }}>

          {/* Lead */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{
              fontSize:    17,
              color:       "var(--color-negro-bordo)",
              lineHeight:  1.8,
              fontWeight:  400,
              marginBottom: 40,
              paddingLeft: "clamp(16px, 3vw, 20px)",
              borderLeft:  "2px solid rgba(201,168,130,0.4)",
            }}
          >
            Hay hitos que cambian el pulso de un mercado, y lo que ocurre hoy en Mendoza es uno de ellos. Grupo Presidente confirma el inicio de la preventa exclusiva de Lynk & Co, la marca global que está transformando la industria automotriz.
          </motion.p>

          {/* Subtítulo 1 */}
          <motion.h3
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-playfair"
            style={{ fontSize: 20, color: "var(--color-negro-bordo)", fontStyle: "italic", marginTop: 48, marginBottom: 16 }}
          >
            Más que un SUV: una declaración de principios
          </motion.h3>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.85, marginBottom: 20 }}
          >
            Fundada en 2016 en Gotemburgo, Suecia, Lynk & Co nació como un proyecto global que combina ingeniería y diseño europeo con respaldo industrial global y una fuerte integración digital en el vehículo. La marca se construye sobre los más altos estándares escandinavos de seguridad, calidad e innovación tecnológica.
          </motion.p>

          {/* Grid de modelos */}
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ marginTop: 32, marginBottom: 40 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 24 }}>
              {MODELOS_LYNKCO.map((m) => (
                <motion.div
                  key={m.nombre}
                  variants={revealCard}
                  style={{
                    padding:      24,
                    background:   "var(--color-hueso-oscuro)",
                    borderRadius: 12,
                    border:       "1px solid rgba(102,0,31,0.04)",
                  }}
                >
                  <p
                    className="font-sans"
                    style={{ fontSize: 16, fontWeight: 600, color: "var(--color-negro-bordo)" }}
                  >
                    {m.nombre}
                  </p>
                  <p
                    className="font-sans"
                    style={{ fontSize: 13, color: "var(--color-gris-bordo)", lineHeight: 1.6, marginTop: 6 }}
                  >
                    {m.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Pills técnicas */}
            <motion.div
              variants={fadeUp}
              style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}
            >
              {PILLS_LYNKCO.map((p) => (
                <span
                  key={p}
                  className="font-mono uppercase"
                  style={{
                    fontSize:      10,
                    letterSpacing: "0.1em",
                    color:         "var(--color-bordo)",
                    border:        "1px solid rgba(102,0,31,0.2)",
                    borderRadius:  100,
                    padding:       "4px 14px",
                  }}
                >
                  {p}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Subtítulo 2 */}
          <motion.h3
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-playfair"
            style={{ fontSize: 20, color: "var(--color-negro-bordo)", fontStyle: "italic", marginTop: 48, marginBottom: 16 }}
          >
            El respaldo de un peso pesado regional
          </motion.h3>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.85, marginBottom: 20 }}
          >
            La elección de Lynk & Co por parte de Grupo Presidente no es casual: es el resultado de una visión compartida de excelencia y vanguardia. Lynk & Co propone además una nueva experiencia de compra con Flagship Hubs y el nuevo Urban Store en Palmares Mall, cuya apertura está prevista para el segundo semestre de 2026.
          </motion.p>

          {/* Cita destacada */}
          <motion.blockquote
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            style={{
              marginTop:    32,
              marginBottom: 32,
              padding:      "clamp(20px, 3vw, 28px) clamp(24px, 3vw, 32px)",
              background:   "var(--color-bordo)",
              borderRadius: 12,
              color:        "var(--color-hueso)",
              fontFamily:   "var(--font-playfair-display), serif",
              fontSize:     "clamp(16px, 2vw, 18px)",
              fontStyle:    "italic",
              lineHeight:   1.6,
              margin:       0,
            }}
          >
            "En Presidente trabajamos con una visión clara: impulsar la llegada al oeste argentino de las marcas más innovadoras del mundo."
            <footer
              className="font-mono"
              style={{
                fontSize:   10,
                color:      "var(--color-hueso)",
                opacity:    0.5,
                marginTop:  12,
                fontStyle:  "normal",
              }}
            >
              — Dirección de Grupo Presidente
            </footer>
          </motion.blockquote>

          {/* Subtítulo 3 */}
          <motion.h3
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-playfair"
            style={{ fontSize: 20, color: "var(--color-negro-bordo)", fontStyle: "italic", marginTop: 48, marginBottom: 16 }}
          >
            Oportunidad de pioneros
          </motion.h3>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.85, marginBottom: 20 }}
          >
            La preventa exclusiva ya está habilitada a través de las redes oficiales @lynkco.clubmza. Los primeros compradores contarán con un paquete de beneficios y experiencias exclusivas que marcan el ADN de la marca.
          </motion.p>

        </div>

        {/* Galería placeholder */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          style={{
            marginTop:    56,
            padding:      "60px 40px",
            background:   "var(--color-arena)",
            borderRadius: 16,
            textAlign:    "center",
            border:       "1px dashed rgba(201,168,130,0.25)",
          }}
        >
          <p
            className="font-sans"
            style={{ fontSize: 14, color: "var(--color-gris-bordo)", fontStyle: "italic" }}
          >
            Galería fotográfica próximamente
          </p>
        </motion.div>

      </div>
    </section>
  )
}

// ─── Detalle: Bolsa de Comercio / Mosto ──────────────────────────────────────

const PARTICIPANTES_BCM = [
  "Patricia Giménez · ProMendoza",
  "Martín Materia · CAFEM",
  "Gustavo López · Juviar",
]

const DATOS_SECTOR = [
  { n: "90%",      label: "exportación" },
  { n: "93.000 tn", label: "campaña estimada" },
  { n: "EE.UU.",   label: "principal comprador" },
  { n: "Endulzante", label: "uso premium" },
]

function BolsaComercioMosto() {
  return (
    <section
      id="campana-bolsa-comercio-mosto"
      className="bg-hueso-oscuro"
      style={{ scrollMarginTop: 80 }}
    >
      {/* Separador entre campañas */}
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
              B
            </div>

            <div>
              <p
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
              >
                Bolsa de Comercio de Mendoza
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
                El mosto se consolida en el exterior como el endulzante premium de la industria
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <span
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.5 }}
                >
                  Junio 2026
                </span>
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize:      10,
                    letterSpacing: "0.1em",
                    borderRadius:  100,
                    padding:       "3px 12px",
                    background:    "var(--color-bordo)",
                    color:         "var(--color-hueso)",
                  }}
                >
                  ACTIVA
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ width: 60, height: 1, background: "var(--color-dorado)", marginBottom: 40 }}
          />
        </motion.div>

        {/* Cuerpo */}
        <div style={{ maxWidth: 720 }}>

          {/* Lead */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{
              fontSize:    17,
              color:       "var(--color-negro-bordo)",
              lineHeight:  1.8,
              fontWeight:  400,
              marginBottom: 24,
              paddingLeft: "clamp(16px, 3vw, 20px)",
              borderLeft:  "2px solid rgba(201,168,130,0.4)",
            }}
          >
            La Bolsa de Comercio de Mendoza reafirmó su posición como nexo articulador de la economía regional al realizar un nuevo encuentro de la Comisión del Precio del Vino, histórica en la institución.
          </motion.p>

          {/* Pills participantes */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, marginBottom: 40 }}
          >
            {PARTICIPANTES_BCM.map((p) => (
              <span
                key={p}
                className="font-mono"
                style={{
                  fontSize:      10,
                  letterSpacing: "0.08em",
                  color:         "var(--color-bordo)",
                  border:        "1px solid rgba(102,0,31,0.2)",
                  borderRadius:  100,
                  padding:       "4px 14px",
                  whiteSpace:    "nowrap",
                }}
              >
                {p}
              </span>
            ))}
          </motion.div>

          {/* Subtítulo 1 */}
          <motion.h3
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-playfair"
            style={{ fontSize: 20, color: "var(--color-negro-bordo)", fontStyle: "italic", marginTop: 48, marginBottom: 16 }}
          >
            Mendoza, epicentro mundial del vino a granel
          </motion.h3>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.85, marginBottom: 20 }}
          >
            Patricia Giménez expuso sobre Vinexpo Explorer — The Bulk Wine Chapter, el prestigioso encuentro internacional que se celebrará en la provincia del 8 al 10 de junio de 2026, con apertura oficial en la Bolsa de Comercio de Mendoza.
          </motion.p>

          {/* Dato destacado */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            style={{
              marginTop:    32,
              marginBottom: 32,
              padding:      "clamp(20px, 3vw, 28px) clamp(24px, 3vw, 32px)",
              background:   "var(--color-bordo)",
              borderRadius: 12,
            }}
          >
            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ gap: 24, marginBottom: 16 }}
            >
              {[
                { n: "25", label: "importadores clave" },
                { n: "50", label: "bodegas argentinas" },
              ].map((d) => (
                <div key={d.label} className="text-center sm:text-left">
                  <p
                    className="font-playfair leading-none"
                    style={{ fontSize: 36, color: "var(--color-hueso)", fontWeight: 700 }}
                  >
                    {d.n}
                  </p>
                  <p
                    className="font-mono uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--color-hueso)", opacity: 0.55, marginTop: 8 }}
                  >
                    {d.label}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="font-sans"
              style={{ fontSize: 13, color: "var(--color-hueso)", opacity: 0.6, marginTop: 16 }}
            >
              EE.UU., Reino Unido, Canadá, Alemania y mercados emergentes.
            </p>
          </motion.div>

          {/* Cita */}
          <motion.blockquote
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              padding:      "clamp(16px, 3vw, 24px) clamp(20px, 3vw, 28px)",
              background:   "var(--color-arena)",
              borderRadius: 12,
              borderLeft:   "3px solid var(--color-bordo)",
              margin:       0,
              marginBottom: 32,
            }}
          >
            <p
              className="font-sans"
              style={{ fontSize: 15, color: "var(--color-gris-bordo)", fontStyle: "italic", lineHeight: 1.7 }}
            >
              "Si bien más del 60% de los compradores internacionales ya comercializaba vino argentino, más del 80% de ellos no conocía Mendoza en persona. Aquí es donde la identidad mendocina juega un rol clave."
            </p>
            <footer
              className="font-mono"
              style={{ fontSize: 10, color: "var(--color-bordo)", opacity: 0.6, marginTop: 10 }}
            >
              — Patricia Giménez, ProMendoza
            </footer>
          </motion.blockquote>

          {/* Subtítulo 2 */}
          <motion.h3
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-playfair"
            style={{ fontSize: 20, color: "var(--color-negro-bordo)", fontStyle: "italic", marginTop: 48, marginBottom: 16 }}
          >
            Radiografía y proyección del sector del mosto
          </motion.h3>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.85, marginBottom: 20 }}
          >
            El 90% del mosto argentino se destina al mercado externo, siendo Estados Unidos el principal comprador, seguido por Japón, Sudáfrica y Canadá.
          </motion.p>

          {/* Datos del sector 2×2 */}
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-2"
            style={{ gap: 20, marginTop: 24, marginBottom: 32 }}
          >
            {DATOS_SECTOR.map((d) => (
              <motion.div
                key={d.label}
                variants={revealCard}
                style={{
                  padding:      20,
                  background:   "var(--color-hueso)",
                  borderRadius: 10,
                }}
              >
                <p
                  className="font-playfair leading-none"
                  style={{ fontSize: "clamp(22px, 3vw, 28px)", color: "var(--color-bordo)", fontWeight: 700 }}
                >
                  {d.n}
                </p>
                <p
                  className="font-sans"
                  style={{ fontSize: 13, color: "var(--color-gris-bordo)", marginTop: 4 }}
                >
                  {d.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Párrafo cierre */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.85, marginBottom: 20 }}
          >
            En Estados Unidos, el mosto se utiliza como endulzante natural en bebidas y alimentos industrializados orientados a un segmento premium que busca sustitutos saludables al jarabe de maíz. La Comisión concluyó en la necesidad de continuar generando estos espacios de debate para dotar de herramientas estratégicas a las pymes y productores de la provincia.
          </motion.p>

        </div>

        {/* Galería placeholder */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          style={{
            marginTop:    56,
            padding:      "60px 40px",
            background:   "var(--color-arena)",
            borderRadius: 16,
            textAlign:    "center",
            border:       "1px dashed rgba(201,168,130,0.25)",
          }}
        >
          <p
            className="font-sans"
            style={{ fontSize: 14, color: "var(--color-gris-bordo)", fontStyle: "italic" }}
          >
            Galería fotográfica próximamente
          </p>
        </motion.div>

      </div>
    </section>
  )
}

// ─── Detalle: Capilla Carlo Acutis ───────────────────────────────────────────

const DRIVE_URL = "https://drive.google.com/drive/u/2/folders/1qU-v1Lkd_Kh-QAOw2tw3Q0irrj4XrkdL"

const OPCIONES_DONACION = [
  { icono: "🙏", nombre: "Donante",       desc: "Aporte mensual" },
  { icono: "⭐", nombre: "Colaborador",   desc: "Aporte trimestral" },
  { icono: "💎", nombre: "Padrino",       desc: "Aporte anual" },
]

function CapillaCarloAcutis() {
  const [hovBtn, setHovBtn]       = useState(false)
  const [hovSecBtn, setHovSecBtn] = useState(false)

  return (
    <section
      id="campana-capilla-carlo-acutis"
      className="bg-hueso"
      style={{ scrollMarginTop: 80 }}
    >
      {/* Separador entre campañas */}
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
            {/* Logo real */}
            <div
              style={{
                background:   "white",
                borderRadius: 8,
                padding:      "8px 10px",
                border:       "1px solid rgba(0,0,0,0.06)",
                flexShrink:   0,
              }}
            >
              <Image
                src="/images/logos/logo-capilla-acutis.png"
                alt="Capilla Carlo Acutis"
                width={56}
                height={56}
                style={{ width: 56, height: 56, objectFit: "contain", display: "block" }}
              />
            </div>

            <div>
              <p
                className="font-mono uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)" }}
              >
                Capilla Carlo Acutis
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
                Peligra la continuidad de la Capilla Carlo Acutis en Luján de Cuyo: lanzan suscripción nacional para salvar la obra
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <span
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.5 }}
                >
                  Junio 2026
                </span>
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize:      10,
                    letterSpacing: "0.1em",
                    borderRadius:  100,
                    padding:       "3px 12px",
                    background:    "var(--color-bordo)",
                    color:         "var(--color-hueso)",
                  }}
                >
                  ACTIVA
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ width: 60, height: 1, background: "var(--color-dorado)", marginBottom: 40 }}
          />
        </motion.div>

        {/* Cuerpo */}
        <div style={{ maxWidth: 720 }}>

          {/* Lead */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{
              fontSize:     17,
              color:        "var(--color-negro-bordo)",
              lineHeight:   1.8,
              fontWeight:   400,
              marginBottom: 32,
              paddingLeft:  "clamp(16px, 3vw, 20px)",
              borderLeft:   "2px solid rgba(201,168,130,0.4)",
            }}
          >
            La obra se encuentra en una etapa crítica y corre riesgo de paralizarse debido a la falta de fondos.
          </motion.p>

          {/* Bloque de urgencia */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              marginTop:    32,
              marginBottom: 40,
              padding:      "clamp(24px, 4vw, 36px)",
              background:   "var(--color-bordo)",
              borderRadius: 16,
              textAlign:    "center",
            }}
          >
            <p
              className="font-playfair leading-none"
              style={{
                fontSize:   "clamp(2.5rem, 5vw, 4rem)",
                color:      "var(--color-hueso)",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              8.000
            </p>
            <p
              className="font-sans"
              style={{ fontSize: 15, color: "var(--color-hueso)", opacity: 0.7, marginTop: 8 }}
            >
              donantes necesarios de todo el país
            </p>
            <p
              className="font-mono uppercase"
              style={{
                fontSize:      11,
                letterSpacing: "0.1em",
                color:         "var(--color-hueso)",
                opacity:       0.45,
                marginTop:     12,
              }}
            >
              para garantizar la continuidad del proyecto
            </p>
            <div className="w-full sm:w-auto flex justify-center" style={{ marginTop: 24 }}>
              <a
                href={DRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHovBtn(true)}
                onMouseLeave={() => setHovBtn(false)}
                className="font-sans w-full sm:w-auto inline-flex items-center justify-center gap-2"
                style={{
                  background:     "var(--color-hueso)",
                  color:          "var(--color-bordo)",
                  borderRadius:   100,
                  padding:        "14px 32px",
                  fontSize:       14,
                  fontWeight:     600,
                  textDecoration: "none",
                  transform:      hovBtn ? "translateY(-1px)" : "translateY(0)",
                  boxShadow:      hovBtn ? "0 4px 16px rgba(0,0,0,0.15)" : "none",
                  transition:     "transform 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                Sumate como donante
                <ArrowRight size={14} strokeWidth={2.5} />
              </a>
            </div>
          </motion.div>

          {/* Párrafo */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="font-sans"
            style={{ fontSize: 15, color: "var(--color-gris-bordo)", lineHeight: 1.85, marginBottom: 20 }}
          >
            Ante este escenario, se ha lanzado un nuevo sistema de donaciones integrado con Mercado Pago, que permite a ciudadanos de todo el país suscribirse de forma anual con distintos montos, buscando garantizar el flujo de recursos necesarios para avanzar en la concreción de la obra.
          </motion.p>

          {/* Detalle de donación */}
          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ gap: 16, marginTop: 32 }}
          >
            {OPCIONES_DONACION.map((op) => (
              <motion.div
                key={op.nombre}
                variants={revealCard}
                style={{
                  padding:      24,
                  textAlign:    "center",
                  background:   "var(--color-hueso-oscuro)",
                  borderRadius: 12,
                  border:       "1px solid rgba(102,0,31,0.04)",
                }}
              >
                <p style={{ fontSize: 24, marginBottom: 8 }}>{op.icono}</p>
                <p
                  className="font-sans"
                  style={{ fontSize: 14, color: "var(--color-negro-bordo)", fontWeight: 600 }}
                >
                  {op.nombre}
                </p>
                <p
                  className="font-sans"
                  style={{ fontSize: 12, color: "var(--color-gris-bordo)", marginTop: 4 }}
                >
                  {op.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Link externo */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ marginTop: 40 }}
          >
            <a
              href={DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHovSecBtn(true)}
              onMouseLeave={() => setHovSecBtn(false)}
              className="font-sans w-full sm:w-auto inline-flex items-center justify-center gap-2"
              style={{
                border:         "1.5px solid rgba(102,0,31,0.25)",
                borderRadius:   100,
                padding:        "12px 28px",
                fontSize:       14,
                color:          "var(--color-bordo)",
                fontWeight:     500,
                textDecoration: "none",
                background:     hovSecBtn ? "rgba(102,0,31,0.04)" : "transparent",
                transition:     "background 0.2s ease",
              }}
            >
              Ver material completo en Drive
              <ArrowRight size={13} strokeWidth={2} />
            </a>
          </motion.div>

        </div>

        {/* Galería placeholder */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          style={{
            marginTop:    56,
            padding:      "60px 40px",
            background:   "var(--color-arena)",
            borderRadius: 16,
            textAlign:    "center",
            border:       "1px dashed rgba(201,168,130,0.25)",
          }}
        >
          <p
            className="font-sans"
            style={{ fontSize: 14, color: "var(--color-gris-bordo)", fontStyle: "italic" }}
          >
            Galería fotográfica próximamente
          </p>
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
            href="/contacto"
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

export function CampanasContent() {
  return (
    <>
      <CampanaHero />
      <CampanaStats />
      <CampanaGrid />
      <LynkCoGrupoPresidente />
      <BolsaComercioMosto />
      <CapillaCarloAcutis />
      <CampanaCta />
    </>
  )
}
