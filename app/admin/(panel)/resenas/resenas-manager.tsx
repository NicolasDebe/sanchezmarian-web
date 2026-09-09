"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Check, Copy, ExternalLink, MessageSquareQuote, X } from "lucide-react"
import { StarRating } from "@/components/star-rating"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { MODERATION_NOTE_MIN, type AdminTestimonial } from "@/lib/testimonials"
import { despublicarResena, publicarResena, rechazarResena } from "./actions"

/**
 * Panel de moderación de reseñas.
 *
 * Acá es donde una reseña pasa (o no) al sitio. Nada se publica solo.
 *
 * Desde que se sacó la confirmación por mail (2026-09-09), esta pantalla es el
 * ÚNICO filtro: la reseña entra derecho a la cola. Por eso cada fila trae el
 * link al perfil público de quien firma — es con lo que se chequea que la
 * persona sea quien dice ser.
 *
 * Lo que este panel NO hace, a propósito: editar el texto, el puntaje o los
 * datos del autor, y borrar filas. El contenido de una reseña es inmutable —si
 * no va, se rechaza y queda el registro del motivo—, así que no hay ninguna
 * pantalla desde la que se pueda retocar lo que alguien firmó.
 *
 * Las `pending_verification` no se muestran: son filas viejas del flujo con
 * doble opt-in, que ya no existe. Nada las produce.
 */

// ─── Pestañas ────────────────────────────────────────────────────────────────

/** Los tres estados que sí se moderan, en el orden en que se trabajan. */
const TABS = [
  { key: "pending_review", label: "Para revisar" },
  { key: "published", label: "Publicadas" },
  { key: "rejected", label: "Rechazadas" },
] as const

type TabKey = (typeof TABS)[number]["key"]

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
]

/**
 * "2026-09-08T14:23:00Z" → "8 sep 2026".
 *
 * Lee el string ISO con una regex en vez de construir un `Date`: este
 * componente se renderiza en el server y en el browser, y con `new Date()` el
 * día lo decidiría el huso horario de cada uno (error de hidratación en las
 * reseñas que llegan de madrugada). Mismo criterio que components/resena-card.
 */
function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return "—"
  const mes = MESES[Number(m[2]) - 1]
  return mes ? `${Number(m[3])} ${mes} ${m[1]}` : "—"
}

/** "2 de marcas · 1 de periodistas", omitiendo el que esté en cero. */
function desglose(rows: AdminTestimonial[]): string {
  const marcas = rows.filter((r) => r.reviewer_type === "marca").length
  const periodistas = rows.length - marcas
  const partes: string[] = []
  if (marcas) partes.push(`${marcas} de marca${marcas === 1 ? "" : "s"}`)
  if (periodistas)
    partes.push(`${periodistas} de periodista${periodistas === 1 ? "" : "s"}`)
  return partes.join(" · ")
}

// ─── Piezas de la fila ───────────────────────────────────────────────────────

/**
 * La distinción de tipo tiene que leerse de un vistazo: una reseña de un
 * periodista respalda algo distinto que la de un cliente. Periodista va en
 * bordó con borde; marca, en gris discreto. Mismo criterio que la tarjeta
 * pública (components/resena-card.tsx).
 */
function TypeBadge({ type }: { type: AdminTestimonial["reviewer_type"] }) {
  const esPeriodista = type === "periodista"
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: 9,
        letterSpacing: "0.1em",
        borderRadius: 100,
        padding: "4px 10px",
        whiteSpace: "nowrap",
        border: esPeriodista ? "1px solid rgba(102,0,31,0.5)" : "1px solid transparent",
        color: esPeriodista ? "var(--color-bordo)" : "rgba(74,48,64,0.55)",
      }}
    >
      {esPeriodista ? "Periodista" : "Marca"}
    </span>
  )
}

/** Botón de acción del pie de la fila. `tone` solo cambia el color. */
function RowAction({
  onClick,
  children,
  tone = "muted",
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  tone?: "primary" | "muted"
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-medium transition-colors hover:bg-[rgba(102,0,31,0.08)] disabled:opacity-50"
      style={{
        color: tone === "primary" ? "var(--color-bordo)" : "var(--color-gris-bordo)",
      }}
    >
      {children}
    </button>
  )
}

