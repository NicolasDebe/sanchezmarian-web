import Link from "next/link"

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">

      {/* CAPA 1: IMAGEN — define la altura del hero */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-marian.jpg"
        alt="Marian Sánchez — Estratega de comunicación en Mendoza"
        className="w-full block"
        style={{
          height: "auto",
          maxHeight: "95vh",
          minHeight: "480px",
          objectFit: "cover",
          objectPosition: "center top",
        }}
      />

      {/* CAPA 2: OVERLAY DESKTOP — horizontal, oscuro izq / transparente der */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.05) 60%, transparent 75%)",
        }}
      />

      {/* CAPA 2: OVERLAY MOBILE — vertical, transparente arriba / oscuro abajo */}
      <div
        className="absolute inset-0 pointer-events-none md:hidden"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* CAPA 3: TEXTO — centro en desktop, abajo en mobile */}
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-10 md:pb-0">
          <div className="max-w-lg">

            <p
              className="font-mono uppercase text-hueso/70 mb-5"
              style={{ fontSize: "11px", letterSpacing: "0.18em" }}
            >
              Estratega de comunicación · Mendoza, AR
            </p>

            <h1
              className="font-playfair font-bold text-hueso mb-6"
              style={{
                fontSize: "clamp(1.75rem, 5vw, 4rem)",
                lineHeight: "1.1",
              }}
            >
              Tu historia merece estar
              <em className="block italic text-hueso">en los medios.</em>
            </h1>

            <p
              className="font-sans text-hueso/85 mb-8"
              style={{
                fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                lineHeight: "1.7",
                maxWidth: "420px",
              }}
            >
              Conecto tu marca personal o empresarial con el ecosistema de
              medios de Mendoza de forma natural, aportando valor al periodista
              y visibilidad estratégica a tu proyecto.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 bg-bordo text-hueso px-7 py-3 rounded font-sans font-medium text-sm hover:bg-bordo-oscuro transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hueso"
              >
                Quiero aparecer en medios →
              </Link>
              <Link
                href="/servicios"
                className="inline-flex items-center gap-2 border border-hueso/60 text-hueso px-7 py-3 rounded font-sans font-medium text-sm hover:bg-hueso/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hueso"
              >
                Ver mis servicios
              </Link>
            </div>

          </div>
        </div>
      </div>

    </section>
  )
}
