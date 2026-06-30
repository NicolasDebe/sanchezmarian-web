"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SCALE_PRESETS, type DesignSettings, type ScalePresetKey } from "@/lib/design"
import {
  getDesignHistory,
  resetDesignToDefault,
  saveDesignSettings,
  type DesignHistoryRow,
} from "@/app/admin/actions"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

type Viewport = "mobile" | "desktop"
type Status = "idle" | "saving" | "saved" | "error"
type Pending = { kind: "reset" } | { kind: "revert"; row: DesignHistoryRow }

const BORDO = "var(--color-bordo)"
const HUESO = "var(--color-hueso)"
const GRIS = "var(--color-gris-bordo)"
const DORADO = "var(--color-dorado)"
const VERDE = "#2E7D32"

const PRESET_LABEL: Record<string, string> = Object.fromEntries(
  SCALE_PRESETS.map((p) => [p.key, p.label]),
)
const labelOf = (key: string) => PRESET_LABEL[key] ?? key

const dtFecha = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })
const dtHora = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })
function fmtFecha(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "—" : dtFecha.format(d)
}
function fmtHora(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "" : dtHora.format(d)
}

/**
 * Panel de escala tipográfica. Marian elige el preset mobile y desktop, los ve
 * en vivo en un iframe del sitio público (vía ?preview=design + postMessage) y
 * guarda. Incluye restablecer a Equilibrado e historial de cambios con "volver".
 * El iframe se monta UNA sola vez; los cambios de preset viajan por postMessage
 * para evitar el flash de recarga.
 */
