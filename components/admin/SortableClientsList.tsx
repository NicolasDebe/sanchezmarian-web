"use client"

/**
 * Lista de clientes de /admin/clippings con drag & drop para reordenar.
 * Auto-save al soltar (optimistic UI con revert + toast en caso de error).
 * Cada fila es navegable (click → /admin/clippings/{slug}) excepto el handle
 * que es exclusivamente dragueable.
 *
 * Accesibilidad: KeyboardSensor — focus en el handle, Space para "tomar",
 * flechas arriba/abajo, Space/Enter para soltar.
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
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
import { ChevronRight, GripVertical, Loader2 } from "lucide-react"
import { reorderClients } from "@/app/admin/(panel)/clippings/actions"

export interface SortableClient {
  id: string
  slug: string
  name: string
  logo_url: string | null
  clippings_count: number
}

interface Props {
  clients: SortableClient[]
}

type ToastState =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null

export default function SortableClientsList({ clients }: Props) {
  const [items, setItems] = useState<SortableClient[]>(clients)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // Mantener el estado local sincronizado si el server vuelve a fetcheaer
  // con un orden distinto (ej: después de revalidatePath).
  const lastIncomingRef = useRef<string>("")
  useEffect(() => {
    const sig = clients.map((c) => c.id).join("|")
    if (sig !== lastIncomingRef.current) {
      lastIncomingRef.current = sig
      setItems(clients)
    }
  }, [clients])

  useEffect(() => {
    if (!toast) return
    const ms = toast.kind === "error" ? 4000 : 2000
    const t = setTimeout(() => setToast(null), ms)
    return () => clearTimeout(t)
  }, [toast])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const itemIds = useMemo(() => items.map((c) => c.id), [items])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((c) => c.id === active.id)
    const newIndex = items.findIndex((c) => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const previous = items
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    setSavingId(String(active.id))

    const newIds = next.map((c) => c.id)
    startTransition(async () => {
      const res = await reorderClients(newIds)
      setSavingId(null)
      if (res.success) {
        setToast({ kind: "success", message: "Orden actualizado" })
        router.refresh()
      } else {
        setItems(previous)
        setToast({
          kind: "error",
          message: res.error
            ? `No se pudo guardar el orden — se revirtió (${res.error})`
            : "No se pudo guardar el orden — se revirtió",
        })
      }
    })
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <ul className="mt-8 flex flex-col gap-3" role="list">
            {items.map((c) => (
              <SortableRow key={c.id} client={c} saving={savingId === c.id} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <p
        className="mt-4 font-mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          color: "var(--color-gris-bordo)",
        }}
      >
        Arrastrá los clientes desde el ícono <span aria-hidden>≡</span> para
        cambiar el orden en que aparecen en /casos-de-exito. También podés usar
        el teclado: Tab para enfocar, Espacio para tomar, flechas para mover y
        Espacio para soltar.
      </p>

      {toast && <Toast toast={toast} />}
    </>
  )
}

// ─── Fila ─────────────────────────────────────────────────────────────────────

function SortableRow({
  client,
  saving,
}: {
  client: SortableClient
  saving: boolean
}) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    boxShadow: isDragging
      ? "0 18px 40px -12px rgba(102,0,31,0.35), 0 4px 12px rgba(102,0,31,0.18)"
      : undefined,
    scale: isDragging ? "1.02" : undefined,
    zIndex: isDragging ? 5 : undefined,
    position: "relative",
    backgroundColor: "var(--color-hueso)",
    borderColor: "rgba(201,168,130,0.3)",
  }

  function goToClient() {
    router.push(`/admin/clippings/${client.slug}`)
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 rounded-xl border px-4 transition-colors duration-200 hover:bg-[var(--color-arena)]"
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label={`Reordenar ${client.name}`}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex h-12 w-8 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          color: "var(--color-gris-bordo)",
          touchAction: "none",
        }}
      >
        <GripVertical size={18} />
      </button>

      {/* Fila clickeable */}
      <button
        type="button"
        onClick={goToClient}
        className="flex flex-1 items-center gap-4 py-4 text-left outline-none focus-visible:underline"
        style={{ minHeight: 80 - 32 }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-lg"
          style={{
            width: 48,
            height: 48,
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {client.logo_url ? (
            <Image
              src={client.logo_url}
              alt={`Logo ${client.name}`}
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <span
              className="font-mono font-bold"
              style={{ color: "var(--color-bordo)", fontSize: 18 }}
            >
              {client.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="truncate font-playfair font-bold"
            style={{ fontSize: 16, color: "var(--color-negro-bordo)" }}
          >
            {client.name}
          </h2>
          <p
            className="mt-1 font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color:
                client.clippings_count === 0
                  ? "var(--color-dorado)"
                  : "var(--color-gris-bordo)",
            }}
          >
            {client.clippings_count === 0
              ? "Sin clippings — agregar el primero"
              : `${client.clippings_count} clipping${client.clippings_count === 1 ? "" : "s"}`}
          </p>
        </div>

        <ChevronRight
          size={18}
          aria-hidden
          className="shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: "var(--color-dorado)" }}
        />
      </button>

      {/* Badge "Guardando..." */}
      {saving && (
        <span
          className="pointer-events-none absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            backgroundColor: "var(--color-bordo)",
            color: "var(--color-hueso)",
            boxShadow: "0 2px 6px rgba(102,0,31,0.25)",
          }}
        >
          <Loader2 size={10} className="animate-spin" />
          Guardando
        </span>
      )}
    </li>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast }: { toast: NonNullable<ToastState> }) {
  const ok = toast.kind === "success"
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 font-sans font-medium shadow-lg"
      style={{
        fontSize: 13,
        backgroundColor: ok ? "#1c4d2f" : "var(--color-bordo)",
        color: "var(--color-hueso)",
        boxShadow: "0 12px 28px -8px rgba(0,0,0,0.35)",
      }}
    >
      <span aria-hidden style={{ marginRight: 8 }}>
        {ok ? "✓" : "✕"}
      </span>
      {toast.message}
    </div>
  )
}
