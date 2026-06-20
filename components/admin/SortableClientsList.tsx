"use client"

/**
 * Lista vertical de clientes de /admin/clippings con drag & drop para
 * reordenar — coherente con la estética editorial de /casos-de-exito (lista
 * plana, no grid de cards). Auto-save al soltar (optimistic UI con revert +
 * toast). Cada fila navega a /admin/clippings/{slug} excepto el handle, que es
 * exclusivamente dragueable.
 *
 * Accesibilidad: KeyboardSensor — Tab para enfocar el handle, Espacio para
 * "tomar", flechas arriba/abajo para mover, Espacio/Enter para soltar.
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AlertCircle, Check, ChevronRight, GripVertical } from "lucide-react"
import { reorderClients } from "@/app/admin/(panel)/clippings/actions"

export interface SortableClient {
  id: string
  slug: string
  name: string
  logo_url: string | null
  clippings_count: number
}

type ToastState = { kind: "success" | "error"; message: string } | null

const GOLD_BORDER = "1px solid rgba(201,168,130,0.2)"
const ROW_HEIGHT = 88

export default function SortableClientsList({
  clients,
}: {
  clients: SortableClient[]
}) {
  const [items, setItems] = useState<SortableClient[]>(clients)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [, startTransition] = useTransition()

  // Resync si el server vuelve con un orden distinto (tras revalidatePath).
  const sigRef = useRef("")
  useEffect(() => {
    const sig = clients.map((c) => c.id).join("|")
    if (sig !== sigRef.current) {
      sigRef.current = sig
      setItems(clients)
    }
  }, [clients])

  // Auto-dismiss del toast: éxito 2s, error 4s.
  useEffect(() => {
    if (!toast) return
    const ms = toast.kind === "error" ? 4000 : 2000
    const t = setTimeout(() => setToast(null), ms)
    return () => clearTimeout(t)
  }, [toast])

  const sensors = useSensors(
    // delay 150 + tolerance 5: evita drag accidental al hacer click/tap.
    useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const ids = useMemo(() => items.map((c) => c.id), [items])
  const activeClient = activeId ? items.find((c) => c.id === activeId) ?? null : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((c) => c.id === active.id)
    const newIndex = items.findIndex((c) => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    // 1. Update optimista.
    const previous = items
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    setSavingId(String(active.id))

    // 2. Persistir; revertir si falla.
    startTransition(async () => {
      try {
        const res = await reorderClients(next.map((c) => c.id))
        if (res.success) {
          setToast({ kind: "success", message: "Orden actualizado" })
        } else {
          setItems(previous)
          setToast({ kind: "error", message: `No se pudo guardar: ${res.error}` })
        }
      } catch {
        setItems(previous)
        setToast({ kind: "error", message: "Error de conexión" })
      } finally {
        setSavingId(null)
      }
    })
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 960 }}>
      <DndContext
        id="clippings-clients-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul role="list" style={{ borderTop: GOLD_BORDER }}>
            {items.map((c) => (
              <SortableRow
                key={c.id}
                client={c}
                saving={savingId === c.id}
                dimmed={activeId === c.id}
              />
            ))}
          </ul>
        </SortableContext>

        {/* Clon flotante que sigue al cursor mientras se arrastra. */}
        <DragOverlay>
          {activeClient ? (
            <div
              className="flex items-center"
              style={{
                height: ROW_HEIGHT,
                paddingInline: 24,
                gap: 24,
                backgroundColor: "var(--color-hueso)",
                border: "1px solid rgba(102,0,31,0.3)",
                borderRadius: 8,
                boxShadow: "0 12px 40px rgba(102,0,31,0.15)",
                transform: "scale(1.015) rotate(1deg)",
              }}
            >
              <GripVertical size={20} style={{ color: "rgba(102,0,31,0.4)" }} className="shrink-0" />
              <RowInner client={activeClient} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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

// ─── Fila sortable ──────────────────────────────────────────────────────────

function SortableRow({
  client,
  saving,
  dimmed,
}: {
  client: SortableClient
  saving: boolean
  dimmed: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: client.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // El original queda atenuado mientras el clon flota (DragOverlay).
    opacity: dimmed || isDragging ? 0.4 : 1,
    zIndex: isDragging ? 5 : undefined,
    position: "relative",
    height: ROW_HEIGHT,
    backgroundColor: "var(--color-hueso)",
    borderBottom: GOLD_BORDER,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group flex items-center transition-colors duration-200 hover:bg-[rgba(240,232,216,0.5)]"
    >
      {/* Drag handle — exclusivamente dragueable, no navega */}
      <button
        type="button"
        aria-label="Arrastrar para reordenar"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex shrink-0 items-center justify-center rounded-md text-[rgba(102,0,31,0.4)] outline-none transition-colors hover:text-[rgba(102,0,31,1)] focus-visible:ring-2 focus-visible:ring-[var(--color-bordo)]"
        style={{
          width: 32,
          height: 32,
          marginLeft: 24,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <GripVertical size={20} />
      </button>

      {/* Resto de la fila — Link navegable */}
      <Link
        href={`/admin/clippings/${client.slug}`}
        className="flex h-full flex-1 items-center outline-none focus-visible:underline"
        style={{ gap: 24, paddingLeft: 24, paddingRight: 24 }}
      >
        <RowInner client={client} />
      </Link>

      {/* Badge "Guardando…" */}
      {saving && (
        <span
          className="pointer-events-none absolute animate-pulse font-mono"
          style={{
            top: 8,
            right: 24,
            fontSize: 10,
            letterSpacing: "0.06em",
            padding: "4px 8px",
            borderRadius: 9999,
            backgroundColor: "var(--color-arena)",
            color: "rgba(102,0,31,0.7)",
          }}
        >
          Guardando…
        </span>
      )}
    </li>
  )
}

// ─── Contenido de la fila (compartido por la fila y el DragOverlay) ──────────

function RowInner({ client }: { client: SortableClient }) {
  const zero = client.clippings_count === 0

  return (
    <>
      {/* Logo */}
      <div
        className="flex shrink-0 items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          background: "white",
          padding: 6,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {client.logo_url ? (
          <Image
            src={client.logo_url}
            alt={`Logo ${client.name}`}
            width={44}
            height={44}
            style={{ objectFit: "contain", maxHeight: "100%", width: "auto" }}
          />
        ) : (
          <span className="font-mono font-bold" style={{ color: "var(--color-bordo)", fontSize: 20 }}>
            {client.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Nombre */}
      <span
        className="line-clamp-1 min-w-0 flex-1 font-sans"
        style={{ fontSize: 17, fontWeight: 500, color: "var(--color-negro-bordo)" }}
      >
        {client.name}
      </span>

      {/* Contador */}
      <span
        className="shrink-0 font-mono"
        style={{
          fontSize: 12,
          marginRight: 16,
          color: zero ? "var(--color-dorado)" : "var(--color-gris-bordo)",
        }}
      >
        {zero
          ? "agregar el primero"
          : `${client.clippings_count} clipping${client.clippings_count === 1 ? "" : "s"}`}
      </span>

      {/* Flecha */}
      <ChevronRight
        size={18}
        aria-hidden
        className="shrink-0 text-[rgba(102,0,31,0.4)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[rgba(102,0,31,1)]"
      />
    </>
  )
}
