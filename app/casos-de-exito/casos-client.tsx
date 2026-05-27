"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ExternalLink, ChevronDown } from "lucide-react"
import { CLIPPINGS, CATEGORIAS, type Categoria } from "@/data/clippings"

// ─── Types ───────────────────────────────────────────────────────────────────

type Aparicion = {
  id: number
  medio: string
  formato: string
  alcance: string
  titular: string
  año: number
  link: string
}

type ClienteBase = {
  id: string
  nombre: string
  logo: string | null
  descripcion: string
  categoria: Categoria | null
  enCamino?: boolean
}

type ClienteData = ClienteBase & {
  apariciones: Aparicion[]
  formatos: string[]
  mediosCount: number
}

// ─── Client config (order: by apariciones desc, then alpha) ──────────────────

const CLIENTES_CONFIG: ClienteBase[] = [
  {
    id: "capilla-carlo-acutis",
    nombre: "Capilla Carlo Acutis",
    logo: "/images/logos/logo-capilla-acutis.png",
    descripcion:
      "Construcción de la primera capilla del mundo dedicada a Carlo Acutis en Chacras de Coria, Mendoza.",
    categoria: "Instituciones & Eventos",
  },
  {
    id: "esc-vendimia-chakaymanta",
    nombre: "Esc. Vendimia Chakaymanta",
    logo: null,
    descripcion:
      "Del barrio La Favorita al Martín Fierro Nacional de la Danza y al Festival de Cosquín.",
    categoria: "Cultura & Educación",
  },
  {
    id: "colegio-notarial-mendoza",
    nombre: "Colegio Notarial de Mendoza",
    logo: null,
    descripcion:
      "Lanzamiento del Observatorio Estadístico del Mercado Inmobiliario y digitalización de escrituras.",
    categoria: "Empresas & Instituciones",
  },
  {
    id: "dra-elina-meneo",
    nombre: "Dra. Elina Meneo",
    logo: null,
    descripcion:
      "Posicionamiento en medios de la terapia de regresión a vidas pasadas en Mendoza.",
    categoria: "Marcas Personales",
  },
  {
    id: "bolsa-comercio",
    nombre: "Bolsa de Comercio de Mendoza",
    logo: null,
    descripcion: "Representación institucional del comercio mendocino.",
    categoria: null,
    enCamino: true,
  },
  {
    id: "fuerza-silenciosa",
    nombre: "Fuerza Silenciosa",
    logo: "/images/logos/logo-fuerza-silenciosa.jpg",
    descripcion: "Visibilidad y posicionamiento de marca.",
    categoria: null,
    enCamino: true,
  },
  {
    id: "flor-mouradian",
    nombre: "Flor Mouradian, Psicóloga",
    logo: null,
    descripcion: "Marca personal en el sector salud mental.",
    categoria: null,
    enCamino: true,
  },
  {
    id: "agrocosecha",
    nombre: "Agrocosecha",
    logo: null,
    descripcion: "Comunicación estratégica en el sector agropecuario.",
    categoria: null,
    enCamino: true,
  },
  {
    id: "grupo-presidente",
    nombre: "Grupo Presidente",
    logo: null,
    descripcion: "Comunicación corporativa y relaciones con medios.",
    categoria: null,
    enCamino: true,
  },
  {
    id: "mendoza-regenera",
    nombre: "Mendoza Regenera",
    logo: null,
    descripcion: "Comunicación ambiental y regenerativa.",
    categoria: null,
    enCamino: true,
  },
  {
    id: "quienvino-app",
    nombre: "QuienVino App",
    logo: "/images/logos/logo-quienvino.png",
    descripcion: "Plataforma digital para el ecosistema vitivinícola.",
    categoria: null,
    enCamino: true,
  },
]

// Maps clipping.cliente → cliente.id
const NOMBRE_A_ID: Record<string, string> = {
  "Capilla Carlo Acutis": "capilla-carlo-acutis",
  "Esc. Vendimia Chakaymanta": "esc-vendimia-chakaymanta",
  "Colegio Notarial de Mendoza": "colegio-notarial-mendoza",
  "Dra. Elina Meneo": "dra-elina-meneo",
}

