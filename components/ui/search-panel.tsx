"use client"

/**
 * Panel del buscador global. Se monta una sola vez en el Navbar y se abre con
 * la lupa o con Ctrl/Cmd + K.
 *
 * Cómo funciona:
 *  - El índice completo del sitio baja de /api/buscar UNA vez por visita (se
 *    guarda en módulo, no en estado, así sobrevive al remount del panel y al
 *    doble efecto de React en dev).
 *  - El filtrado es local (lib/search-match.ts): escribir es instantáneo y no
 *    hay una request por tecla.
 *  - Patrón combobox: el foco NO se mueve de la caja de texto; las flechas
 *    cambian `activeIndex` y el item activo se anuncia con
 *    aria-activedescendant. Enter navega, Esc cierra.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowUpRight, Search, X } from "lucide-react"
import {
  KIND_LABELS,
  KIND_ORDER,
  type SearchDoc,
  type SearchKind,
} from "@/lib/search"
import {
  MIN_QUERY_LENGTH,
  countResults,
  highlightParts,
  prepareIndex,
  searchIndex,
  type IndexedDoc,
  type SearchGroup,
} from "@/lib/search-match"

// Índice ya normalizado, compartido por toda la visita. Fuera del componente a
// propósito: el panel se desmonta al cerrarse y no queremos volver a bajarlo.
let cachedIndex: IndexedDoc[] | null = null
let inFlight: Promise<IndexedDoc[]> | null = null

async function loadIndex(): Promise<IndexedDoc[]> {
  if (cachedIndex) return cachedIndex
  if (inFlight) return inFlight
  inFlight = (async () => {
    try {
      const res = await fetch("/api/buscar")
      if (!res.ok) throw new Error(String(res.status))
      const json = (await res.json()) as { docs?: SearchDoc[] }
      cachedIndex = prepareIndex(json.docs ?? [])
      return cachedIndex
    } catch {
      // Sin índice el panel sigue abriéndose y muestra los atajos: el buscador
      // nunca deja al visitante en un panel roto.
      cachedIndex = []
      return cachedIndex
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}

/** Atajos del estado vacío: adónde va la gente cuando no sabe qué buscar. */
const SHORTCUTS: { label: string; href: string }[] = [
  { label: "Campañas", href: "/campanas" },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Servicios", href: "/servicios" },
  { label: "Mis valores", href: "/mis-valores" },
  { label: "Reseñas", href: "/resenas" },
  { label: "Contacto", href: "/contacto" },
]

const MARK_STYLE: React.CSSProperties = {
  background: "rgba(201,168,130,0.45)",
  color: "inherit",
  borderRadius: 2,
  padding: "0 1px",
}

/** Texto con los términos de la búsqueda resaltados. */
function Highlight({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => highlightParts(text, query), [text, query])
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark key={i} style={MARK_STYLE}>
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}

// ─── Fila de resultado ────────────────────────────────────────────────────────

