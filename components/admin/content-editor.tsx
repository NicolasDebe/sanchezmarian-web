"use client"

import { useState } from "react"
import { saveContentSection } from "@/app/admin/actions"
import type { FieldType } from "@/lib/content-schema"

const MAX = { text: 250, longtext: 2000, number: 20 } as const

export interface EditorField {
  field: string
  type: FieldType
  label: string
  value: string
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
          Object.fromEntries(s.fields.map((f) => [f.field, f.value])),
        ]),
      ),
  )
  const [status, setStatus] = useState<Record<string, Status>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})

  function setField(section: string, field: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  function maxFor(type: FieldType) {
    return MAX[type]
  }

  async function handleSave(sec: EditorSection) {
    for (const f of sec.fields) {
      const v = values[sec.section][f.field] ?? ""
      if (v.length > maxFor(f.type)) {
        setStatus((s) => ({ ...s, [sec.section]: "error" }))
        setMessages((m) => ({
          ...m,
          [sec.section]: `El campo "${f.label}" supera el máximo de ${maxFor(f.type)} caracteres.`,
        }))
        return
      }
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

    if ("success" in result) {
      setStatus((s) => ({ ...s, [sec.section]: "success" }))
      setMessages((m) => ({
        ...m,
        [sec.section]: "Los cambios se verán en el sitio en ~1 minuto.",
      }))
      setTimeout(() => {
        setStatus((s) => ({ ...s, [sec.section]: "idle" }))
      }, 3000)
    } else {
      setStatus((s) => ({ ...s, [sec.section]: "error" }))
      setMessages((m) => ({ ...m, [sec.section]: result.error }))
    }
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
            <button
              type="button"
              onClick={() => setOpen(isOpen ? "" : sec.section)}
              className="flex w-full items-center justify-between py-5 text-left"
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
                    const max = maxFor(f.type)
                    const over = v.length > max
                    return (
                      <div key={f.field} className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`${sec.section}-${f.field}`}
                          className="font-sans text-sm font-medium"
                          style={{ color: "var(--color-negro-bordo)" }}
                        >
                          {f.label}
                        </label>
                        {f.type === "longtext" ? (
                          <textarea
                            id={`${sec.section}-${f.field}`}
                            rows={5}
                            value={v}
                            onChange={(e) => setField(sec.section, f.field, e.target.value)}
                            className="admin-textarea"
                          />
                        ) : (
                          <input
                            id={`${sec.section}-${f.field}`}
                            type="text"
                            value={v}
                            onChange={(e) => setField(sec.section, f.field, e.target.value)}
                            className="admin-input"
                          />
                        )}
                        <span
                          className="self-end font-mono"
                          style={{
                            fontSize: 10,
                            color: over ? "var(--color-bordo)" : "rgba(74,48,64,0.5)",
                          }}
                        >
                          {v.length}/{max}
                        </span>
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

                <button
                  type="button"
                  onClick={() => handleSave(sec)}
                  disabled={st === "loading"}
                  className="mt-4 rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{
                    backgroundColor:
                      st === "success" ? "var(--color-dorado)" : "var(--color-bordo)",
                    color: st === "success" ? "var(--color-negro-bordo)" : "var(--color-hueso)",
                  }}
                >
                  {st === "loading"
                    ? "Guardando…"
                    : st === "success"
                      ? "✓ Guardado"
                      : "Guardar cambios"}
                </button>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
