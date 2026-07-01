import type { Connection } from "@/lib/connections"

/**
 * Sección CONEXIONES — alianzas/disciplinas con las que se ejecuta cada
 * proyecto, como pills. Aparece en el home (fondo --arena) y al fondo de
 * /servicios (fondo --hueso, para respetar el ritmo alternado de esa página).
 * Contenido dinámico desde la tabla `connections` (editable en
 * /admin/conexiones); ver getActiveConnections().
 *
 * `bg` permite ajustar el fondo según dónde se inserte (default --arena).
 * Server component puro: los hovers de las pills son CSS (Tailwind), sin JS.
 */
export function Conexiones({
  connections,
  bg = "bg-arena",
}: {
  connections: Pick<Connection, "id" | "label">[]
  bg?: string
}) {
  if (connections.length === 0) return null

  return (
    <section className={`${bg} py-20 lg:py-28`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center lg:px-12">

        {/* Eyebrow */}
        <p
          className="font-mono uppercase text-bordo"
          style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.2em" }}
        >
          Conexiones
        </p>

        {/* Línea dorada */}
        <span aria-hidden className="my-6 h-px bg-dorado" style={{ width: 40 }} />

        {/* Subtítulo (encima del título) */}
        <p
          className="font-sans uppercase text-gris-bordo"
          style={{ fontSize: "var(--fs-body)", letterSpacing: "0.14em", marginBottom: 14 }}
        >
          Alianzas para llevar a cabo tu proyecto.
        </p>

        {/* Título con acento italic --bordo */}
        <h2
          className="font-playfair font-bold text-negro-bordo"
          style={{ fontSize: "var(--fs-h2)", lineHeight: "var(--lh-tight)", letterSpacing: "-0.02em", maxWidth: "18ch" }}
        >
          Un equipo <em className="italic text-bordo">conectado</em> para tu proyecto.
        </h2>

        {/* Pills */}
        <ul className="mt-12 flex flex-wrap justify-center gap-3">
          {connections.map((c) => (
            <li key={c.id}>
              <span
                className="inline-flex select-none items-center rounded-full border border-bordo/40 font-sans text-bordo transition-colors duration-300 hover:bg-bordo hover:text-hueso"
                style={{ padding: "10px 20px", fontSize: "calc(14px * var(--text-scale))" }}
              >
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
