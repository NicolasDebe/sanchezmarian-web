"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

const TYPE_COLORS: Record<string, string> = {
  Digital: "bg-marino/8 text-marino",
  Gráfico: "bg-terracota/10 text-terracota",
  Radio: "bg-lino text-marino",
  TV: "bg-marino-osc/8 text-marino-osc",
}

const MEDIOS = [
  // 2024
  {
    medio: "La Nación",
    type: "Gráfico",
    headline: "Cómo construir una marca personal sólida en el mercado actual",
    year: "2024",
    month: "Nov",
  },
  {
    medio: "MDZ Online",
    type: "Digital",
    headline: "Las claves para que tu negocio aparezca en los medios que importan",
    year: "2024",
    month: "Sep",
  },
  {
    medio: "Los Andes",
    type: "Gráfico",
    headline: "Consultoras mendocinas que transforman la comunicación empresarial",
    year: "2024",
    month: "Ago",
  },
  {
    medio: "Infobae",
    type: "Digital",
    headline: "Estrategias de prensa para emprendedores y profesionales independientes",
    year: "2024",
    month: "Jul",
  },
  // 2023
  {
    medio: "Radio Nihuil",
    type: "Radio",
    headline: "Comunicación estratégica: cómo hablarle a tu audiencia ideal",
    year: "2023",
    month: "Dic",
  },
  {
    medio: "Diario UNO",
    type: "Digital",
    headline: "El rol de la comunicación en el crecimiento de las PyMEs mendocinas",
    year: "2023",
    month: "Oct",
  },
  {
    medio: "El Sol",
    type: "Digital",
    headline: "Prensa y redes: cómo construir autoridad desde Mendoza",
    year: "2023",
    month: "Ago",
  },
  {
    medio: "Mendoza Online",
    type: "Digital",
    headline: "GB Consulting: comunicación estratégica para negocios que crecen",
    year: "2023",
    month: "Jun",
  },
  // 2022
  {
    medio: "Clarín",
    type: "Digital",
    headline: "Las herramientas de comunicación que todo profesional independiente necesita",
    year: "2022",
    month: "Nov",
  },
  {
    medio: "Los Andes",
    type: "Gráfico",
    headline: "Mujeres que construyen empresas de comunicación en el interior del país",
    year: "2022",
    month: "Sep",
  },
  {
    medio: "Radio Nacional Mendoza",
    type: "Radio",
    headline: "El poder del storytelling en la comunicación empresarial",
    year: "2022",
    month: "Jul",
  },
  {
    medio: "Canal 9 Mendoza",
    type: "TV",
    headline: "Emprendedoras mendocinas: historias de negocios exitosos",
    year: "2022",
    month: "May",
  },
  // 2021
  {
    medio: "El Cronista",
    type: "Digital",
    headline: "Comunicación de crisis: cómo proteger tu marca en tiempos de incertidumbre",
    year: "2021",
    month: "Nov",
  },
  {
    medio: "MDZ Online",
    type: "Digital",
    headline: "Reinvención digital: comunicación en el nuevo ecosistema post-pandemia",
    year: "2021",
    month: "Ago",
  },
  {
    medio: "Diario UNO",
    type: "Gráfico",
    headline: "Mendoza como polo de servicios creativos y de comunicación",
    year: "2021",
    month: "Mar",
  },
]

const FILTERS = ["Todos", "Digital", "Gráfico", "Radio", "TV"]

export function MediaGrid() {
  const [active, setActive] = useState("Todos")

  const filtered = active === "Todos" ? MEDIOS : MEDIOS.filter((m) => m.type === active)

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-all ${
              active === f
                ? "bg-marino text-white border-marino"
                : "bg-white text-marino/60 border-marino/15 hover:border-marino/40 hover:text-marino"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-gris-tx/50 self-center">
          {filtered.length} apariciones
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, i) => (
          <article
            key={`${item.medio}-${i}`}
            className="group bg-white border border-marino/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-marino/25 hover:shadow-[0_8px_30px_-8px_rgba(28,46,74,0.12)] transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <p className="font-playfair font-bold text-marino text-lg">{item.medio}</p>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${
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
    </div>
  )
}
