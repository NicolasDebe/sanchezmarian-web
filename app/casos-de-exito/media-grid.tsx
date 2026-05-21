"use client"

import { useState, useId } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ExternalLink } from "lucide-react"
import { CLIPPINGS_SORTED, CATEGORIAS, type Categoria } from "@/data/clippings"

const EASE = [0.22, 1, 0.36, 1] as const

const COUNTS: Record<string, number> = {
  Todos: CLIPPINGS_SORTED.length,
  ...Object.fromEntries(
    CATEGORIAS.map((cat) => [cat, CLIPPINGS_SORTED.filter((c) => c.categoria === cat).length])
  ),
}

const FILTERS = ["Todos", ...CATEGORIAS] as const

function ClippingCard({
  cliente,
  medio,
  formato,
  alcance,
  titular,
  año,
  link,
}: (typeof CLIPPINGS_SORTED)[number]) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white flex flex-col gap-3 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(102,0,31,0.08)]"
      style={{ borderLeft: "3px solid var(--color-bordo)" }}
    >
      {/* Cliente */}
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bordo leading-none">
        {cliente}
      </p>

      {/* Medio + badges */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-playfair font-bold text-negro-bordo text-[0.875rem] leading-snug">
          {medio}
        </p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-arena text-gris-bordo whitespace-nowrap">
            {formato}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-bordo/10 text-bordo whitespace-nowrap">
            {alcance}
          </span>
        </div>
      </div>

      {/* Titular */}
      <p className="font-sans text-[0.875rem] text-negro-bordo leading-[1.4] line-clamp-2 flex-1">
        {titular}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-bordo/6">
        <span className="font-mono text-[11px] text-gris-bordo/50">{año}</span>
        <ExternalLink
          size={13}
          strokeWidth={1.5}
          className="text-bordo opacity-30 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>
    </a>
  )
}

export function MediaGrid() {
  const [activeFilter, setActiveFilter] = useState<string>("Todos")
  const gridId = useId()

  const filtered =
    activeFilter === "Todos"
      ? CLIPPINGS_SORTED
      : CLIPPINGS_SORTED.filter((c) => c.categoria === (activeFilter as Categoria))

  return (
    <div>
      {/* Filtros */}
      <div className="sticky top-[72px] z-20 bg-white/90 backdrop-blur-sm py-4 mb-10 -mx-6 px-6 lg:-mx-12 lg:px-12 border-b border-bordo/8">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeFilter === f
                  ? "bg-bordo text-hueso border-bordo"
                  : "bg-white text-bordo border-bordo hover:bg-bordo/5"
              }`}
            >
              {f}
              <span className="ml-1.5 opacity-60">({COUNTS[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteo */}
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gris-bordo/50 mb-6">
        {filtered.length} {filtered.length === 1 ? "gestión" : "gestiones"}
      </p>

      {/* Grid con fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          id={gridId}
        >
          {filtered.map((item) => (
            <ClippingCard key={item.id} {...item} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="font-sans text-gris-bordo/50 text-sm text-center py-16">
          No hay gestiones para este filtro.
        </p>
      )}
    </div>
  )
}
