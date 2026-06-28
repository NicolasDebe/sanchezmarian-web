"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Plus, Sparkles, X, Headphones, UploadCloud, Loader2 } from "lucide-react"
import {
  SCOPES,
  FORMATS,
  SCOPE_LABELS,
  type DbClipping,
  type ClippingScope,
  type ClippingFormat,
} from "@/lib/clippings"
import { audioFileError, AUDIO_ACCEPT_ATTR, audioFileLabel } from "@/lib/audio"
import { AudioPlayer } from "@/components/audio-player"
import {
  createClipping,
  updateClipping,
  deleteClipping,
  extractMetadataFromURL,
  uploadClippingAudio,
  removeClippingAudio,
  updateAudioDuration,
  type ClippingInput,
} from "../actions"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

interface FormState {
  url: string
  medium: string
  title: string
  published_at: string
  scope: ClippingScope | ""
  format: ClippingFormat
  audio_url: string | null
  audio_duration_seconds: number | null
}

const EMPTY_FORM: FormState = {
  url: "",
  medium: "",
  title: "",
  published_at: "",
  scope: "",
  format: "Digital",
  audio_url: null,
  audio_duration_seconds: null,
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

/** Warnings de fecha (no bloquean el guardado). */
function dateWarning(iso: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const today = new Date().toISOString().slice(0, 10)
  if (iso > today) return "Ojo: la fecha es futura. Podés guardar igual si es correcta."
  if (iso < "2010-01-01") return "Ojo: la fecha es anterior a 2010. Revisá que sea correcta."
  return null
}

/** Calcula la duración (segundos) de un audio en el browser, sin bloquear. */
function probeDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const a = new Audio()
      a.preload = "metadata"
      const done = (val: number | null) => {
        a.removeEventListener("loadedmetadata", onMeta)
        a.removeEventListener("error", onErr)
        resolve(val)
      }
      const onMeta = () => done(Number.isFinite(a.duration) && a.duration > 0 ? a.duration : null)
      const onErr = () => done(null)
      a.addEventListener("loadedmetadata", onMeta)
      a.addEventListener("error", onErr)
      a.src = url
      // Salvaguarda: si nunca dispara, resolvemos en 8s.
      setTimeout(() => done(null), 8000)
    } catch {
      resolve(null)
    }
  })
}

// ─── Campo de audio (upload + player + eliminar) ──────────────────────────────

