"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

const TYPE_COLORS: Record<string, string> = {
  Digital: "bg-marino/8 text-marino",
  Gráfico: "bg-terracota/10 text-terracota",
  Radio: "bg-lino text-marino",
  TV: "bg-marino-osc/8 text-marino-osc",
}

// PLACEHOLDER — reemplazar por clipping real cuando Marian lo envíe
const MEDIOS = [
  {
    medio: "La Nación",
    type: "Gráfico",
    sector: "Empresas & Agro",
    cliente: "Grupo Presidente",
    headline: "Grupo Presidente expande operaciones en el mercado vitivinícola mendocino.",
    year: "2024",
    month: "Nov",
  },
  {
    medio: "MDZ Online",
    type: "Digital",
    sector: "Empresas & Agro",
    cliente: "Bolsa de Comercio",
    headline: "La Bolsa de Comercio de Mendoza impulsa la transformación digital del sector.",
    year: "2024",
    month: "Sep",
  },
  {
    medio: "Los Andes",
    type: "Gráfico",
    sector: "Marcas Personales",
    cliente: "Dra. Elina Meneo",
    headline: "La Dra. Elina Meneo y su enfoque innovador en la medicina preventiva regional.",
    year: "2024",
    month: "Ago",
  },
  {
    medio: "Infobae",
    type: "Digital",
    sector: "Marcas Personales",
    cliente: "QuienVino",
    headline: "QuienVino: la plataforma mendocina que está redefiniendo el turismo del vino.",
    year: "2024",
    month: "Jul",
  },
  {
    medio: "Radio Nihuil",
    type: "Radio",
    sector: "Instituciones & Eventos",
    cliente: "Capilla Acutis",
    headline: "La Capilla Acutis y su propuesta cultural en el corazón de Mendoza.",
    year: "2023",
    month: "Dic",
  },
  {
    medio: "Diario UNO",
    type: "Digital",
    sector: "Empresas & Agro",
    cliente: "Agrocosecha",
    headline: "Agrocosecha apuesta por la trazabilidad y la comunicación transparente en el agro.",
    year: "2023",
    month: "Oct",
  },
]

const SECTOR_FILTERS = ["Todos", "Empresas & Agro", "Marcas Personales", "Instituciones & Eventos"]
const FORMAT_FILTERS = ["Todos", "Digital", "Gráfico", "Radio", "TV"]

export function MediaGrid() {
  const [activeSector, setActiveSector] = useState("Todos")
  const [activeFormat, setActiveFormat] = useState("Todos")

  const filtered = MEDIOS.filter((m) => {
    const sectorMatch = activeSector === "Todos" || m.sector === activeSector
    const formatMatch = activeFormat === "Todos" || m.type === activeFormat
    return sectorMatch && formatMatch
  })

  return (
    <div>
      {/* Fila 1 — Filtros por sector */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gris-tx/40 self-center mr-1">
          Sector
        </span>
        {SECTOR_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveSector(f)}
            className={`font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-all ${
              activeSector === f
                ? "bg-bordo text-hueso border-bordo"
                : "bg-white text-marino/60 border-marino/15 hover:border-marino/40 hover:text-marino"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Fila 2 — Filtros por formato */}
      <div className="flex flex-wrap gap-2 mb-10">
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gris-tx/40 self-center mr-1">
          Formato
        </span>
        {FORMAT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFormat(f)}
            className={`font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-all ${
              activeFormat === f
                ? "bg-marino text-white border-marino"
                : "bg-white text-marino/60 border-marino/15 hover:border-marino/40 hover:text-marino"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-gris-tx/50 self-center">
          {filtered.length} gestiones
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, i) => (
          <article
            key={`${item.medio}-${i}`}
            className="group bg-white border border-marino/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-marino/25 hover:shadow-[0_8px_30px_-8px_rgba(28,46,74,0.12)] transition-all duration-300"
          >
            {/* Cliente eyebrow */}
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-bordo/70">
              Gestión para {item.cliente}
            </p>

            <div className="flex items-center justify-between gap-3">
              <p className="font-playfair font-bold text-marino text-lg leading-snug">{item.medio}</p>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full shrink-0 ${
                  TYPE_COLORS[item.type] ?? "bg-lino text-marino"
                }`}
              >
                {item.type}
              </span>
            </div>

            <p className="font-sans text-gris-tx text-sm leading-relaxed flex-1">{item.headline}</p>

            <div className="flex items-center justify-between pt-1 border-t border-marino/6">
              <span className="font-mono text-[11px] text-gris-tx/60">
                {item.month} {item.year}
              </span>
              <ExternalLink
                size={13}
                className="text-marino/25 group-hover:text-terracota transition-colors"
                strokeWidth={1.5}
              />
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="font-sans text-gris-tx/50 text-sm text-center py-16">
          No hay gestiones para esta combinación de filtros.
        </p>
      )}
    </div>
  )
}
