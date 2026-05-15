const ITEMS = [
  "Comunicación estratégica",
  "Prensa y medios",
  "Marca personal",
  "Copywriting",
  "Social Media",
  "Asesoría 360°",
]

const DOT = (
  <span aria-hidden className="mx-6 text-white/40 font-sans font-light text-lg select-none">
    ·
  </span>
)

function Track() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center shrink-0">
          <span className="font-playfair italic text-white text-xl sm:text-2xl tracking-wide whitespace-nowrap">
            {item}
          </span>
          {DOT}
        </span>
      ))}
    </>
  )
}

export function MarqueeBand() {
  return (
    <section className="bg-terracota py-5 overflow-hidden" aria-label="Servicios">
      {/* El track se duplica: al llegar al 50% del ancho total, el loop es invisible */}
      <div className="flex whitespace-nowrap animate-marquee">
        <Track />
        <Track />
      </div>
    </section>
  )
}