const ROW_COLS = "160px 80px 100px 1fr 50px 32px"

// ─── Logo avatar ──────────────────────────────────────────────────────────────

function LogoAvatar({
  logo,
  nombre,
  size = 64,
}: {
  logo: string | null
  nombre: string
  size?: number
}) {
  const [err, setErr] = useState(false)
  const radius = size <= 48 ? 10 : 12

  const wrap: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    background: "var(--color-arena)",
    borderRadius: radius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  }

  if (logo && !err) {
    return (
      <div style={wrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={nombre}
          onError={() => setErr(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }}
        />
      </div>
    )
  }

  return (
    <div style={wrap}>
      <span
        style={{
          fontFamily: "var(--font-playfair)",
          fontStyle: "italic",
          fontSize: size <= 48 ? 22 : 28,
          color: "var(--color-bordo)",
          lineHeight: 1,
        }}
      >
        {nombre.charAt(0)}
      </span>
    </div>
  )
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function FBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 4,
        background: "var(--color-arena)",
        color: "var(--color-gris-bordo)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  )
}

function ABadge({ text }: { text: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 4,
        border: "1px solid rgba(102,0,31,0.15)",
        color: "rgba(102,0,31,0.7)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  )
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  const [hovered, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="shrink-0 transition-all duration-200"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        padding: "8px 20px",
        borderRadius: 999,
        border: active ? "none" : "1px solid rgba(102,0,31,0.2)",
        background: active ? "var(--color-bordo)" : hovered ? "var(--color-arena)" : "transparent",
        color: active ? "var(--color-hueso)" : "var(--color-gris-bordo)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  )
}

// ─── Aparicion row (desktop table) ───────────────────────────────────────────

function AparicionRow({ medio, formato, alcance, titular, año, link }: Aparicion) {
  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: ROW_COLS,
    padding: "14px 0",
    alignItems: "center",
    borderBottom: "1px solid rgba(102,0,31,0.04)",
    textDecoration: "none",
  }

  const inner = (
    <>
      <span className="font-sans font-medium text-sm" style={{ color: "var(--color-negro-bordo)" }}>
        {medio}
      </span>
      <span>
        <FBadge text={formato} />
      </span>
      <span>
        <ABadge text={alcance} />
      </span>
      <span
        className="font-sans text-sm"
        style={{
          color: "var(--color-gris-bordo)",
          lineHeight: 1.4,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {titular}
      </span>
      <span className="font-mono text-xs text-right" style={{ color: "rgba(74,48,64,0.4)" }}>
        {año}
      </span>
      <span className="flex justify-end items-center">
        {link && (
          <ExternalLink
            size={14}
            strokeWidth={1.5}
            style={{ color: "rgba(102,0,31,0.25)", transition: "opacity 0.15s" }}
          />
        )}
      </span>
    </>
  )

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:grid hover:bg-[rgba(102,0,31,0.02)] transition-colors"
        style={rowStyle}
      >
        {inner}
      </a>
    )
  }
  return (
    <div className="hidden sm:grid" style={rowStyle}>
      {inner}
    </div>
  )
}

// ─── Aparicion card (mobile) ──────────────────────────────────────────────────

function AparicionCard({ medio, formato, alcance, titular, año, link }: Aparicion) {
  const cardContent = (
    <div
      className="flex flex-col gap-2 py-3"
      style={{ borderBottom: "1px solid rgba(102,0,31,0.04)" }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans font-medium text-sm" style={{ color: "var(--color-negro-bordo)" }}>
          {medio}
        </span>
        <FBadge text={formato} />
        <ABadge text={alcance} />
      </div>
      <p
        className="font-sans text-sm leading-snug"
        style={{
          color: "var(--color-gris-bordo)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {titular}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px]" style={{ color: "rgba(74,48,64,0.4)" }}>
          {año}
        </span>
        {link && <ExternalLink size={13} strokeWidth={1.5} style={{ color: "rgba(102,0,31,0.4)" }} />}
      </div>
    </div>
  )

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block sm:hidden">
        {cardContent}
      </a>
    )
  }
  return <div className="sm:hidden">{cardContent}</div>
}

// ─── Client block (accordion) ─────────────────────────────────────────────────

function ClientBlock({
  cliente,
  isOpen,
  onToggle,
}: {
  cliente: ClienteData
  isOpen: boolean
  onToggle: () => void
}) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-2xl transition-all duration-200"
      style={{
        background: "var(--color-hueso)",
        border: `1px solid ${isOpen || hov ? "rgba(102,0,31,0.25)" : "rgba(102,0,31,0.08)"}`,
        boxShadow: isOpen || hov ? "0 4px 24px rgba(102,0,31,0.04)" : "none",
      }}
    >
      {/* ── Header / trigger ── */}
      <button
        onClick={onToggle}
        className="w-full text-left appearance-none border-0 bg-transparent"
        style={{ padding: "32px 36px", cursor: "pointer" }}
      >
        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <LogoAvatar logo={cliente.logo} nombre={cliente.nombre} size={64} />

          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-xl" style={{ color: "var(--color-negro-bordo)" }}>
              {cliente.nombre}
            </p>
            {cliente.descripcion && (
              <p
                className="font-sans text-sm mt-1"
                style={{
                  color: "var(--color-gris-bordo)",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cliente.descripcion}
              </p>
            )}
            {cliente.categoria && !cliente.enCamino && (
              <p
                className="font-mono text-[10px] uppercase mt-2"
                style={{ color: "rgba(102,0,31,0.5)", letterSpacing: "0.12em" }}
              >
                {cliente.categoria}
              </p>
            )}
            {cliente.enCamino && (
              <span
                className="inline-block font-mono text-[10px] uppercase mt-2 px-3 py-1 rounded-full"
                style={{
                  background: "var(--color-arena)",
                  color: "var(--color-gris-bordo)",
                  letterSpacing: "0.1em",
                }}
              >
                En camino
              </span>
            )}
          </div>

          {!cliente.enCamino && cliente.apariciones.length > 0 && (
            <div className="ml-auto text-right shrink-0">
              <p className="font-playfair leading-none" style={{ fontSize: 32, color: "var(--color-bordo)" }}>
                {cliente.apariciones.length}
              </p>
              <p className="font-mono text-[10px] mt-1" style={{ color: "rgba(74,48,64,0.6)" }}>
                apariciones · {cliente.mediosCount} medios
              </p>
              <div className="flex gap-1 mt-2 justify-end flex-wrap">
                {cliente.formatos.map((f) => (
                  <FBadge key={f} text={f} />
                ))}
              </div>
            </div>
          )}

          <div
            className="ml-6 shrink-0 self-center"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <ChevronDown size={20} style={{ color: "rgba(102,0,31,0.3)" }} />
          </div>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-start gap-4 relative">
          <LogoAvatar logo={cliente.logo} nombre={cliente.nombre} size={48} />
          <div className="flex-1 min-w-0 pr-8">
            <p className="font-sans font-semibold text-lg" style={{ color: "var(--color-negro-bordo)" }}>
              {cliente.nombre}
            </p>
            {cliente.descripcion && (
              <p
                className="font-sans text-sm mt-1 leading-snug"
                style={{
                  color: "var(--color-gris-bordo)",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                } as React.CSSProperties}
              >
                {cliente.descripcion}
              </p>
            )}
            {cliente.enCamino && (
              <span
                className="inline-block font-mono text-[10px] uppercase mt-2 px-3 py-1 rounded-full"
                style={{
                  background: "var(--color-arena)",
                  color: "var(--color-gris-bordo)",
                  letterSpacing: "0.1em",
                }}
              >
                En camino
              </span>
            )}
            {!cliente.enCamino && cliente.apariciones.length > 0 && (
              <div className="mt-2">
                <p
                  className="font-playfair leading-none"
                  style={{ fontSize: 28, color: "var(--color-bordo)" }}
                >
                  {cliente.apariciones.length}
                  <span
                    className="font-mono text-[10px] ml-2"
                    style={{ color: "rgba(74,48,64,0.6)" }}
                  >
                    apariciones
                  </span>
                </p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {cliente.formatos.map((f) => (
                    <FBadge key={f} text={f} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div
            className="absolute top-0 right-0"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <ChevronDown size={18} style={{ color: "rgba(102,0,31,0.3)" }} />
          </div>
        </div>
      </button>

      {/* ── Expanded content ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 36px 32px" }}>
              {/* Separator */}
              <div
                style={{
                  height: 1,
                  background: "rgba(201,168,130,0.2)",
                  marginBottom: 24,
                }}
              />

              {cliente.enCamino ? (
                <p
                  className="font-sans text-sm italic"
                  style={{ color: "var(--color-gris-bordo)" }}
                >
                  Los casos de este cliente están en desarrollo.
                </p>
              ) : (
                <>
                  {/* Table header — desktop */}
                  <div
                    className="hidden sm:grid font-mono text-[10px] uppercase pb-3"
                    style={{
                      gridTemplateColumns: ROW_COLS,
                      color: "rgba(102,0,31,0.3)",
                      borderBottom: "1px solid var(--color-arena)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    <span>Medio</span>
                    <span>Formato</span>
                    <span>Alcance</span>
                    <span>Titular</span>
                    <span className="text-right">Año</span>
                    <span />
                  </div>

                  {/* Apariciones */}
                  {cliente.apariciones.map((ap) => (
                    <React.Fragment key={ap.id}>
                      <AparicionRow {...ap} />
                      <AparicionCard {...ap} />
                    </React.Fragment>
                  ))}

                  {/* Footer count */}
                  <p
                    className="font-mono text-[11px] mt-4 pt-4"
                    style={{
                      color: "rgba(74,48,64,0.4)",
                      borderTop: "1px solid rgba(201,168,130,0.15)",
                    }}
                  >
                    {cliente.apariciones.length} apariciones en {cliente.mediosCount} medios distintos
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function CasosClient() {
  const [activeFilter, setActiveFilter] = useState<string>("Todos")
  const [openClient, setOpenClient] = useState<string>("capilla-carlo-acutis")

  const allClientes: ClienteData[] = useMemo(() => {
    return CLIENTES_CONFIG.map((c) => {
      const apariciones: Aparicion[] = CLIPPINGS.filter(
        (cl) => NOMBRE_A_ID[cl.cliente] === c.id
      ).map((cl) => ({
        id: cl.id,
        medio: cl.medio,
        formato: cl.formato,
        alcance: cl.alcance,
        titular: cl.titular,
        año: cl.año,
        link: cl.link,
      }))
      return {
        ...c,
        apariciones,
        formatos: [...new Set(apariciones.map((a) => a.formato))],
        mediosCount: new Set(apariciones.map((a) => a.medio)).size,
      }
    })
  }, [])

  const catCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { Todos: CLIPPINGS.length }
    CATEGORIAS.forEach((cat) => {
      counts[cat] = CLIPPINGS.filter((c) => c.categoria === cat).length
    })
    return counts
  }, [])

  const visibleClientes = useMemo(() => {
    if (activeFilter === "Todos") return allClientes
    return allClientes.filter(
      (c) => c.categoria === activeFilter && c.apariciones.length > 0
    )
  }, [allClientes, activeFilter])

  const FILTERS = ["Todos", ...CATEGORIAS] as const

  return (
    <div>
      {/* ── Filter bar ── */}
      <div
        className="sticky z-30 -mx-6 px-6 lg:-mx-12 lg:px-12 py-4"
        style={{
          top: 72,
          background: "rgba(254,252,239,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(102,0,31,0.06)",
        }}
      >
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {FILTERS.map((f) => (
            <FilterPill
              key={f}
              label={`${f} (${catCounts[f] ?? 0})`}
              active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            />
          ))}
        </div>
      </div>

      {/* ── Blocks with filter transition ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pt-10 flex flex-col gap-4"
        >
          {visibleClientes.map((cliente) => (
            <ClientBlock
              key={cliente.id}
              cliente={cliente}
              isOpen={openClient === cliente.id}
              onToggle={() =>
                setOpenClient((prev) => (prev === cliente.id ? "" : cliente.id))
              }
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
