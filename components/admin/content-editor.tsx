"use client"

import { useState } from "react"
import { Undo2 } from "lucide-react"
import {
  saveContentSection,
  saveTextSizes,
  getLastVersionDate,
  restoreLastVersion,
} from "@/app/admin/actions"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { hasHtmlTags, htmlToPlainText, plainToHtml } from "@/lib/rich-text"
import { TEXT_SIZE_PRESETS, sizeFactor } from "@/lib/text-size"
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
}: {
  page: string
  sections: EditorSection[]
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

    let sizeWarn = ""
    if (sizeEntries.length > 0) {
      const sizeRes = await saveTextSizes(page, sizeEntries)
      if (!("success" in sizeRes)) sizeWarn = ` (Texto guardado, pero los tamaños no: ${sizeRes.error})`
    }

    setStatus((s) => ({ ...s, [sec.section]: sizeWarn ? "error" : "success" }))
    setMessages((m) => ({
      ...m,
      [sec.section]: sizeWarn
        ? sizeWarn.trim()
        : "Los cambios se verán en el sitio en ~1 minuto.",
    }))
    if (!sizeWarn) {
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

  return (
    <div className="flex flex-col">
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
                          const raw = values[sec.section][f.field] ?? ""
                          const plain = (isRich(f) ? htmlToPlainText(raw) : raw).trim()
                          const previewText = plain.slice(0, 160) || "Escribí el texto arriba para verlo acá…"
                          // Aproximación de estilo: títulos en Playfair, párrafos en DM Sans.
                          const isTitle = f.type === "text"
                          const previewFont = isTitle
                            ? "var(--font-playfair-display), serif"
                            : "var(--font-dm-sans), sans-serif"
                          const previewWeight = isTitle ? 700 : 400
                          const base = isTitle ? 22 : 15
                          const cur = sizes[sec.section]?.[f.field] ?? { m: "normal", d: "normal" }
                          const previews: [string, number][] = [
                            ["💻 Compu", sizeFactor(cur.d)],
                            ["📱 Celular", sizeFactor(cur.m)],
                          ]
                          return (
                            <div
                              className="mt-1 rounded-lg px-3 py-3"
                              style={{
                                backgroundColor: "rgba(201,168,130,0.10)",
                                border: "1px solid rgba(201,168,130,0.25)",
                              }}
                            >
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span
                                  className="font-mono uppercase"
                                  style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--color-bordo)" }}
                                >
                                  Tamaño del texto
                                </span>
                                {(["m", "d"] as const).map((dim) => (
                                  <label key={dim} className="flex items-center gap-1.5">
                                    <span style={{ fontSize: 12, color: "var(--color-gris-bordo)" }}>
                                      {dim === "m" ? "📱 Celular" : "💻 Compu"}
                                    </span>
                                    <select
                                      value={cur[dim] ?? "normal"}
                                      onChange={(e) => setSize(sec.section, f.field, dim, e.target.value)}
                                      className="admin-input"
                                      style={{ width: "auto", padding: "4px 8px", fontSize: 13 }}
                                    >
                                      {TEXT_SIZE_PRESETS.map((p) => (
                                        <option key={p.key} value={p.key}>
                                          {p.label}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ))}
                              </div>

                              {/* Vista previa en vivo: el texto crece según lo elegido. */}
                              <div className="mt-3 border-t pt-3" style={{ borderColor: "rgba(201,168,130,0.3)" }}>
                                <span
                                  className="font-mono uppercase"
                                  style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(74,48,64,0.55)" }}
                                >
                                  Vista previa — así se va a ver de grande
                                </span>
                                <div className="mt-2 flex flex-col gap-2">
                                  {previews.map(([label, factor]) => (
                                    <div key={label} className="flex items-baseline gap-2">
                                      <span
                                        className="shrink-0 font-mono"
                                        style={{ fontSize: 10, color: "var(--color-bordo)", width: 64 }}
                                      >
                                        {label}
                                      </span>
                                      <span
                                        className="line-clamp-2"
                                        style={{
                                          fontFamily: previewFont,
                                          fontWeight: previewWeight,
                                          fontSize: base * factor,
                                          lineHeight: 1.25,
                                          color: "var(--color-negro-bordo)",
                                        }}
                                      >
                                        {previewText}
                                      </span>
                                    </div>
                                  ))}
                                </div>
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
