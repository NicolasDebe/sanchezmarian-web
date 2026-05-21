"use client"

import { useState } from "react"
import { ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { ARTICLES, CATEGORY_COLORS, CATEGORY_STRIP } from "./data"

const CATEGORIES = ["Todos", "Prensa", "Comunicación", "Relaciones Públicas"]

export function BlogGrid() {
  const [active, setActive] = useState("Todos")

  const filtered =
    active === "Todos" ? ARTICLES : ARTICLES.filter((a) => a.category === active)

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-12">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-all ${
              active === c
                ? "bg-marino text-white border-marino"
                : "bg-white text-marino/60 border-marino/15 hover:border-marino/40 hover:text-marino"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-gris-tx/50 self-center">
          {filtered.length} artículos
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((article, i) => (
          <Link
            key={i}
            href={`/blog/${article.slug}`}
            className="group flex flex-col bg-white border border-marino/10 rounded-2xl overflow-hidden hover:border-marino/20 hover:shadow-[0_8px_30px_-8px_rgba(28,46,74,0.10)] transition-all duration-300"
          >
            {/* Color strip */}
            <div className={`h-1.5 ${CATEGORY_STRIP[article.category] ?? "bg-lino"}`} />

            <div className="p-7 flex flex-col gap-4 flex-1">
              {/* Category + reading time */}
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${
                    CATEGORY_COLORS[article.category] ?? "bg-lino text-marino"
                  }`}
                >
                  {article.category}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-gris-tx/50">
                  <Clock size={11} strokeWidth={1.5} />
                  {article.readTime}
                </span>
              </div>

              <h3 className="font-playfair font-bold text-marino text-lg leading-snug group-hover:text-terracota transition-colors">
                {article.title}
              </h3>

              <p className="font-sans text-gris-tx text-sm leading-relaxed flex-1">{article.excerpt}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-marino/8">
                <span className="font-mono text-[10px] text-gris-tx/50">{article.date}</span>
                <span className="flex items-center gap-1 font-sans text-xs font-semibold text-marino/40 group-hover:text-terracota transition-colors">
                  Leer
                  <ArrowRight size={12} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Nota de contenido futuro */}
      <div className="mt-14 text-center py-10 border border-dashed border-marino/15 rounded-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-terracota mb-2">
          Próximamente
        </p>
        <p className="font-sans text-gris-tx text-sm">
          Nuevos artículos sobre comunicación estratégica, prensa y relaciones públicas.
        </p>
      </div>
    </div>
  )
}
