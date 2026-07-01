"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { AlertCircle, ArrowDown, ArrowUp, Check, Plus, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import {
  createConnection,
  deleteConnection,
  reorderConnections,
  toggleConnectionActive,
} from "@/app/admin/(panel)/conexiones/actions"

export interface ConnectionRow {
  id: string
  label: string
  is_active: boolean
  position: number
}

type ToastState = { kind: "success" | "error"; message: string } | null

const GOLD = "rgba(201,168,130,0.35)"

export default function ConnectionsManager({
  connections,
}: {
  connections: ConnectionRow[]
}) {
  const router = useRouter()
  const [items, setItems] = useState<ConnectionRow[]>(connections)
  const [label, setLabel] = useState("")
  const [toast, setToast] = useState<ToastState>(null)
  const [busy, setBusy] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<ConnectionRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [, startTransition] = useTransition()

  // Resync cuando el server devuelve datos nuevos (tras router.refresh()).
  const sigRef = useRef("")
  useEffect(() => {
    const sig = connections.map((c) => `${c.id}:${c.is_active}:${c.position}`).join("|")
    if (sig !== sigRef.current) {
      sigRef.current = sig
      setItems(connections)
    }
  }, [connections])

  useEffect(() => {
    if (!toast) return
    const ms = toast.kind === "error" ? 4000 : 2000
    const t = setTimeout(() => setToast(null), ms)
    return () => clearTimeout(t)
  }, [toast])

  async function handleAdd() {
    const clean = label.trim()
    if (!clean || busy) return
    setBusy(true)
    try {
      const res = await createConnection(clean)
      if (res.success) {
        setLabel("")
        setToast({ kind: "success", message: "Conexión agregada" })
        router.refresh()
      } else {
        setToast({ kind: "error", message: res.error })
      }
    } catch {
      setToast({ kind: "error", message: "Error de conexión" })
    } finally {
      setBusy(false)
    }
  }

  function handleToggle(row: ConnectionRow) {
    const previous = items
    const next = items.map((c) =>
      c.id === row.id ? { ...c, is_active: !c.is_active } : c,
    )
    setItems(next)
    startTransition(async () => {
      try {
        const res = await toggleConnectionActive(row.id, !row.is_active)
        if (!res.success) {
          setItems(previous)
          setToast({ kind: "error", message: res.error })
        }
      } catch {
        setItems(previous)
        setToast({ kind: "error", message: "Error de conexión" })
      }
    })
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const previous = items
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
    startTransition(async () => {
      try {
        const res = await reorderConnections(next.map((c) => c.id))
        if (res.success) {
          setToast({ kind: "success", message: "Orden actualizado" })
        } else {
          setItems(previous)
          setToast({ kind: "error", message: res.error })
        }
      } catch {
        setItems(previous)
        setToast({ kind: "error", message: "Error de conexión" })
      }
    })
  }

  async function handleDelete() {
    if (!confirmTarget) return
    const row = confirmTarget
    setDeleting(true)
    try {
      const res = await deleteConnection(row.id)
      if (res.success) {
        setItems((prev) => prev.filter((c) => c.id !== row.id))
        setToast({ kind: "success", message: "Conexión eliminada" })
      } else {
        setToast({ kind: "error", message: res.error })
      }
    } catch {
      setToast({ kind: "error", message: "Error de conexión" })
    } finally {
      setDeleting(false)
      setConfirmTarget(null)
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 640 }}>
      {/* Alta */}
      <div className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
          maxLength={60}
          placeholder="Nueva conexión (ej: Fotografía)"
          className="flex-1 rounded-lg border bg-white px-4 py-2.5 font-sans text-sm outline-none focus:border-[var(--color-bordo)]"
          style={{ borderColor: GOLD, color: "var(--color-negro-bordo)" }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy || !label.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 font-sans text-sm font-semibold text-hueso transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-bordo)" }}
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {/* Lista */}
      <ul className="mt-8" style={{ borderTop: `1px solid ${GOLD}` }}>
        {items.length === 0 && (
          <li
            className="py-8 text-center font-sans text-sm"
            style={{ color: "var(--color-gris-bordo)" }}
          >
            Todavía no hay conexiones. Agregá la primera arriba.
          </li>
        )}
        {items.map((c, i) => (
          <li
            key={c.id}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: `1px solid ${GOLD}`, opacity: c.is_active ? 1 : 0.5 }}
          >
            {/* Reordenar */}
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="Subir"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-[rgba(102,0,31,0.5)] transition-colors hover:text-[var(--color-bordo)] disabled:opacity-25"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                aria-label="Bajar"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="text-[rgba(102,0,31,0.5)] transition-colors hover:text-[var(--color-bordo)] disabled:opacity-25"
              >
                <ArrowDown size={15} />
              </button>
            </div>

            {/* Label */}
            <span
              className="min-w-0 flex-1 font-sans"
              style={{ fontSize: 15, fontWeight: 500, color: "var(--color-negro-bordo)" }}
            >
              {c.label}
            </span>

            {/* Toggle activo */}
            <button
              type="button"
              onClick={() => handleToggle(c)}
              className="rounded-full px-3 py-1 font-mono uppercase transition-colors"
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                backgroundColor: c.is_active ? "rgba(102,0,31,0.08)" : "rgba(74,48,64,0.08)",
                color: c.is_active ? "var(--color-bordo)" : "var(--color-gris-bordo)",
              }}
            >
              {c.is_active ? "Activa" : "Oculta"}
            </button>

            {/* Eliminar */}
            <button
              type="button"
              aria-label={`Eliminar ${c.label}`}
              onClick={() => setConfirmTarget(c)}
              className="text-[rgba(102,0,31,0.45)] transition-colors hover:text-[var(--color-bordo)]"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={confirmTarget ? `¿Eliminar «${confirmTarget.label}»?` : ""}
        body="Se quita de la lista y del sitio. Esta acción no se puede deshacer."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => (deleting ? null : setConfirmTarget(null))}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, x: "-50%", y: 40 }}
            animate={{ opacity: 1, x: "-50%", y: 0 }}
            exit={{ opacity: 0, x: "-50%", y: 40 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed z-50 flex items-center gap-2 font-sans"
            style={{
              left: "50%",
              bottom: 24,
              padding: "14px 24px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-hueso)",
              backgroundColor:
                toast.kind === "success" ? "var(--color-negro-bordo)" : "var(--color-bordo)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {toast.kind === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