// ─── Diálogo con motivo (rechazar / despublicar) ─────────────────────────────

interface NoteDialogState {
  resena: AdminTestimonial
  /** Qué se está haciendo: cambia el copy y la acción, no el formulario. */
  kind: "reject" | "unpublish"
}

/**
 * Igual de accesible que ConfirmDialog (foco al abrir, Escape, click afuera),
 * pero con un campo de texto: el motivo es obligatorio porque es el único
 * registro de por qué se descartó o se bajó una reseña. Se guarda en
 * `moderation_note`, es interno y NO se le manda al autor.
 *
 * El mínimo de caracteres sale de `MODERATION_NOTE_MIN` (lib/testimonials.ts),
 * el mismo que valida el servidor: acá solo se adelanta el aviso.
 */
function NoteDialog({
  state,
  busy,
  onConfirm,
  onCancel,
}: {
  state: NoteDialogState | null
  busy: boolean
  onConfirm: (note: string) => void
  onCancel: () => void
}) {
  const [note, setNote] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const open = !!state

  // El motivo NO se limpia acá adentro: el padre monta este diálogo con una
  // `key` distinta por reseña, así cada apertura arranca con el campo vacío sin
  // un setState en el efecto (que dispara un render en cascada).
  useEffect(() => {
    if (!open) return
    textareaRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, busy, onCancel])

  if (!state) return null

  const { resena, kind } = state
  const esRechazo = kind === "reject"
  const clean = note.trim()
  const faltan = MODERATION_NOTE_MIN - clean.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,9,16,0.5)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-dialog-title"
        className="w-full rounded-2xl border p-6 shadow-xl sm:p-8"
        style={{
          maxWidth: 480,
          backgroundColor: "var(--color-hueso)",
          borderColor: "rgba(201,168,130,0.4)",
        }}
      >
        <h2
          id="note-dialog-title"
          className="font-playfair text-xl font-bold"
          style={{ color: "var(--color-negro-bordo)" }}
        >
          {esRechazo
            ? `¿Rechazar la reseña de ${resena.author_name}?`
            : `¿Despublicar la reseña de ${resena.author_name}?`}
        </h2>
        <p
          className="mt-3 font-sans text-sm leading-relaxed"
          style={{ color: "var(--color-gris-bordo)" }}
        >
          {esRechazo
            ? "No se le avisa nada a quien la escribió. Queda guardada con el motivo; si más adelante lo repensás, se puede publicar."
            : "Deja de verse en el sitio en aproximadamente un minuto y vuelve a «Para revisar», así queda pendiente de decisión."}
        </p>

        <label
          htmlFor="note-dialog-field"
          className="mt-5 block font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--color-bordo)" }}
        >
          Motivo (para vos)
        </label>
        <textarea
          id="note-dialog-field"
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 1000))}
          rows={3}
          disabled={busy}
          aria-describedby="note-dialog-help"
          placeholder={
            esRechazo
              ? "Ej.: no es un cliente real, no pudimos verificar quién es"
              : "Ej.: la persona pidió corregir el nombre de la marca"
          }
          className="admin-textarea mt-2"
        />
        <p
          id="note-dialog-help"
          className="mt-1.5 font-sans"
          style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.8 }}
        >
          {faltan > 0
            ? `Escribí al menos ${faltan} caracter${faltan === 1 ? "" : "es"} más.`
            : "Queda guardado acá adentro: no se publica ni se le manda al autor."}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border px-4 py-2 font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.04)] disabled:opacity-50"
            style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(clean)}
            disabled={busy || clean.length < MODERATION_NOTE_MIN}
            className="rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
          >
            {busy
              ? esRechazo
                ? "Rechazando…"
                : "Despublicando…"
              : esRechazo
                ? "Sí, rechazar"
                : "Sí, despublicar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Link para pedir reseñas ─────────────────────────────────────────────────

/**
 * El link que Marian manda por WhatsApp.
 *
 * La URL la arma el server desde el host de la request (ver page.tsx), no
 * `window.location` en un efecto: así se pinta completa en el primer render
 * —sin parpadeo ni riesgo de hidratación— y sirve igual en localhost, en el
 * preview de Vercel y en producción, sin depender de una env var.
 */
function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copiado")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar. Copialo a mano desde la barra del navegador.")
    }
  }

  return (
    <div
      className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
      style={{
        backgroundColor: "var(--color-hueso-oscuro)",
        borderColor: "rgba(201,168,130,0.3)",
      }}
    >
      <span
        className="font-mono uppercase"
        style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--color-bordo)" }}
      >
        Link para pedir reseñas
      </span>
      <code
        className="flex-1 truncate font-mono"
        style={{ fontSize: 12, color: "var(--color-gris-bordo)", minWidth: 180 }}
      >
        {url}
      </code>
      <button
        type="button"
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-medium transition-colors hover:bg-[rgba(102,0,31,0.08)]"
        style={{ color: "var(--color-bordo)" }}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  )
}

