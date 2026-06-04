const ITEMS = [
  "Prensa y Comunicación Multiplataforma",
  "Comunicación Estratégica",
  "Relaciones Públicas",
  "Eventos Institucionales",
  "Narrativas multiplataforma",
  "Visibilidad real",
]

const DOT = (
  <span aria-hidden className="mx-8 text-dorado font-sans text-base select-none">
    ·
  </span>
)

function Track() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center shrink-0">
          <span className="font-playfair italic text-hueso/90 text-xl sm:text-[1.375rem] tracking-wide whitespace-nowrap">
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
    <section className="bg-bordo py-5 overflow-hidden" aria-label="Servicios">
      <div className="flex whitespace-nowrap animate-marquee">
        <Track />
        <Track />
      </div>
    </section>
  )
}