function ResultRow({
  doc,
  query,
  active,
  id,
  onHover,
  onNavigate,
}: {
  doc: SearchDoc
  query: string
  active: boolean
  id: string
  onHover: () => void
  onNavigate: () => void
}) {
  const inner = (
    <>
      <span className="min-w-0 flex-1">
        <span
          className="font-playfair block truncate"
          style={{
            fontSize: "var(--fs-caption)",
            fontWeight: 600,
            color: "var(--color-negro-bordo)",
            lineHeight: 1.35,
          }}
        >
          <Highlight text={doc.title} query={query} />
        </span>
        {doc.subtitle && (
          <span
            className="font-mono mt-1 block truncate uppercase"
            style={{
              fontSize: "var(--fs-micro)",
              letterSpacing: "0.1em",
              color: "var(--color-bordo)",
            }}
          >
            <Highlight text={doc.subtitle} query={query} />
          </span>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {doc.meta && (
          <span
            className="font-mono"
            style={{ fontSize: "var(--fs-micro)", color: "var(--color-gris-bordo)", opacity: 0.6 }}
          >
            {doc.meta}
          </span>
        )}
        {doc.external && (
          <ArrowUpRight
            size={13}
            strokeWidth={2}
            aria-hidden
            style={{ color: "var(--color-gris-bordo)", opacity: 0.6 }}
          />
        )}
      </span>
    </>
  )

  const className =
    "flex w-full items-center gap-3 rounded-lg px-3 text-left no-underline transition-colors"
  const style: React.CSSProperties = {
    minHeight: 52,
    background: active ? "rgba(102,0,31,0.07)" : "transparent",
  }

  // Las gacetillas apuntan al medio: enlace externo de verdad, en pestaña
  // nueva, igual que las tarjetas de /casos-de-exito.
  if (doc.external) {
    return (
      <a
        id={id}
        role="option"
        aria-selected={active}
        href={doc.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        onMouseEnter={onHover}
        onClick={onNavigate}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link
      id={id}
      role="option"
      aria-selected={active}
      href={doc.href}
      className={className}
      style={style}
      onMouseEnter={onHover}
      onClick={onNavigate}
    >
      {inner}
    </Link>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

/**
 * Cáscara: solo decide si el diálogo está montado. Todo el estado vive en
 * <SearchDialog>, que se monta al abrir y se desmonta al cerrar — así la
 * consulta y la selección arrancan limpias sin resetearlas desde un efecto.
 */
export function SearchPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop: un click afuera cierra. */}
          <motion.button
            type="button"
            aria-label="Cerrar el buscador"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.13 } }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] cursor-default backdrop-blur-sm"
            style={{ background: "rgba(42,15,22,0.45)" }}
          />

          <div
            className="fixed inset-x-0 top-0 z-[61] flex justify-center px-4"
            style={{ paddingTop: "clamp(16px, 9vh, 96px)", pointerEvents: "none" }}
          >
            <SearchDialog onClose={onClose} reduced={!!reduced} />
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function SearchDialog({
  onClose,
  reduced,
}: {
  onClose: () => void
  reduced: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [index, setIndex] = useState<IndexedDoc[] | null>(cachedIndex)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // El índice baja la primera vez que se abre el panel, no antes: en una visita
  // que nunca busca, el JSON no se pide nunca.
  useEffect(() => {
    if (index) return
    let alive = true
    loadIndex().then((docs) => {
      if (alive) setIndex(docs)
    })
    return () => {
      alive = false
    }
  }, [index])

  // Bloquea el scroll del fondo mientras el panel está abierto (mismo patrón
  // que el menú mobile del Navbar).
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  const groups: SearchGroup[] = useMemo(
    () => (index ? searchIndex(index, query, KIND_ORDER) : []),
    [index, query],
  )
  // Lista plana en el mismo orden visual: es sobre esta que navegan las flechas.
  const flatDocs: SearchDoc[] = useMemo(
    () => groups.flatMap((g) => g.docs),
    [groups],
  )
  const total = countResults(groups)

  // Mantiene visible el item activo al recorrer con las flechas.
  useEffect(() => {
    if (!flatDocs.length) return
    const el = listRef.current?.querySelector(`#search-opt-${activeIndex}`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, flatDocs.length])

  const go = useCallback(
    (doc: SearchDoc) => {
      onClose()
      if (doc.external) window.open(doc.href, "_blank", "noopener,noreferrer")
      else router.push(doc.href)
    },
    [onClose, router],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
      return
    }
    if (!flatDocs.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flatDocs.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + flatDocs.length) % flatDocs.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const doc = flatDocs[activeIndex]
      if (doc) go(doc)
    }
  }

  const queryIsShort =
    query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH
  const showShortcuts = !query.trim() || queryIsShort
  const loading = index === null

  const shortcuts = (
    <div className="flex flex-wrap gap-2">
      {SHORTCUTS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          onClick={onClose}
          className="font-sans inline-flex items-center no-underline"
          style={{
            minHeight: 40,
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid rgba(201,168,130,0.45)",
            fontSize: "var(--fs-eyebrow)",
            color: "var(--color-bordo)",
          }}
        >
          {s.label}
        </Link>
      ))}
    </div>
  )

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en el sitio"
      initial={{ opacity: 0, y: reduced ? 0 : -10, scale: reduced ? 1 : 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: reduced ? 0 : -8,
        scale: reduced ? 1 : 0.985,
        transition: { duration: reduced ? 0 : 0.14 },
      }}
      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
      onKeyDown={onKeyDown}
      className="w-full max-w-2xl overflow-hidden"
      style={{
        pointerEvents: "auto",
        background: "var(--color-hueso)",
        borderRadius: 14,
        border: "1px solid rgba(201,168,130,0.5)",
        boxShadow: "0 24px 64px -16px rgba(42,15,22,0.45)",
      }}
    >
      {/* ── Caja de texto ── */}
      <div
        className="flex items-center gap-3 px-4"
        style={{ minHeight: 60, borderBottom: "1px solid rgba(201,168,130,0.3)" }}
      >
        <Search
          size={18}
          strokeWidth={1.75}
          aria-hidden
          style={{ color: "var(--color-bordo)", flexShrink: 0 }}
        />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded={total > 0}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            flatDocs.length ? `search-opt-${activeIndex}` : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            // Cada tecleo vuelve la selección al primer resultado. Va acá, en
            // el handler, y no en un efecto sobre `query`.
            setActiveIndex(0)
          }}
          placeholder="Buscar campañas, gacetillas, servicios…"
          className="font-sans min-w-0 flex-1 bg-transparent outline-none"
          style={{
            fontSize: "var(--fs-body)",
            color: "var(--color-negro-bordo)",
            border: "none",
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar el buscador"
          className="flex shrink-0 items-center justify-center transition-opacity hover:opacity-100"
          style={{
            minHeight: 44,
            minWidth: 44,
            background: "transparent",
            border: "none",
            color: "var(--color-gris-bordo)",
            opacity: 0.6,
            cursor: "pointer",
          }}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* ── Resultados ── */}
      <div
        ref={listRef}
        id="search-results"
        role="listbox"
        aria-label="Resultados"
        className="overflow-y-auto"
        style={{ maxHeight: "min(62vh, 520px)", padding: "8px 8px 12px" }}
      >
        {loading && (
          <p
            className="font-mono px-3 py-4"
            style={{ fontSize: "var(--fs-eyebrow)", color: "var(--color-gris-bordo)", opacity: 0.6 }}
          >
            Cargando el contenido del sitio…
          </p>
        )}

        {!loading && showShortcuts && (
          <div className="px-3 pt-3 pb-2">
            <p
              className="font-mono uppercase"
              style={{
                fontSize: "var(--fs-micro)",
                letterSpacing: "0.18em",
                color: "var(--color-gris-bordo)",
                opacity: 0.55,
              }}
            >
              {queryIsShort ? "Seguí escribiendo" : "Ir a"}
            </p>
            <div className="mt-3">{shortcuts}</div>
          </div>
        )}

        {!loading && !showShortcuts && total === 0 && (
          <div className="px-3 py-4">
            <p
              className="font-sans"
              style={{ fontSize: "var(--fs-caption)", color: "var(--color-negro-bordo)" }}
            >
              No encontré nada para «{query.trim()}».
            </p>
            <div className="mt-4">{shortcuts}</div>
          </div>
        )}

        {!loading &&
          !showShortcuts &&
          total > 0 &&
          groups.map((group) => {
            // Índice global de la primera fila del grupo dentro de flatDocs,
            // para que las flechas y el click compartan el mismo numerado.
            const offset = flatDocs.indexOf(group.docs[0])
            return (
              <div key={group.kind} className="pt-2">
                <p
                  className="font-mono px-3 pb-1 uppercase"
                  style={{
                    fontSize: "var(--fs-micro)",
                    letterSpacing: "0.18em",
                    color: "var(--color-gris-bordo)",
                    opacity: 0.55,
                  }}
                >
                  {KIND_LABELS[group.kind as SearchKind]}
                </p>
                {group.docs.map((doc, i) => {
                  const flatIdx = offset + i
                  return (
                    <ResultRow
                      key={doc.id}
                      id={`search-opt-${flatIdx}`}
                      doc={doc}
                      query={query}
                      active={flatIdx === activeIndex}
                      onHover={() => setActiveIndex(flatIdx)}
                      onNavigate={onClose}
                    />
                  )
                })}
              </div>
            )
          })}
      </div>

      {/* ── Pie con las teclas ── */}
      <div
        className="hidden items-center gap-4 px-4 py-2.5 md:flex"
        style={{ borderTop: "1px solid rgba(201,168,130,0.3)" }}
      >
        {[
          { k: "↑↓", t: "navegar" },
          { k: "Enter", t: "abrir" },
          { k: "Esc", t: "cerrar" },
        ].map((hint) => (
          <span
            key={hint.k}
            className="font-mono flex items-center gap-1.5"
            style={{ fontSize: "var(--fs-micro)", color: "var(--color-gris-bordo)", opacity: 0.6 }}
          >
            <kbd
              style={{
                padding: "1px 5px",
                borderRadius: 3,
                border: "1px solid rgba(201,168,130,0.5)",
                fontFamily: "inherit",
              }}
            >
              {hint.k}
            </kbd>
            {hint.t}
          </span>
        ))}
        {total > 0 && (
          <span
            className="font-mono ml-auto"
            style={{ fontSize: "var(--fs-micro)", color: "var(--color-gris-bordo)", opacity: 0.6 }}
          >
            {total} {total === 1 ? "resultado" : "resultados"}
          </span>
        )}
      </div>
    </motion.div>
  )
}