export function TipografiaPanel({ initial }: { initial: DesignSettings }) {
  const [viewport, setViewport] = useState<Viewport>("mobile")
  const [mobilePreset, setMobilePreset] = useState<ScalePresetKey>(initial.text_scale_mobile)
  const [desktopPreset, setDesktopPreset] = useState<ScalePresetKey>(initial.text_scale_desktop)
  const [saved, setSaved] = useState<{ mobile: ScalePresetKey; desktop: ScalePresetKey }>({
    mobile: initial.text_scale_mobile,
    desktop: initial.text_scale_desktop,
  })
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [history, setHistory] = useState<DesignHistoryRow[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  // src estable: se calcula una vez con los presets guardados y no cambia más.
  const [iframeSrc] = useState(
    () => `/?preview=design&sm=${initial.text_scale_mobile}&sd=${initial.text_scale_desktop}`,
  )

  const activePreset = viewport === "mobile" ? mobilePreset : desktopPreset
  const hasChanges = mobilePreset !== saved.mobile || desktopPreset !== saved.desktop

  // Empuja la escala al iframe cada vez que cambia un preset (sin recargar).
  const pushScale = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "updateScale", mobile: mobilePreset, desktop: desktopPreset },
      "*",
    )
  }, [mobilePreset, desktopPreset])

  useEffect(() => {
    pushScale()
  }, [pushScale])

  const refreshHistory = useCallback(async () => {
    const rows = await getDesignHistory(20)
    setHistory(rows)
  }, [])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const selectPreset = (key: ScalePresetKey) => {
    if (viewport === "mobile") setMobilePreset(key)
    else setDesktopPreset(key)
    if (status === "saved") setStatus("idle")
  }

  const cancel = () => {
    setMobilePreset(saved.mobile)
    setDesktopPreset(saved.desktop)
    setStatus("idle")
    setErrorMsg(null)
  }

  // Refleja en el estado local una combinación que ya se persistió en DB.
  const applyPersisted = (mobile: ScalePresetKey, desktop: ScalePresetKey) => {
    setMobilePreset(mobile)
    setDesktopPreset(desktop)
    setSaved({ mobile, desktop })
    setStatus("saved")
    setErrorMsg(null)
  }

  const save = async () => {
    setStatus("saving")
    setErrorMsg(null)
    const res = await saveDesignSettings(mobilePreset, desktopPreset)
    if ("ok" in res) {
      setSaved({ mobile: mobilePreset, desktop: desktopPreset })
      setStatus("saved")
      refreshHistory()
    } else {
      setErrorMsg(res.error)
      setStatus("error")
    }
  }

  const confirmPending = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === "reset") {
        const res = await resetDesignToDefault()
        if ("ok" in res) {
          applyPersisted("equilibrado", "equilibrado")
          await refreshHistory()
        } else {
          setErrorMsg(res.error)
          setStatus("error")
        }
      } else {
        const m = pending.row.text_scale_mobile as ScalePresetKey
        const d = pending.row.text_scale_desktop as ScalePresetKey
        const res = await saveDesignSettings(m, d)
        if ("ok" in res) {
          applyPersisted(m, d)
          await refreshHistory()
        } else {
          setErrorMsg(res.error)
          setStatus("error")
        }
      }
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  const dialogTitle =
    pending?.kind === "reset"
      ? "¿Restablecer la tipografía a Equilibrado?"
      : pending
        ? `¿Volver a la combinación ${labelOf(pending.row.text_scale_mobile)} / ${labelOf(pending.row.text_scale_desktop)} guardada el ${fmtFecha(pending.row.changed_at)}?`
        : ""
  const dialogBody =
    pending?.kind === "reset"
      ? "Mobile y desktop volverán al tamaño original del sitio. La configuración actual queda guardada en el historial por si querés volver."
      : undefined
  const dialogConfirmLabel = pending?.kind === "reset" ? "Sí, restablecer" : "Sí, volver"

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-playfair text-3xl font-bold" style={{ color: "var(--color-negro-bordo)" }}>
            Tipografía del sitio
          </h1>
          <button
            type="button"
            onClick={() => setPending({ kind: "reset" })}
            className="mt-1 font-mono uppercase underline-offset-4 transition-opacity duration-200 hover:underline"
            style={{ fontSize: 11, letterSpacing: "0.08em", color: BORDO }}
          >
            Restablecer a Equilibrado
          </button>
        </div>
        <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed" style={{ color: GRIS }}>
          Elegí el tamaño general de los textos para mobile y desktop. Los cambios no afectan las
          fuentes — solo el tamaño. Probá los presets en vivo antes de guardar.
        </p>
      </header>

      {/* Tabs de viewport */}
      <div className="mb-5 flex gap-2">
        {(
          [
            { key: "mobile", label: "📱 Mobile (375px)" },
            { key: "desktop", label: "💻 Desktop (1440px)" },
          ] as const
        ).map((t) => {
          const active = viewport === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setViewport(t.key)}
              className="rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors duration-200"
              style={{
                backgroundColor: active ? BORDO : "transparent",
                color: active ? HUESO : GRIS,
                border: active ? "1px solid transparent" : "1px solid rgba(102,0,31,0.2)",
                letterSpacing: "0.08em",
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Iframe de preview */}
      <div className="flex justify-center px-2 sm:px-6">
        <div
          style={{
            width: viewport === "mobile" ? 375 : "100%",
            maxWidth: viewport === "mobile" ? 375 : 1280,
            transition: "width 200ms ease, max-width 200ms ease",
          }}
        >
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            onLoad={pushScale}
            title="Vista previa del sitio"
            style={{
              width: "100%",
              height: viewport === "mobile" ? 720 : 800,
              border: "1px solid rgba(102,0,31,0.15)",
              borderRadius: 12,
              backgroundColor: HUESO,
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Grid de presets 4x2 */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SCALE_PRESETS.map((p) => {
          const active = activePreset === p.key
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => selectPreset(p.key)}
              className="flex flex-col items-center rounded-xl px-3 py-3 transition-colors duration-200"
              style={{
                backgroundColor: active ? BORDO : HUESO,
                color: active ? HUESO : BORDO,
                border: active ? "1px solid transparent" : "1px solid rgba(102,0,31,0.2)",
              }}
            >
              <span className="font-sans text-sm font-semibold">{p.label}</span>
              <span
                className="mt-1 font-mono text-xs"
                style={{ opacity: 0.7, color: active ? HUESO : GRIS }}
              >
                {p.factor.toFixed(2)}×
              </span>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <footer
        className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5"
        style={{ borderColor: "rgba(201,168,130,0.4)" }}
      >
        <StatusIndicator status={status} hasChanges={hasChanges} errorMsg={errorMsg} />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={cancel}
            disabled={!hasChanges || status === "saving"}
            className="font-sans text-sm underline-offset-4 transition-opacity duration-200 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: BORDO }}
          >
            Cancelar cambios
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!hasChanges || status === "saving"}
            className="rounded-full px-6 py-2.5 font-sans text-sm font-semibold transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: BORDO, color: HUESO }}
          >
            {status === "saving" ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </footer>

      {/* Historial */}
      <section className="mt-6">
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          className="font-mono uppercase underline-offset-4 transition-opacity duration-200 hover:underline"
          style={{ fontSize: 11, letterSpacing: "0.08em", color: BORDO }}
        >
          {historyOpen ? "▴ Ocultar historial de cambios" : "▾ Ver historial de cambios"}
        </button>

        {historyOpen && (
          <div className="mt-4">
            {history.length === 0 ? (
              <p className="font-sans" style={{ fontSize: "var(--fs-caption)", color: GRIS }}>
                Sin cambios registrados todavía.
              </p>
            ) : (
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: "rgba(201,168,130,0.4)" }}
              >
                <table className="w-full" style={{ fontSize: "var(--fs-caption)" }}>
                  <thead>
                    <tr
                      className="font-mono uppercase"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        color: GRIS,
                        backgroundColor: "var(--color-hueso-oscuro)",
                      }}
                    >
                      <th className="px-4 py-3 text-left font-normal">Fecha</th>
                      <th className="px-4 py-3 text-left font-normal">Hora</th>
                      <th className="px-4 py-3 text-left font-normal">Mobile previo</th>
                      <th className="px-4 py-3 text-left font-normal">Desktop previo</th>
                      <th className="px-4 py-3 text-left font-normal">Por</th>
                      <th className="px-4 py-3 text-right font-normal" />
                    </tr>
                  </thead>
                  <tbody className="font-sans" style={{ color: "var(--color-negro-bordo)" }}>
                    {history.map((row, i) => (
                      <tr
                        key={row.id}
                        style={{
                          borderTop: i === 0 ? "none" : "1px solid rgba(201,168,130,0.3)",
                        }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">{fmtFecha(row.changed_at)}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono" style={{ color: GRIS }}>
                          {fmtHora(row.changed_at)}
                        </td>
                        <td className="px-4 py-3">{labelOf(row.text_scale_mobile)}</td>
                        <td className="px-4 py-3">{labelOf(row.text_scale_desktop)}</td>
                        <td className="px-4 py-3 truncate" style={{ color: GRIS, maxWidth: 180 }}>
                          {row.changed_by ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setPending({ kind: "revert", row })}
                            className="font-mono uppercase underline-offset-4 transition-opacity duration-200 hover:underline"
                            style={{ fontSize: 10, letterSpacing: "0.08em", color: BORDO }}
                          >
                            Volver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={dialogTitle}
        body={dialogBody}
        confirmLabel={dialogConfirmLabel}
        tone="danger"
        busy={busy}
        busyLabel="Aplicando…"
        onConfirm={confirmPending}
        onCancel={() => {
          if (!busy) setPending(null)
        }}
      />
    </div>
  )
}

function StatusIndicator({
  status,
  hasChanges,
  errorMsg,
}: {
  status: Status
  hasChanges: boolean
  errorMsg: string | null
}) {
  let label: string
  let color: string
  if (status === "error") {
    label = `Error: ${errorMsg ?? "no se pudo guardar"}`
    color = BORDO
  } else if (status === "saved" && !hasChanges) {
    label = "Guardado ✓"
    color = VERDE
  } else if (hasChanges) {
    label = "Hay cambios sin guardar"
    color = DORADO
  } else {
    label = "Sin cambios"
    color = GRIS
  }
  return (
    <span className="font-mono text-xs uppercase" style={{ letterSpacing: "0.08em", color }}>
      {label}
    </span>
  )
}
