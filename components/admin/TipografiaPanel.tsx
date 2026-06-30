"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SCALE_PRESETS, type DesignSettings, type ScalePresetKey } from "@/lib/design"
import { saveDesignSettings } from "@/app/admin/actions"

type Viewport = "mobile" | "desktop"
type Status = "idle" | "saving" | "saved" | "error"

const BORDO = "var(--color-bordo)"
const HUESO = "var(--color-hueso)"
const GRIS = "var(--color-gris-bordo)"
const DORADO = "var(--color-dorado)"
const VERDE = "#2E7D32"

/**
 * Panel de escala tipográfica. Marian elige el preset mobile y desktop, los ve
 * en vivo en un iframe del sitio público (vía ?preview=design + postMessage) y
 * guarda. El iframe se monta UNA sola vez; los cambios de preset viajan por
 * postMessage para evitar el flash de recarga.
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

  const save = async () => {
    setStatus("saving")
    setErrorMsg(null)
    const res = await saveDesignSettings(mobilePreset, desktopPreset)
    if ("ok" in res) {
      setSaved({ mobile: mobilePreset, desktop: desktopPreset })
      setStatus("saved")
    } else {
      setErrorMsg(res.error)
      setStatus("error")
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-playfair text-3xl font-bold" style={{ color: "var(--color-negro-bordo)" }}>
          Tipografía del sitio
        </h1>
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
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5"
        style={{ borderColor: "rgba(201,168,130,0.4)" }}>
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
