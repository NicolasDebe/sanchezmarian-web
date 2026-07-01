"use client"

import { useEffect, useRef, useState } from "react"
import { Undo2, Eye } from "lucide-react"
import {
  saveContentSection,
  saveTextSizes,
  saveFieldFonts,
  getLastVersionDate,
  restoreLastVersion,
} from "@/app/admin/actions"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { hasHtmlTags, htmlToPlainText, plainToHtml } from "@/lib/rich-text"
import { TEXT_SIZE_KEYS, sizeIndex, sizeLabel, FIELD_FONTS } from "@/lib/text-size"
import type { FieldType, SelectOption } from "@/lib/content-schema"

const MAX = { text: 250, longtext: 2000, number: 20 } as const

export interface EditorField {
  field: string
  type: FieldType
  label: string
  value: string
  /** longtext que NO admite HTML (SEO, H1, pre/accent) → textarea plano */
  plain?: boolean
  /** Si está presente, el campo se edita con un <select> (elección cerrada). */
  options?: SelectOption[]
  /** Límite duro de caracteres (texto visible si es rich). */
  maxChars?: number
  /** Ayuda mostrada bajo el label. */
  help?: string
  /** Si true, muestra selector de tamaño (mobile/desktop). */
  resizable?: boolean
  /** Tamaño actual mobile/desktop (clave de preset; "normal" por defecto). */
  scaleMobile?: string
  scaleDesktop?: string
  /** Fuente actual (clave de FIELD_FONTS; "default" = original). */
  font?: string
}

/** ¿Este campo usa el editor enriquecido? */
function isRich(f: { type: FieldType; plain?: boolean }): boolean {
  return f.type === "longtext" && !f.plain
}
export interface EditorSection {
  section: string
  title: string
  legend?: string
  fields: EditorField[]
}

type Status = "idle" | "loading" | "success" | "error"

/**
 * Editor genérico de contenido por secciones (acordeón). Reutilizado por todas
 * las rutas /admin/edit/*. Recibe la `page` (slug en content_blocks) y la lista
 * de secciones ya resuelta con los valores actuales.
 */
