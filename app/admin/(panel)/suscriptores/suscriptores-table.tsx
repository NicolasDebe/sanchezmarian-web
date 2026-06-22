"use client"

import toast from "react-hot-toast"
import { Download, Mail } from "lucide-react"

export type Lead = {
  id: string
  nombre: string
  email: string
  created_at: string
}

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

/** Formato "26 Jun 2026 · 14:23". */
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = MESES[d.getMonth()]
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd} ${mm} ${d.getFullYear()} · ${hh}:${min}`
}

export function SuscriptoresTable({
  leads,
  loadError,
}: {
  leads: Lead[]
  loadError: boolean
}) {
  const count = leads.length

  function exportCsv() {
    if (leads.length === 0) {
      toast.error("No hay suscriptores para exportar")
      return
    }
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`
    const header = "Nombre,Email,Fecha"
    const body = leads
      .map((l) =>
        [escape(l.nombre), escape(l.email), escape(formatDate(l.created_at))].join(","),
      )
      .join("\n")
    // BOM (﻿) para que Excel abra bien los acentos.
    const blob = new Blob([`﻿${header}\n${body}`], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const today = new Date().toISOString().slice(0, 10)
    const a = document.createElement("a")
    a.href = url
    a.download = `suscriptores-marian-${today}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success(`${leads.length} suscriptor${leads.length === 1 ? "" : "es"} exportado${leads.length === 1 ? "" : "s"}`)
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header de página */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="font-playfair font-bold"
            style={{ fontSize: "clamp(32px, 4vw, 44px)", color: "var(--color-negro-bordo)" }}
          >
            Suscriptores
          </h1>
          <p className="mt-2 font-sans" style={{ fontSize: 14, color: "var(--color-gris-bordo)" }}>
            Personas que dejaron su mail para recibir novedades de Marian.
          </p>
        </div>
        <span
          className="font-mono"
          style={{
            background: "var(--color-arena)",
            color: "var(--color-bordo)",
            fontSize: 12,
            padding: "8px 16px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {count} suscriptor{count === 1 ? "" : "es"}
        </span>
      </div>

      {loadError && (
        <div
          className="mt-10 rounded-2xl border border-dashed p-6 font-sans text-sm"
          style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
        >
          No se pudieron cargar los suscriptores. Si la tabla
          <code style={{ margin: "0 4px" }}>leads</code>
          todavía no existe en Supabase, creala con
          <code style={{ marginLeft: 4 }}>npx tsx scripts/setup-leads-table.ts</code>.
        </div>
      )}

      {!loadError && count === 0 ? (
        /* Estado vacío */
        <div className="mt-10 flex flex-col items-center px-8 py-20 text-center">
          <Mail size={48} strokeWidth={1.5} style={{ color: "var(--color-dorado)", opacity: 0.4 }} />
          <p className="mt-5 font-playfair" style={{ fontSize: 24, fontWeight: 700, color: "var(--color-negro-bordo)" }}>
            Sin suscriptores todavía
          </p>
          <p className="mt-2 max-w-md font-sans" style={{ fontSize: 14, color: "var(--color-gris-bordo)", lineHeight: 1.6 }}>
            Cuando alguien complete el formulario en /campañas o /casos-de-éxito,
            vas a verlo acá.
          </p>
        </div>
      ) : (
        !loadError && (
          <>
            {/* Exportar CSV */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-2 rounded-lg border transition-colors hover:bg-[var(--color-arena)]"
                style={{
                  borderWidth: 1.5,
                  borderColor: "var(--color-bordo)",
                  color: "var(--color-bordo)",
                  background: "transparent",
                  padding: "10px 20px",
                  fontSize: 14,
                }}
              >
                <Download size={15} strokeWidth={2} />
                Exportar CSV
              </button>
            </div>

            {/* Tabla */}
            <div
              className="mt-4 overflow-x-auto overflow-hidden rounded-xl border"
              style={{ borderColor: "rgba(201,168,130,0.2)", background: "var(--color-hueso)" }}
            >
              <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr style={{ background: "var(--color-hueso-oscuro)" }}>
                    <th
                      className="font-mono uppercase"
                      style={thStyle}
                    >
                      Nombre
                    </th>
                    <th className="font-mono uppercase" style={thStyle}>
                      Email
                    </th>
                    <th className="font-mono uppercase" style={{ ...thStyle, textAlign: "right" }}>
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l, i) => (
                    <tr
                      key={l.id}
                      className="suscriptor-row"
                      style={{
                        borderBottom:
                          i === leads.length - 1
                            ? "none"
                            : "1px solid rgba(201,168,130,0.15)",
                      }}
                    >
                      <td
                        className="font-sans"
                        style={{ padding: "16px 20px", fontSize: 14, color: "var(--color-negro-bordo)" }}
                      >
                        {l.nombre}
                      </td>
                      <td
                        className="font-mono"
                        style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-gris-bordo)" }}
                      >
                        {l.email}
                      </td>
                      <td
                        className="font-mono"
                        style={{ padding: "16px 20px", fontSize: 12, color: "var(--color-gris-bordo)", textAlign: "right", whiteSpace: "nowrap" }}
                      >
                        {formatDate(l.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: 11,
  letterSpacing: "0.12em",
  color: "var(--color-bordo)",
  opacity: 0.7,
}
