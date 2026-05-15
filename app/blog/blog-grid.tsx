"use client"

import { useState } from "react"
import { ArrowRight, Clock } from "lucide-react"

const CATEGORIES = ["Todos", "Prensa", "Comunicación", "Copywriting", "Social Media"]

const ARTICLES = [
  {
    title: "Cómo conseguir que un periodista te cubra (sin conocerlo de antes)",
    category: "Prensa",
    date: "Dic 2024",
    readTime: "6 min",
    excerpt:
      "Tener relaciones con periodistas ayuda, pero no es el único camino. Te cuento las estrategias que funcionan para conseguir cobertura desde cero.",
  },
  {
    title: "Los 5 errores de comunicación que cometen los emprendedores",
    category: "Comunicación",
    date: "Nov 2024",
    readTime: "5 min",
    excerpt:
      "Desde comunicar sin estrategia hasta ignorar los medios locales. Estos son los errores más comunes — y cómo evitarlos.",
  },
  {
    title: "Tu historia de marca: cómo encontrarla y contarla bien",
    category: "Copywriting",
    date: "Oct 2024",
    readTime: "7 min",
    excerpt:
      "Todas las marcas tienen una historia. El problema es que pocas saben cómo contarla. Te explico el proceso que uso con mis clientes.",
  },
  {
    title: "Por qué tu Instagram no convierte (y qué hacer al respecto)",
    category: "Social Media",
    date: "Sep 2024",
    readTime: "5 min",
    excerpt:
      "El problema no es la cantidad de seguidores ni el algoritmo. Es la coherencia entre lo que publicás y lo que querés lograr.",
  },
  {
    title: "Gacetilla de prensa: qué es y cómo escribir una que se publique",
    category: "Prensa",
    date: "Jul 2024",
    readTime: "6 min",
    excerpt:
      "La gacetilla es la herramienta básica de la prensa. Pero la mayoría se escribe mal. Te muestro el formato que usan los medios para decidir qué publican.",
  },
  {
    title: "Comunicación en crisis: cómo proteger tu reputación",
    category: "Comunicación",
    date: "Jun 2024",
    readTime: "8 min",
    excerpt:
      "Cuando algo sale mal, la comunicación puede ser tu mayor activo o tu peor enemigo. Las claves para manejar una crisis sin empeorarla.",
  },
  {
    title: "Newsletter vs redes sociales: cuál funciona mejor para tu negocio",
    category: "Social Media",
    date: "May 2024",
    readTime: "5 min",
    excerpt:
      "No son excluyentes, pero tampoco son iguales. Te ayudo a decidir en cuál invertir tu tiempo y energía según tus objetivos.",
  },
  {
    title: "Marca personal para profesionales: la guía que nadie te da",
    category: "Comunicación",
    date: "Abr 2024",
    readTime: "9 min",
    excerpt:
      "Construir una marca personal no es vanidad, es estrategia. Todo lo que necesitás saber para posicionarte como referente en tu industria.",
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Prensa: "bg-marino/8 text-marino",
  Comunicación: "bg-terracota/10 text-terracota",
  Copywriting: "bg-lino text-marino",
  "Social Media": "bg-arena text-gris-tx",
}

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
          <article
            key={i}
            className="group flex flex-col bg-white border border-marino/10 rounded-2xl overflow-hidden hover:border-marino/20 hover:shadow-[0_8px_30px_-8px_rgba(28,46,74,0.10)] transition-all duration-300"
          >
            {/* Color strip */}
            <div
              className={`h-1.5 ${
                article.category === "Prensa"
                  ? "bg-marino"
                  : article.category === "Comunicación"
                  ? "bg-terracota"
                  : article.category === "Copywriting"
                  ? "bg-lino"
                  : "bg-arena border-b border-marino/10"
              }`}
            />

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
          </article>
        ))}
      </div>

      {/* Nota de contenido futuro */}
      <div className="mt-14 text-center py-10 border border-dashed border-marino/15 rounded-2xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-terracota mb-2">
          Próximamente
        </p>
        <p className="font-sans text-gris-tx text-sm">
          Nuevos artículos sobre comunicación estratégica, prensa y marca personal.
        </p>
      </div>
    </div>
  )
}