export function ContentEditor({
  page,
  sections,
  previewPath,
}: {
  page: string
  sections: EditorSection[]
  /** Ruta pública de la página (p.ej. "/"), para el iframe de vista previa. */
  previewPath?: string
}) {
  const [open, setOpen] = useState<string>(sections[0]?.section ?? "")
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    () =>
      Object.fromEntries(
        sections.map((s) => [
          s.section,
          Object.fromEntries(
            s.fields.map((f) => [
              f.field,
              // Los campos rich con valor plano legacy entran al editor ya
              // convertidos a HTML (párrafos), así Tiptap los muestra bien.
              isRich(f) && f.value && !hasHtmlTags(f.value)
                ? plainToHtml(f.value)
                : f.value,
            ]),
          ),
        ]),
      ),
  )
  // Tamaños por campo: sizes[section][field] = { m, d } (claves de preset).
  const [sizes, setSizes] = useState<Record<string, Record<string, { m: string; d: string }>>>(
    () =>
      Object.fromEntries(
        sections.map((s) => [
          s.section,
          Object.fromEntries(
            s.fields
              .filter((f) => f.resizable)
              .map((f) => [
                f.field,
                { m: f.scaleMobile ?? "normal", d: f.scaleDesktop ?? "normal" },
              ]),
          ),
        ]),
      ),
  )
  // Fuentes por campo: fonts[section][field] = clave de FIELD_FONTS.
  const [fonts, setFonts] = useState<Record<string, Record<string, string>>>(
    () =>
      Object.fromEntries(
        sections.map((s) => [
          s.section,
          Object.fromEntries(
            s.fields
              .filter((f) => f.resizable)
              .map((f) => [f.field, f.font ?? "default"]),
          ),
        ]),
      ),
  )
  const [status, setStatus] = useState<Record<string, Status>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  // Undo: sección con el modal abierto, fecha del backup y estado de carga.
  const [undoFor, setUndoFor] = useState<string | null>(null)
  const [undoDate, setUndoDate] = useState<string>("")
  const [undoBusy, setUndoBusy] = useState(false)

  function setField(section: string, field: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  function setSize(section: string, field: string, dim: "m" | "d", key: string) {
    setSizes((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { ...prev[section]?.[field], [dim]: key },
      },
    }))
  }

  function setFont(section: string, field: string, key: string) {
    setFonts((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: key },
    }))
  }

  // ── Vista previa en vivo (iframe del sitio real, ?preview=text-sizes) ──
  const hasResizable = sections.some((s) => s.fields.some((f) => f.resizable))
  const showPreview = Boolean(previewPath) && hasResizable
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [viewport, setViewport] = useState<"mobile" | "desktop">("desktop")
  // src estable: se calcula una vez y no cambia (los tamaños viajan por postMessage).
  const [iframeSrc] = useState(
    () => `${previewPath ?? "/"}?preview=text-sizes`,
  )
  // Ancho disponible para el iframe (se escala para que entre en la columna).
  const previewWrapRef = useRef<HTMLDivElement | null>(null)
  const [wrapW, setWrapW] = useState(440)
  useEffect(() => {
    const el = previewWrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWrapW(el.clientWidth))
    ro.observe(el)
    setWrapW(el.clientWidth)
    return () => ro.disconnect()
  }, [showPreview])

  // El iframe se sincroniza de forma declarativa: cualquier cambio de `sizes`
  // (o una recarga del iframe) dispara un efecto que reenvía TODOS los tamaños.
  // Así el ref del iframe solo se toca dentro de effects (lo exige el linter).
  const [loadTick, setLoadTick] = useState(0)
  const [scrollReq, setScrollReq] = useState<{ fkey: string; n: number } | null>(null)

  useEffect(() => {
    if (!showPreview) return
    const w = iframeRef.current?.contentWindow
    if (!w) return
    for (const sec of sections) {
      for (const f of sec.fields) {
        if (!f.resizable) continue
        const cur = sizes[sec.section]?.[f.field]
        if (!cur) continue
        w.postMessage(
          {
            type: "fieldSize",
            fkey: `${sec.section}.${f.field}`,
            m: cur.m,
            d: cur.d,
            font: fonts[sec.section]?.[f.field] ?? "default",
          },
          "*",
        )
      }
    }
  }, [showPreview, sections, sizes, fonts, loadTick])

  useEffect(() => {
    if (!scrollReq) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: "scrollToField", fkey: scrollReq.fkey },
      "*",
    )
  }, [scrollReq])

  // El límite del campo prioriza f.maxChars; si no hay, cae al MAX por tipo.
  function maxFor(f: EditorField) {
    return f.maxChars ?? MAX[f.type]
  }

  /** Longitud visible del valor actual del campo (texto plano en rich). */
  function lenOf(sec: EditorSection, f: EditorField) {
    const raw = values[sec.section][f.field] ?? ""
    return isRich(f) ? htmlToPlainText(raw).length : raw.length
  }

  /** Campos de la sección que superan su límite. */
  function overFields(sec: EditorSection) {
    return sec.fields.filter((f) => lenOf(sec, f) > maxFor(f))
  }

  async function handleSave(sec: EditorSection) {
    const over = overFields(sec)
    if (over.length > 0) {
      setStatus((s) => ({ ...s, [sec.section]: "error" }))
      setMessages((m) => ({
        ...m,
        [sec.section]: `Pasaste el límite en ${over.length} campo(s). Acortá el texto y volvé a guardar.`,
      }))
      return
    }

    const empties = sec.fields.filter(
      (f) => (values[sec.section][f.field] ?? "").trim() === "",
    )
    if (empties.length > 0) {
      const ok = window.confirm(
        `Hay ${empties.length} campo(s) vacío(s) en "${sec.title}". ¿Querés guardar igual?`,
      )
      if (!ok) return
    }

    setStatus((s) => ({ ...s, [sec.section]: "loading" }))
    setMessages((m) => ({ ...m, [sec.section]: "" }))

    const payload: Record<string, { value: string; type: string }> = {}
    for (const f of sec.fields) {
      payload[f.field] = { value: values[sec.section][f.field] ?? "", type: f.type }
    }

    const result = await saveContentSection(page, sec.section, payload)

    if (!("success" in result)) {
      setStatus((s) => ({ ...s, [sec.section]: "error" }))
      setMessages((m) => ({ ...m, [sec.section]: result.error }))
      return
    }

    // Guardado de tamaños (campos resizable). Aislado: si falla (p.ej. falta la
    // migración text_sizes), el texto YA quedó guardado; solo avisamos.
    const sizeEntries = sec.fields
      .filter((f) => f.resizable)
      .map((f) => ({
        section: sec.section,
        field: f.field,
        scale_mobile: sizes[sec.section]?.[f.field]?.m ?? "normal",
        scale_desktop: sizes[sec.section]?.[f.field]?.d ?? "normal",
      }))

    let styleWarn = ""
    if (sizeEntries.length > 0) {
      const sizeRes = await saveTextSizes(page, sizeEntries)
      if (!("success" in sizeRes)) styleWarn = ` (Texto guardado, pero los tamaños no: ${sizeRes.error})`
    }

    // Guardado de fuentes (mismos campos resizable). También aislado.
    const fontEntries = sec.fields
      .filter((f) => f.resizable)
      .map((f) => ({
        section: sec.section,
        field: f.field,
        font: fonts[sec.section]?.[f.field] ?? "default",
      }))

    if (fontEntries.length > 0) {
      const fontRes = await saveFieldFonts(page, fontEntries)
      if (!("success" in fontRes)) {
        styleWarn = styleWarn
          ? styleWarn
          : ` (Texto guardado, pero las fuentes no: ${fontRes.error})`
      }
    }

    setStatus((s) => ({ ...s, [sec.section]: styleWarn ? "error" : "success" }))
    setMessages((m) => ({
      ...m,
      [sec.section]: styleWarn
        ? styleWarn.trim()
        : "Los cambios se verán en el sitio en ~1 minuto.",
    }))
    if (!styleWarn) {
      setTimeout(() => setStatus((s) => ({ ...s, [sec.section]: "idle" })), 3000)
    }
  }

  // ── Deshacer último cambio ──
  async function openUndo(sec: EditorSection) {
    setMessages((m) => ({ ...m, [sec.section]: "" }))
    const info = await getLastVersionDate(page, sec.section)
    if (!info.exists) {
      setStatus((s) => ({ ...s, [sec.section]: "error" }))
      setMessages((m) => ({
        ...m,
        [sec.section]: "No hay un cambio anterior para deshacer en esta sección.",
      }))
      return
    }
    setUndoDate(info.date)
    setUndoFor(sec.section)
  }

  async function confirmUndo() {
    if (!undoFor) return
    const sec = sections.find((s) => s.section === undoFor)
    if (!sec) return
    setUndoBusy(true)
    const result = await restoreLastVersion(page, undoFor)
    setUndoBusy(false)
    setUndoFor(null)
    if ("error" in result) {
      setStatus((s) => ({ ...s, [sec.section]: "error" }))
      setMessages((m) => ({ ...m, [sec.section]: result.error }))
      return
    }
    // Refrescar los campos del editor con lo restaurado (rich → HTML).
    setValues((prev) => {
      const next = { ...prev[sec.section] }
      for (const f of sec.fields) {
        if (f.field in result.values) {
          const raw = result.values[f.field]
          next[f.field] =
            isRich(f) && raw && !hasHtmlTags(raw) ? plainToHtml(raw) : raw
        }
      }
      return { ...prev, [sec.section]: next }
    })
    setStatus((s) => ({ ...s, [sec.section]: "success" }))
    setMessages((m) => ({
      ...m,
      [sec.section]: "Listo: volvimos al estado anterior. Se verá en el sitio en ~1 minuto.",
    }))
    setTimeout(() => setStatus((s) => ({ ...s, [sec.section]: "idle" })), 4000)
  }

  const previewBase = viewport === "mobile" ? { w: 390, h: 720 } : { w: 1280, h: 820 }
  const previewScale = Math.min(1, wrapW / previewBase.w)

  return (
    <div
      className={
        showPreview
          ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-start"
          : ""
      }
    >
      <div className="flex min-w-0 flex-col">
      {sections.map((sec) => {
        const isOpen = open === sec.section
        const st = status[sec.section] ?? "idle"
        return (
          <section
            key={sec.section}
            className="border-b"
            style={{ borderColor: "rgba(201,168,130,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? "" : sec.section)}
                className="flex flex-1 items-center justify-between py-5 text-left"
              >
                <span
                  className="font-playfair text-xl font-bold"
                  style={{ color: "var(--color-negro-bordo)" }}
                >
                  {sec.title}
                </span>
                <span
                  className="font-mono transition-transform"
                  style={{
                    fontSize: 13,
                    color: "var(--color-dorado)",
                    transform: isOpen ? "rotate(90deg)" : "none",
                  }}
                >
                  ▶
                </span>
              </button>
              {isOpen && (
                <button
                  type="button"
                  onClick={() => openUndo(sec)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-sans transition-colors hover:bg-[rgba(102,0,31,0.06)]"
                  style={{
                    fontSize: 12,
                    borderColor: "rgba(201,168,130,0.5)",
                    color: "var(--color-bordo)",
                  }}
                >
                  <Undo2 size={13} />
                  Deshacer último cambio
                </button>
              )}
            </div>

            {isOpen && (
              <div className="pb-8">
                {sec.legend && (
                  <p
                    className="mb-5 rounded-lg px-4 py-3 font-sans"
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "var(--color-gris-bordo)",
                      backgroundColor: "rgba(201,168,130,0.12)",
                      border: "1px solid rgba(201,168,130,0.25)",
                    }}
                  >
                    {sec.legend}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-5">
                  {sec.fields.map((f) => {
                    const v = values[sec.section][f.field] ?? ""
                    const max = maxFor(f)
                    // En rich el contador mide el texto visible, no los tags.
                    const len = isRich(f) ? htmlToPlainText(v).length : v.length
                    const over = len > max
                    // Resalta en bordó el control cuando se pasa del límite.
                    const overStyle = over
                      ? {
                          boxShadow: "0 0 0 1px var(--color-bordo)",
                          borderColor: "var(--color-bordo)",
                        }
                      : undefined
                    return (
                      <div key={f.field} className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`${sec.section}-${f.field}`}
                          className="font-sans text-sm font-medium"
                          style={{ color: "var(--color-negro-bordo)" }}
                        >
                          {f.label}
                        </label>
                        {f.help && (
                          <p
                            style={{
                              fontFamily: "var(--font-dm-sans), sans-serif",
                              fontSize: 12,
                              color: "rgba(74,48,64,0.7)",
                              margin: "0 0 6px",
                              lineHeight: 1.5,
                            }}
                          >
                            {f.help}
                          </p>
                        )}
                        {f.options ? (
                          <select
                            id={`${sec.section}-${f.field}`}
                            value={v}
                            onChange={(e) => setField(sec.section, f.field, e.target.value)}
                            className="admin-input"
                            style={overStyle}
                          >
                            {f.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : isRich(f) ? (
                          <div style={overStyle ? { ...overStyle, borderRadius: 10 } : undefined}>
                            <RichTextEditor
                              value={v}
                              onChange={(html) => setField(sec.section, f.field, html)}
                            />
                          </div>
                        ) : f.type === "longtext" ? (
                          <textarea
                            id={`${sec.section}-${f.field}`}
                            rows={5}
                            value={v}
                            onChange={(e) => setField(sec.section, f.field, e.target.value)}
                            className="admin-textarea"
                            style={overStyle}
                          />
                        ) : (
                          <input
                            id={`${sec.section}-${f.field}`}
                            type="text"
                            value={v}
                            onChange={(e) => setField(sec.section, f.field, e.target.value)}
                            className="admin-input"
                            style={overStyle}
                          />
                        )}
                        <span
                          className="self-end font-mono"
                          style={{
                            fontSize: 10,
                            color: over ? "var(--color-bordo)" : "rgba(74,48,64,0.5)",
                          }}
                        >
                          {len}/{max}
                        </span>

                        {f.resizable && (() => {
                          const fkey = `${sec.section}.${f.field}`
                          const cur = sizes[sec.section]?.[f.field] ?? { m: "normal", d: "normal" }
                          const maxIdx = TEXT_SIZE_KEYS.length - 1
                          return (
                            <div
                              className="mt-1 rounded-lg px-3 py-3"
                              style={{
                                backgroundColor: "rgba(201,168,130,0.10)",
                                border: "1px solid rgba(201,168,130,0.25)",
                              }}
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <span
                                  className="font-mono uppercase"
                                  style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--color-bordo)" }}
                                >
                                  Apariencia del texto
                                </span>
                                {showPreview && (
                                  <button
                                    type="button"
                                    onClick={() => setScrollReq((r) => ({ fkey, n: (r?.n ?? 0) + 1 }))}
                                    className="flex items-center gap-1 font-mono uppercase transition-opacity hover:opacity-70"
                                    style={{ fontSize: 10, letterSpacing: "0.06em", color: "var(--color-bordo)" }}
                                  >
                                    <Eye size={12} />
                                    Ver en la vista previa
                                  </button>
                                )}
                              </div>
                              <div className="flex flex-col gap-2.5">
                                {(["d", "m"] as const).map((dim) => (
                                  <div key={dim} className="flex items-center gap-3">
                                    <span
                                      className="shrink-0"
                                      style={{ fontSize: 12, color: "var(--color-gris-bordo)", width: 70 }}
                                    >
                                      {dim === "m" ? "📱 Celular" : "💻 Compu"}
                                    </span>
                                    <input
                                      type="range"
                                      min={0}
                                      max={maxIdx}
                                      step={1}
                                      value={sizeIndex(cur[dim])}
                                      onChange={(e) =>
                                        setSize(sec.section, f.field, dim, TEXT_SIZE_KEYS[Number(e.target.value)])
                                      }
                                      className="flex-1 accent-[var(--color-bordo)]"
                                      aria-label={`Tamaño ${dim === "m" ? "celular" : "compu"} de ${f.label}`}
                                    />
                                    <span
                                      className="shrink-0 text-right font-sans"
                                      style={{ fontSize: 11, color: "var(--color-negro-bordo)", width: 82 }}
                                    >
                                      {sizeLabel(cur[dim])}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Fuente: solo entre las que ya usa el sitio. */}
                              <div
                                className="mt-3 flex items-center gap-3 border-t pt-3"
                                style={{ borderColor: "rgba(201,168,130,0.3)" }}
                              >
                                <span
                                  className="shrink-0"
                                  style={{ fontSize: 12, color: "var(--color-gris-bordo)", width: 70 }}
                                >
                                  🔤 Fuente
                                </span>
                                <select
                                  value={fonts[sec.section]?.[f.field] ?? "default"}
                                  onChange={(e) => setFont(sec.section, f.field, e.target.value)}
                                  className="admin-input flex-1"
                                  style={{ padding: "4px 8px", fontSize: 13 }}
                                  aria-label={`Fuente de ${f.label}`}
                                >
                                  {FIELD_FONTS.map((ft) => (
                                    <option key={ft.key} value={ft.key}>
                                      {ft.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}
                </div>

                {messages[sec.section] && (
                  <p
                    className="mt-4 font-sans text-sm"
                    style={{
                      color:
                        st === "error" ? "var(--color-bordo)" : "var(--color-gris-bordo)",
                    }}
                  >
                    {messages[sec.section]}
                  </p>
                )}

                {(() => {
                  const hasOver = overFields(sec).length > 0
                  return (
                    <button
                      type="button"
                      onClick={() => handleSave(sec)}
                      disabled={st === "loading" || hasOver}
                      className="mt-4 rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity disabled:opacity-60"
                      style={{
                        backgroundColor:
                          st === "success" ? "var(--color-dorado)" : "var(--color-bordo)",
                        color: st === "success" ? "var(--color-negro-bordo)" : "var(--color-hueso)",
                      }}
                    >
                      {hasOver
                        ? "Ajustá los campos en rojo"
                        : st === "loading"
                          ? "Guardando…"
                          : st === "success"
                            ? "✓ Guardado"
                            : "Guardar cambios"}
                    </button>
                  )
                })()}
              </div>
            )}
          </section>
        )
      })}
      </div>

      {showPreview && (
        <aside className="lg:sticky lg:top-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span
              className="font-mono uppercase"
              style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--color-bordo)" }}
            >
              Vista previa de tamaños
            </span>
            <div className="flex gap-1">
              {(
                [
                  { key: "mobile", label: "📱" },
                  { key: "desktop", label: "💻" },
                ] as const
              ).map((t) => {
                const active = viewport === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setViewport(t.key)}
                    className="rounded-md px-2.5 py-1 font-mono transition-colors"
                    style={{
                      fontSize: 13,
                      backgroundColor: active ? "var(--color-bordo)" : "transparent",
                      border: active ? "1px solid transparent" : "1px solid rgba(102,0,31,0.2)",
                      opacity: active ? 1 : 0.6,
                    }}
                    aria-label={t.key === "mobile" ? "Ver como celular" : "Ver como compu"}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div
            ref={previewWrapRef}
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: "rgba(102,0,31,0.15)", backgroundColor: "var(--color-hueso)" }}
          >
            <div style={{ height: previewBase.h * previewScale, position: "relative" }}>
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                onLoad={() => setLoadTick((t) => t + 1)}
                title="Vista previa del sitio"
                style={{
                  width: previewBase.w,
                  height: previewBase.h,
                  border: 0,
                  display: "block",
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  marginLeft: (wrapW - previewBase.w * previewScale) / 2,
                }}
              />
            </div>
          </div>
          <p
            className="mt-2 font-sans"
            style={{ fontSize: 11, lineHeight: 1.5, color: "rgba(74,48,64,0.7)" }}
          >
            Movés los controles y el texto cambia acá al instante. El texto que ves es el
            último guardado (los cambios de contenido se ven al guardar).
          </p>
        </aside>
      )}

      <ConfirmDialog
        open={undoFor !== null}
        title="¿Deshacer el último cambio en esta sección?"
        body={`Vas a volver al estado del ${undoDate}.`}
        confirmLabel="Sí, deshacer"
        busyLabel="Deshaciendo…"
        tone="primary"
        busy={undoBusy}
        onConfirm={confirmUndo}
        onCancel={() => setUndoFor(null)}
      />
    </div>
  )
}
