"use client"

import { motion } from "motion/react"
import Link from "next/link"
import {
  fadeUp, fadeLeft,
  fadeUpStagger, viewportOnce,
} from "@/lib/animations"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}

const PILARES = [
  {
    num: "01",
    titulo: "Inteligencia y Oficio",
    descripcion:
      "Combino el respaldo de mis años de estudio con la experiencia real del terreno y una capacitación constante para tomar decisiones estratégicas y con criterio.",
  },
  {
    num: "02",
    titulo: "Integridad",
    descripcion:
      "Construyo puentes honestos y transparentes. Prefiero cuidar la confianza a largo plazo con un periodista que forzar una noticia sin valor real.",
  },
  {
    num: "03",
    titulo: "Libertad",
    descripcion:
      "Mi negocio y trabajo está basado en objetivos, no en horarios rígidos. Esa misma independencia me da la libertad de palabra para asesorarte con total franqueza y decirte siempre lo que tu marca necesita escuchar.",
  },
  {
    num: "04",
    titulo: "Responsabilidad y Compromiso",
    descripcion:
      "No soy una proveedora externa más; me involucro en tu negocio como una aliada estratégica para cuidar cada detalle.",
  },
  {
    num: "05",
    titulo: "Pasión",
    descripcion:
      "Amo profundamente lo que hago. Disfruto el ecosistema multiplataforma y me entusiasma transformar el propósito de las personas y empresas en historias que merecen ser contadas.",
  },
]

/* ═══════════════════════════════════════════════════════════════
   HERO EDITORIAL
═══════════════════════════════════════════════════════════════ */
function HeroEditorial() {
  return (
    <section style={{ position: "relative", width: "100%", overflow: "hidden" }}>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/NAC_4208.jpg"
        alt="Marian Sánchez en su espacio de trabajo"
        className="max-h-[70vh] sm:max-h-[90vh]"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div
        className="pt-5 sm:pt-0 px-5 sm:px-[clamp(20px,5vw,64px)] pb-8 sm:pb-[clamp(32px,6vh,64px)]"
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          <motion.p
            variants={itemVariants}
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: "11px",
              letterSpacing: ".15em",
              textTransform: "uppercase",
              color: "rgba(254,252,239,0.65)",
              marginBottom: "14px",
            }}
          >
            Mis valores
          </motion.p>

          <motion.h1
            variants={itemVariants}
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#FEFCEF",
              fontWeight: 700,
              margin: 0,
            }}
          >
            <span style={{ display: "block", fontSize: "clamp(1.3rem, 3vw, 2.2rem)", fontWeight: 600, opacity: 0.88 }}>
              Detrás de la estrategia:
            </span>
            <em style={{ display: "block", fontSize: "clamp(2rem, 5vw, 4rem)", fontStyle: "italic", lineHeight: 1.0 }}>
              mi historia.
            </em>
          </motion.h1>

        </motion.div>
      </div>

    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   BIO — 3 párrafos
═══════════════════════════════════════════════════════════════ */
function BioSection() {
  return (
    <section className="bg-hueso py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-[760px] flex flex-col gap-8">
          <motion.p
            className="font-playfair font-bold text-negro-bordo text-[28px] sm:text-[32px] lg:text-[36px] leading-[1.3]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            Mi camino en el mundo de la comunicación comenzó hace más de una
            década, impulsado por una certeza que hoy es el motor de mi negocio:{" "}
            <em className="italic text-bordo">comunicar es conectar.</em>
          </motion.p>

          <motion.p
            className="font-sans text-[15px] text-gris-bordo leading-[1.8]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Me formé en la universidad, pero mi verdadero oficio se moldeó en la experiencia
            en los medios de comunicación. Esas &ldquo;horas calle&rdquo; me dieron las
            herramientas esenciales para entender el ritmo de las noticias y aprender qué busca
            realmente un periodista. También he dedicado mis días a la comunicación institucional
            y corporativa, donde descubrí la complejidad de construir y blindar la reputación de
            marcas, empresas y organismos públicos y privados.
          </motion.p>

          <motion.p
            className="font-sans text-[15px] text-gris-bordo leading-[1.8]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            A lo largo de este recorrido, entendí que para ofrecer un servicio de excelencia no
            podía trabajar aislada. Por eso, hoy lidero mis proyectos y negocio tejiendo alianzas
            estratégicas con colegas de confianza, lo que me permite ofrecer soluciones integrales
            y multiplataforma, garantizando que cada mensaje brille en el soporte adecuado.
          </motion.p>

          <motion.p
            className="font-mono text-[11px] text-gris-bordo/60 mt-2 text-right"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            — Marian Sánchez
          </motion.p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PILARES
═══════════════════════════════════════════════════════════════ */
function PilaresSection() {
  return (
    <section className="bg-hueso-oscuro py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-16"
        >
          <motion.p variants={fadeUp} className="font-mono text-[10px] uppercase tracking-[0.25em] text-bordo mb-4">
            Mis valores
          </motion.p>
          <motion.div variants={fadeUp} className="w-10 h-px bg-dorado mb-6" />
          <motion.h2 variants={fadeUp} className="font-playfair font-bold text-negro-bordo text-[40px] leading-[1.1] mb-4">
            Los pilares que{" "}
            <em className="italic text-bordo">guían mi trabajo.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="font-sans text-[14px] text-gris-bordo max-w-[480px] leading-relaxed">
            Esta trayectoria es la que hoy me permite dar vida a mis valores en cada consultoría:
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {PILARES.map((pilar) => (
            <motion.div
              key={pilar.num}
              variants={fadeUp}
              className="group pt-8 cursor-default"
            >
              <div className="w-full h-px bg-dorado/20 mb-8" />
              <span className="block font-mono text-[10px] text-bordo opacity-30 group-hover:opacity-100 transition-opacity duration-300 mb-3">
                {pilar.num}
              </span>
              <p className="font-playfair font-bold text-negro-bordo text-[20px] leading-[1.15] mb-3 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                {pilar.titulo}
              </p>
              <p className="font-sans text-[13px] text-gris-bordo leading-relaxed">
                {pilar.descripcion}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CIERRE
═══════════════════════════════════════════════════════════════ */
function CierreSection() {
  return (
    <section className="bg-hueso py-[120px]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-[760px]"
        >
          <p className="font-playfair text-negro-bordo text-[22px] sm:text-[26px] leading-[1.5] mb-10">
            Mi propósito en este mundo es abrir caminos para que las historias que merecen ser
            contadas encuentren su lugar. Creo firmemente que todos tenemos una voz única y el
            derecho a ser vistos, reconocidos y potenciados desde nuestras propias inteligencias.
            Mi negocio no es moldear a las marcas o a las personas bajo un formato rígido, sino
            descubrir su brillo auténtico, darles herramientas estratégicas y tender los puentes
            necesarios para que su mensaje resuene con fuerza y claridad en la comunidad.
          </p>
          <Link
            href="/#contacto"
            className="inline-flex items-center gap-2 bg-bordo text-hueso font-sans text-[15px] font-semibold px-8 py-4 rounded-full hover:bg-bordo/90 active:scale-[0.98] transition-all"
          >
            Conversemos →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════ */
export function MisValoresSections() {
  return (
    <>
      <HeroEditorial />
      <BioSection />
      <PilaresSection />
      <CierreSection />
    </>
  )
}