// ─── Fila ────────────────────────────────────────────────────────────────────

function ResenaRow({
  resena,
  busy,
  onPublish,
  onReject,
  onUnpublish,
}: {
  resena: AdminTestimonial
  busy: boolean
  onPublish: () => void
  onReject: () => void
  onUnpublish: () => void
}) {
  return (
    <article className="px-5 py-6 sm:px-6">
      {/* Tipo + estrellas + fecha de envío */}
      <div className="flex flex-wrap items-center gap-3">
        <TypeBadge type={resena.reviewer_type} />
        <StarRating rating={resena.rating} size={15} />
        <span
          className="ml-auto font-mono"
          style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.6 }}
        >
          Enviada el {formatDate(resena.created_at)}
        </span>
      </div>

      {/* Firma */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className="font-sans font-semibold"
          style={{ fontSize: 15, color: "var(--color-negro-bordo)" }}
        >
          {resena.author_name}
        </span>
        <span className="font-sans" style={{ fontSize: 13, color: "var(--color-gris-bordo)" }}>
          {resena.author_role} · {resena.author_brand}
        </span>
        <a
          href={resena.author_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-sans transition-colors hover:underline"
          style={{ fontSize: 12, color: "var(--color-bordo)" }}
        >
          Ver perfil
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Mail de contacto. Nunca sale del admin y no está verificado: sirve
          para poder escribirle a la persona, no como prueba de identidad. */}
      <p
        className="mt-1.5 font-mono"
        style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.75 }}
      >
        {resena.author_email}
      </p>

      {/* El texto completo, sin truncar: es lo que hay que leer para decidir. */}
      <p
        className="mt-4 font-sans leading-relaxed"
        style={{ fontSize: 14, color: "var(--color-negro-bordo)", whiteSpace: "pre-line" }}
      >
        {resena.body}
      </p>

      {/* Rastro de la moderación anterior */}
      {resena.moderated_at && (
        <div
          className="mt-4 rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(74,48,64,0.05)" }}
        >
          <p
            className="font-mono"
            style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.8 }}
          >
            Moderada el {formatDate(resena.moderated_at)}
            {resena.moderated_by && ` por ${resena.moderated_by}`}
          </p>
          {resena.moderation_note && (
            <p
              className="mt-1.5 font-sans"
              style={{ fontSize: 12, color: "var(--color-gris-bordo)" }}
            >
              <strong style={{ fontWeight: 600 }}>Motivo:</strong> {resena.moderation_note}
            </p>
          )}
        </div>
      )}

      {/* Acciones según el estado */}
      <div className="mt-4 flex flex-wrap items-center gap-1">
        {resena.status === "pending_review" && (
          <>
            <RowAction onClick={onPublish} tone="primary" disabled={busy}>
              <Check size={14} strokeWidth={2.5} />
              Publicar
            </RowAction>
            <RowAction onClick={onReject} disabled={busy}>
              <X size={14} strokeWidth={2.5} />
              Rechazar
            </RowAction>
          </>
        )}

        {resena.status === "published" && (
          <>
            <a
              href="/resenas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-medium transition-colors hover:bg-[rgba(102,0,31,0.08)]"
              style={{ color: "var(--color-gris-bordo)" }}
            >
              <ExternalLink size={13} />
              Ver en el sitio
            </a>
            <RowAction onClick={onUnpublish} disabled={busy}>
              <X size={14} strokeWidth={2.5} />
              Despublicar
            </RowAction>
          </>
        )}

        {resena.status === "rejected" && (
          <RowAction onClick={onPublish} tone="primary" disabled={busy}>
            <Check size={14} strokeWidth={2.5} />
            Publicar
          </RowAction>
        )}
      </div>
    </article>
  )
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function ResenasManager({
  resenas,
  shareUrl,
  loadError,
}: {
  /** Todas las reseñas en cualquier estado; el panel elige cuáles muestra. */
  resenas: AdminTestimonial[]
  /** URL absoluta del formulario público, armada en el server. */
  shareUrl: string
  loadError: boolean
}) {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>("pending_review")
  const [toPublish, setToPublish] = useState<AdminTestimonial | null>(null)
  const [noteDialog, setNoteDialog] = useState<NoteDialogState | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  /** Las de cada pestaña. Las pending_verification quedan afuera de todas. */
  const grupos = useMemo(() => {
    const base: Record<TabKey, AdminTestimonial[]> = {
      pending_review: [],
      published: [],
      rejected: [],
    }
    for (const r of resenas) {
      if (r.status in base) base[r.status as TabKey].push(r)
    }
    return base
  }, [resenas])

  const visibles = grupos[tab]

  /** Flechas para moverse entre pestañas, como espera un tablist. */
  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = TABS[(index + delta + TABS.length) % TABS.length].key
    setTab(next)
    tabRefs.current[next]?.focus()
  }

  async function handlePublish() {
    if (!toPublish) return
    setBusyId(toPublish.id)
    const result = await publicarResena(toPublish.id)
    setBusyId(null)
    setToPublish(null)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Reseña publicada. Se ve en el sitio en aproximadamente un minuto.")
    router.refresh()
  }

  async function handleNote(note: string) {
    if (!noteDialog) return
    const { resena, kind } = noteDialog
    setBusyId(resena.id)
    const result =
      kind === "reject"
        ? await rechazarResena(resena.id, note)
        : await despublicarResena(resena.id, note)
    setBusyId(null)
    setNoteDialog(null)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success(
      kind === "reject"
        ? "Reseña rechazada."
        : "Reseña despublicada. Volvió a «Para revisar».",
    )
    router.refresh()
  }

  const sinNingunaTodavia = !loadError && resenas.length === 0

  return (
    <div className="mx-auto" style={{ maxWidth: 960 }}>
      {/* ── Header ── */}
      <div>
        <p
          className="font-mono uppercase"
          style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
        >
          Moderación
        </p>
        <h1
          className="mt-2 font-playfair font-bold"
          style={{ fontSize: "clamp(40px, 5vw, 56px)", color: "var(--color-negro-bordo)" }}
        >
          Reseñas
        </h1>
        <p
          className="mt-3 font-sans text-sm leading-relaxed"
          style={{ color: "var(--color-gris-bordo)", maxWidth: 620 }}
        >
          Vos decidís cuáles se publican. Antes de aprobar una, abrí el perfil
          de quien la firma: es lo que confirma que sea quien dice ser. El
          texto no se edita ni se borra — si algo no va, se rechaza y queda el
          motivo registrado.
        </p>
      </div>

      {/* ── Aviso fijo ── */}
      <div
        className="mt-6 rounded-2xl border px-5 py-4"
        style={{
          borderColor: "rgba(201,168,130,0.4)",
          backgroundColor: "rgba(201,168,130,0.1)",
        }}
      >
        <p
          className="font-sans leading-relaxed"
          style={{ fontSize: 13, color: "var(--color-negro-bordo)", maxWidth: 700 }}
        >
          Rechazar deja registro del motivo. Tené presente que la persona que
          escribió la reseña sabe que la mandó: si se rechaza una crítica
          honesta, el costo es con esa marca.
        </p>
      </div>

      <ShareLink url={shareUrl} />

      {loadError && (
        <div
          className="mt-6 rounded-2xl border border-dashed p-6 font-sans text-sm"
          style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
        >
          No se pudieron cargar las reseñas. Recargá la página; si sigue igual,
          avisale a Nico (puede ser la conexión con Supabase).
        </div>
      )}

      {sinNingunaTodavia ? (
        /* Estado vacío */
        <div className="mt-12 flex flex-col items-center px-8 py-16 text-center">
          <MessageSquareQuote
            size={44}
            strokeWidth={1.5}
            style={{ color: "var(--color-dorado)", opacity: 0.45 }}
          />
          <p
            className="mt-5 font-playfair"
            style={{ fontSize: 22, fontWeight: 700, color: "var(--color-negro-bordo)" }}
          >
            Todavía no llegó ninguna reseña
          </p>
          <p
            className="mt-2 max-w-md font-sans"
            style={{ fontSize: 14, color: "var(--color-gris-bordo)", lineHeight: 1.6 }}
          >
            Compartí el link de arriba con clientes y periodistas con los que
            trabajaste. Cuando alguien escriba una y confirme su mail, la vas a
            ver acá para revisarla.
          </p>
        </div>
      ) : (
        !loadError && (
          <>
            {/* ── Pestañas ── */}
            <div
              role="tablist"
              aria-label="Reseñas por estado"
              className="mt-8 flex flex-wrap gap-2"
            >
              {TABS.map((t, i) => {
                const activo = tab === t.key
                const count = grupos[t.key].length
                return (
                  <button
                    key={t.key}
                    ref={(el) => {
                      tabRefs.current[t.key] = el
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${t.key}`}
                    aria-selected={activo}
                    aria-controls={`panel-${t.key}`}
                    // Roving tabindex: el tablist entero es UNA parada de
                    // tabulación; entre pestañas se navega con las flechas.
                    tabIndex={activo ? 0 : -1}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    onClick={() => setTab(t.key)}
                    className="rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors"
                    style={
                      activo
                        ? { background: "var(--color-bordo)", color: "var(--color-hueso)" }
                        : {
                            background: "var(--color-hueso-oscuro)",
                            color: "var(--color-gris-bordo)",
                            border: "1px solid rgba(201,168,130,0.35)",
                          }
                    }
                  >
                    {t.label}
                    <span style={{ opacity: 0.6, marginLeft: 8 }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* ── Panel de la pestaña activa ── */}
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              <p
                className="mt-5 font-mono uppercase"
                style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--color-gris-bordo)" }}
              >
                {visibles.length === 0
                  ? "Ninguna en este estado"
                  : `${visibles.length} reseña${visibles.length === 1 ? "" : "s"} · ${desglose(visibles)}`}
              </p>

              {visibles.length === 0 ? (
                <div
                  className="mt-4 rounded-2xl border border-dashed p-10 text-center font-sans text-sm"
                  style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
                >
                  {tab === "pending_review"
                    ? "No hay reseñas esperando revisión. Cuando llegue una nueva y su autor confirme el mail, aparece acá."
                    : tab === "published"
                      ? "Todavía no publicaste ninguna reseña."
                      : "No rechazaste ninguna reseña."}
                </div>
              ) : (
                <div
                  className="mt-4 divide-y overflow-hidden rounded-2xl border"
                  style={{
                    borderColor: "rgba(201,168,130,0.3)",
                    backgroundColor: "var(--color-hueso-oscuro)",
                  }}
                >
                  {visibles.map((r) => (
                    <ResenaRow
                      key={r.id}
                      resena={r}
                      busy={busyId === r.id}
                      onPublish={() => setToPublish(r)}
                      onReject={() => setNoteDialog({ resena: r, kind: "reject" })}
                      onUnpublish={() => setNoteDialog({ resena: r, kind: "unpublish" })}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )
      )}

      {/* Publicar: confirmación simple, sin motivo */}
      <ConfirmDialog
        open={!!toPublish}
        tone="primary"
        title={`¿Publicar la reseña de ${toPublish?.author_name ?? ""}?`}
        body="Va a aparecer en la página de reseñas, en el home y en servicios, con el nombre, el cargo y el link de quien la escribió."
        confirmLabel="Sí, publicar"
        busyLabel="Publicando…"
        busy={busyId !== null && busyId === toPublish?.id}
        onConfirm={handlePublish}
        onCancel={() => setToPublish(null)}
      />

      {/* Rechazar / despublicar: piden motivo */}
      <NoteDialog
        key={noteDialog ? `${noteDialog.kind}-${noteDialog.resena.id}` : "sin-reseña"}
        state={noteDialog}
        busy={busyId !== null && busyId === noteDialog?.resena.id}
        onConfirm={handleNote}
        onCancel={() => setNoteDialog(null)}
      />
    </div>
  )
}
