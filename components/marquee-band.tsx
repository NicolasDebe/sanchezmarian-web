const ITEMS = [
  "Comunicación estratégica",
  "Prensa y medios",
  "Marca personal",
  "Copywriting",
  "Social Media",
  "Asesoría 360°",
]

const DOT = (
  <span aria-hidden className="mx-8 text-dorado/50 font-sans font-light text-base select-none">
    ·
  </span>
)

function Track() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center shrink-0">
          <span className="font-playfair italic text-bordo text-xl sm:text-2xl tracking-wide whitespace-nowrap">
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
    <section className="bg-arena py-5 overflow-hidden border-y border-dorado/20" aria-label="Servicios">
      <div className="flex whitespace-nowrap animate-marquee">
        <Track />
        <Track />
      </div>
    </section>
  )
}