function AudioField({
  clientSlug,
  clippingId,
  audioUrl,
  durationSeconds,
  onChange,
}: {
  clientSlug: string
  /** id del clipping si ya existe (modo edición); null en alta. */
  clippingId: string | null
  audioUrl: string | null
  durationSeconds: number | null
  onChange: (next: { audio_url: string | null; audio_duration_seconds: number | null }) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    // Validación en cliente ANTES de subir (misma lógica que el servidor).
    const invalid = audioFileError({ name: file.name, type: file.type, size: file.size })
    if (invalid) {
      setError(invalid)
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.set("audio", file)
      fd.set("client_slug", clientSlug)
      if (clippingId) fd.set("clipping_id", clippingId)

      const result = await uploadClippingAudio(fd)
      if (!result.success) {
        setError(result.error)
        return
      }

      onChange({ audio_url: result.url, audio_duration_seconds: null })

      // Duración en el browser (no bloquea: el audio ya quedó asociado).
      const dur = await probeDuration(result.url)
      if (dur != null) {
        onChange({ audio_url: result.url, audio_duration_seconds: Math.round(dur) })
        if (clippingId) {
          // En edición persistimos la duración aunque no se guarde el form.
          void updateAudioDuration(clippingId, dur)
        }
      }
    } catch {
      setError("No se pudo subir el audio. Probá de nuevo.")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!audioUrl) return
    const ok = window.confirm("¿Eliminar el audio de este clipping?")
    if (!ok) return
    setRemoving(true)
    setError(null)
    try {
      const result = await removeClippingAudio(clippingId, audioUrl)
      if (!result.success) {
        setError(result.error)
        return
      }
      onChange({ audio_url: null, audio_duration_seconds: null })
    } catch {
      setError("No se pudo eliminar el audio. Probá de nuevo.")
    } finally {
      setRemoving(false)
    }
  }

  // ── Ya hay audio: player compacto + eliminar ──
  if (audioUrl) {
    return (
      <div className="flex flex-col gap-2.5">
        <div
          className="flex items-center justify-between gap-2 font-mono"
          style={{ fontSize: 11, color: "var(--color-gris-bordo)" }}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Headphones size={12} style={{ color: "var(--color-bordo)", flexShrink: 0 }} />
            <span className="truncate" title={audioFileLabel(audioUrl)}>
              {audioFileLabel(audioUrl)}
            </span>
          </span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-sans text-xs font-semibold transition-opacity hover:opacity-85 disabled:opacity-60"
            style={{ borderColor: "var(--color-bordo)", color: "var(--color-bordo)" }}
          >
            <Trash2 size={13} />
            {removing ? "Eliminando…" : "Eliminar audio"}
          </button>
        </div>
        <AudioPlayer src={audioUrl} duration={durationSeconds} variant="compact" />
        {error && (
          <p className="font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
            {error}
          </p>
        )}
      </div>
    )
  }

  // ── Sin audio: dropzone ──
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!uploading) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (uploading) return
          const file = e.dataTransfer.files?.[0]
          if (file) void handleFile(file)
        }}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-2 text-center transition-colors"
        style={{
          border: `2px dashed ${dragOver ? "rgba(102,0,31,0.6)" : "rgba(102,0,31,0.3)"}`,
          borderRadius: 12,
          padding: 32,
          background: dragOver ? "rgba(240,232,216,0.5)" : "transparent",
          cursor: uploading ? "default" : "pointer",
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-bordo)" }} />
            <span className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
              Subiendo…
            </span>
          </>
        ) : (
          <>
            <UploadCloud size={24} style={{ color: "var(--color-bordo)" }} />
            <span className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
              Arrastrá un archivo de audio acá o hacé click para elegir
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--color-gris-bordo)" }}>
              MP3, M4A, WAV u OGG · Máximo 30 MB
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={AUDIO_ACCEPT_ATTR}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = "" // permitir re-seleccionar el mismo archivo
        }}
      />
      {error && (
        <p className="font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ClippingsManager({
  clientId,
  clientSlug,
  clippings,
  mediums,
}: {
  clientId: string
  clientSlug: string
  clippings: DbClipping[]
  mediums: string[]
}) {
  const router = useRouter()
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; id: string }>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractMsg, setExtractMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  function openCreate() {
    setForm(EMPTY_FORM)
    setErrors({})
    setExtractMsg(null)
    setModal({ mode: "create" })
  }

  function openEdit(c: DbClipping) {
    setForm({
      url: c.url ?? "",
      medium: c.medium,
      title: c.title,
      published_at: c.published_at.slice(0, 10),
      scope: c.scope,
      format: c.format,
      audio_url: c.audio_url,
      audio_duration_seconds: c.audio_duration_seconds,
    })
    setErrors({})
    setExtractMsg(null)
    setModal({ mode: "edit", id: c.id })
  }

  function closeModal() {
    if (saving) return
    setModal(null)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "", _content: "" }))
  }

  // ── Auto-completar ──
  async function handleExtract() {
    setExtractMsg(null)
    if (!form.url.trim()) {
      setErrors((e) => ({ ...e, url: "Pegá primero la URL de la nota." }))
      return
    }
    if (!isHttpUrl(form.url.trim())) {
      setErrors((e) => ({ ...e, url: "La URL debe empezar con http:// o https://." }))
      return
    }
    setExtracting(true)
    try {
      const meta = await extractMetadataFromURL(form.url.trim())
      const found: string[] = []
      setForm((prev) => ({
        ...prev,
        medium: meta.medium ?? prev.medium,
        title: meta.title ?? prev.title,
        published_at: meta.published_at ?? prev.published_at,
      }))
      if (meta.medium) found.push("medio")
      if (meta.title) found.push("título")
      if (meta.published_at) found.push("fecha")
      setExtractMsg(
        found.length === 0
          ? "No pudimos leer los datos automáticamente — completá manualmente."
          : `Se completó: ${found.join(", ")}. Revisá antes de guardar.`,
      )
    } catch {
      setExtractMsg("No pudimos leer los datos automáticamente — completá manualmente.")
    } finally {
      setExtracting(false)
    }
  }

  // ── Guardado ──
  function validate(): boolean {
    const next: Record<string, string> = {}
    const hasUrl = !!form.url.trim()
    const hasAudio = !!form.audio_url
    if (hasUrl && !isHttpUrl(form.url.trim())) {
      next.url = "La URL debe empezar con http:// o https://."
    }
    if (!hasUrl && !hasAudio) next._content = "Agregá una URL o un audio (al menos uno)."
    if (!form.medium.trim()) next.medium = "El medio es obligatorio."
    if (!form.title.trim()) next.title = "El título es obligatorio."
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.published_at)) next.published_at = "La fecha es obligatoria."
    if (!form.scope) next.scope = "Elegí el alcance."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave(addAnother: boolean) {
    if (!modal) return
    setErrors((e) => ({ ...e, _global: "" }))
    if (!validate()) return
    setSaving(true)
    const payload: ClippingInput = {
      client_id: clientId,
      medium: form.medium.trim(),
      title: form.title.trim(),
      published_at: form.published_at,
      scope: form.scope as ClippingScope,
      format: form.format,
      url: form.url.trim() || null,
    }
    // Solo adjuntamos los campos de audio cuando hay audio: así, mientras la
    // migración 20260628 no esté corrida (columnas inexistentes), los clippings
    // de solo-URL se siguen guardando sin tocar columnas que no existen. Cuando
    // se elimina un audio, removeClippingAudio ya dejó la columna en null.
    if (form.audio_url) {
      payload.audio_url = form.audio_url
      payload.audio_duration_seconds = form.audio_duration_seconds
    }
    try {
      const result =
        modal.mode === "create"
          ? await createClipping(payload)
          : await updateClipping(modal.id, payload)

      if (!result.success) {
        console.error("[clipping] guardado falló:", result.error, payload)
        setErrors((e) => ({ ...e, _global: result.error }))
        return
      }

      setToast(modal.mode === "create" ? "Clipping guardado." : "Cambios guardados.")
      router.refresh()
      if (addAnother && modal.mode === "create") {
        setForm(EMPTY_FORM)
        setErrors({})
        setExtractMsg(null)
      } else {
        setModal(null)
      }
    } catch {
      setErrors((e) => ({
        ...e,
        _global:
          "No se pudo guardar. Revisá tu conexión y volvé a intentar. Si el problema persiste, puede faltar correr la migración de la base.",
      }))
    } finally {
      setSaving(false)
    }
  }

  // ── Eliminar ──
  async function handleDelete(c: DbClipping) {
    const ok = window.confirm("¿Eliminar este clipping? Esta acción no se puede deshacer.")
    if (!ok) return
    setDeletingId(c.id)
    const result = await deleteClipping(c.id)
    setDeletingId(null)
    if (!result.success) {
      setToast(result.error)
      return
    }
    setToast("Clipping eliminado.")
    router.refresh()
  }

  const warning = dateWarning(form.published_at)

  return (
    <>
      {/* Header acciones */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="font-sans text-sm" style={{ color: "var(--color-gris-bordo)" }}>
          {clippings.length === 0
            ? "Este cliente no tiene clippings."
            : `${clippings.length} clipping${clippings.length === 1 ? "" : "s"}, del más reciente al más viejo.`}
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Nuevo clipping
        </button>
      </div>

      {/* Tabla */}
      {clippings.length === 0 ? (
        <div
          className="mt-6 rounded-2xl border border-dashed p-10 text-center font-sans text-sm"
          style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
        >
          Este cliente no tiene clippings — agregá el primero con el botón de arriba.
        </div>
      ) : (
        <div
          className="mt-6 overflow-x-auto rounded-2xl border"
          style={{ borderColor: "rgba(201,168,130,0.3)", backgroundColor: "var(--color-hueso-oscuro)" }}
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,168,130,0.3)" }}>
                {["Fecha", "Medio", "Título", "Alcance", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-mono uppercase"
                    style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--color-bordo)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clippings.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid rgba(201,168,130,0.15)" }}>
                  <td
                    className="whitespace-nowrap px-4 py-3 font-mono"
                    style={{ fontSize: 12, color: "var(--color-negro-bordo)" }}
                  >
                    {formatDate(c.published_at)}
                  </td>
                  <td
                    className="whitespace-nowrap px-4 py-3 font-sans text-sm font-medium"
                    style={{ color: "var(--color-negro-bordo)" }}
                  >
                    {c.medium}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm" style={{ color: "var(--color-gris-bordo)", maxWidth: 360 }}>
                    <span className="flex items-start gap-1.5">
                      {c.audio_url && (
                        <Headphones
                          size={14}
                          aria-label="Tiene audio"
                          style={{ color: "var(--color-bordo)", flexShrink: 0, marginTop: 2 }}
                        >
                          <title>Tiene audio</title>
                        </Headphones>
                      )}
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 transition-opacity hover:opacity-70"
                          title={c.title}
                        >
                          {c.title}
                        </a>
                      ) : (
                        <span className="line-clamp-2" title={c.title}>
                          {c.title}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 font-mono"
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        backgroundColor: "rgba(201,168,130,0.18)",
                        color: "var(--color-negro-bordo)",
                      }}
                    >
                      {SCOPE_LABELS[c.scope] ?? c.scope}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        aria-label="Editar"
                        className="rounded-lg p-2 transition-colors hover:bg-[rgba(102,0,31,0.08)]"
                        style={{ color: "var(--color-gris-bordo)" }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        aria-label="Eliminar"
                        className="rounded-lg p-2 transition-colors hover:bg-[rgba(102,0,31,0.08)] disabled:opacity-50"
                        style={{ color: "var(--color-bordo)" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal alta/edición ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          style={{ backgroundColor: "rgba(26,9,16,0.5)" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            className="w-full rounded-2xl border p-6 shadow-xl sm:p-8"
            style={{
              maxWidth: 600,
              backgroundColor: "var(--color-hueso)",
              borderColor: "rgba(201,168,130,0.4)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-xl font-bold" style={{ color: "var(--color-negro-bordo)" }}>
                {modal.mode === "create" ? "Nuevo clipping" : "Editar clipping"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar"
                className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(102,0,31,0.08)]"
                style={{ color: "var(--color-gris-bordo)" }}
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 font-sans text-xs" style={{ color: "var(--color-gris-bordo)" }}>
              Un clipping puede tener URL, audio, o ambos. Mínimo uno.
            </p>

            {/* URL + auto-completar */}
            <div className="mt-5 flex flex-col gap-1.5">
              <label htmlFor="clip-url" className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
                URL de la nota <span style={{ color: "var(--color-gris-bordo)", fontWeight: 400 }}>(opcional)</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="clip-url"
                  type="url"
                  placeholder="https://www.losandes.com.ar/…"
                  value={form.url}
                  onChange={(e) => setField("url", e.target.value)}
                  className="admin-input flex-1"
                />
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 font-sans text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-60"
                  style={{
                    borderColor: "var(--color-dorado)",
                    color: "var(--color-bordo)",
                    backgroundColor: "rgba(201,168,130,0.12)",
                  }}
                >
                  <Sparkles size={14} />
                  {extracting ? "Leyendo…" : "Auto-completar"}
                </button>
              </div>
              {errors.url && (
                <p className="font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
                  {errors.url}
                </p>
              )}
              {extractMsg && (
                <p className="font-sans text-xs" style={{ color: "var(--color-gris-bordo)" }}>
                  {extractMsg}
                </p>
              )}
            </div>

            {/* Audio */}
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
                Audio <span style={{ color: "var(--color-gris-bordo)", fontWeight: 400 }}>(opcional)</span>
              </label>
              <AudioField
                clientSlug={clientSlug}
                clippingId={modal.mode === "edit" ? modal.id : null}
                audioUrl={form.audio_url}
                durationSeconds={form.audio_duration_seconds}
                onChange={(next) =>
                  setForm((prev) => ({
                    ...prev,
                    audio_url: next.audio_url,
                    audio_duration_seconds: next.audio_duration_seconds,
                  }))
                }
              />
            </div>

            {errors._content && (
              <p className="mt-2 font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
                {errors._content}
              </p>
            )}

            {/* Medio */}
            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="clip-medium" className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
                Medio
              </label>
              <input
                id="clip-medium"
                type="text"
                list="mediums-list"
                placeholder="Los Andes, MDZ Online, Canal 9…"
                value={form.medium}
                onChange={(e) => setField("medium", e.target.value)}
                className="admin-input"
              />
              <datalist id="mediums-list">
                {mediums.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              {errors.medium && (
                <p className="font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
                  {errors.medium}
                </p>
              )}
            </div>

            {/* Título */}
            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="clip-title" className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
                Título de la nota
              </label>
              <input
                id="clip-title"
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="admin-input"
              />
              {errors.title && (
                <p className="font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Fecha + Alcance + Formato */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="clip-date" className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
                  Fecha
                </label>
                <input
                  id="clip-date"
                  type="date"
                  value={form.published_at}
                  onChange={(e) => setField("published_at", e.target.value)}
                  className="admin-input"
                />
                {errors.published_at && (
                  <p className="font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
                    {errors.published_at}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="clip-scope" className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
                  Alcance
                </label>
                <select
                  id="clip-scope"
                  value={form.scope}
                  onChange={(e) => setField("scope", e.target.value as ClippingScope)}
                  className="admin-input"
                >
                  <option value="" disabled>
                    Elegir…
                  </option>
                  {SCOPES.map((s) => (
                    <option key={s} value={s}>
                      {SCOPE_LABELS[s]}
                    </option>
                  ))}
                </select>
                {errors.scope && (
                  <p className="font-sans text-xs" style={{ color: "var(--color-bordo)" }}>
                    {errors.scope}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="clip-format" className="font-sans text-sm font-medium" style={{ color: "var(--color-negro-bordo)" }}>
                  Formato
                </label>
                <select
                  id="clip-format"
                  value={form.format}
                  onChange={(e) => setField("format", e.target.value as ClippingFormat)}
                  className="admin-input"
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {warning && (
              <p
                className="mt-3 rounded-lg px-3 py-2 font-sans text-xs"
                style={{ backgroundColor: "rgba(201,168,130,0.15)", color: "var(--color-negro-bordo)" }}
              >
                {warning}
              </p>
            )}

            {errors._global && (
              <p className="mt-3 font-sans text-sm" style={{ color: "var(--color-bordo)" }}>
                {errors._global}
              </p>
            )}

            {/* Botones */}
            <div className="mt-6 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg px-4 py-2.5 font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.06)] disabled:opacity-60"
                style={{ color: "var(--color-gris-bordo)" }}
              >
                Cancelar
              </button>
              {modal.mode === "create" && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="rounded-lg border px-4 py-2.5 font-sans text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-60"
                  style={{ borderColor: "var(--color-bordo)", color: "var(--color-bordo)" }}
                >
                  {saving ? "Guardando…" : "Guardar y agregar otro"}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 font-sans text-sm shadow-lg"
          style={{ backgroundColor: "var(--color-negro-bordo)", color: "var(--color-hueso)" }}
        >
          {toast}
        </div>
      )}
    </>
  )
}
