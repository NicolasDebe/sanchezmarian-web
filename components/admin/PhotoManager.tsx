"use client"

/**
 * Gestor de fotos de campañas: drag & drop para reordenar (@dnd-kit), alt
 * editable inline, compresión automática antes del upload
 * (browser-image-compression) y eliminación individual.
 *
 * Dos modos:
 * - Edición (campaignId presente): cada cambio se persiste al instante
 *   (upload/reorder/alt/delete contra las server actions) con optimistic UI.
 * - Campaña nueva (sin campaignId): las fotos viven solo en el cliente
 *   (object URLs) y se suben al bucket recién en el primer guardado, vía
 *   flushPending() que el form llama desde handleSave.
 */

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react"
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
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Star,
  Upload,
  X,
} from "lucide-react"
import {
  deleteCampaignImage,
  reorderImages,
  updateImageAlt,
  uploadCampaignImage,
  type StagedImage,
} from "@/app/admin/(panel)/campanas/actions"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PhotoManagerImage {
  id: string
  url: string
  alt: string
  position: number
}

interface ManagedPhoto {
  /** id estable para dnd-kit (id de la base o local) */
  key: string
  /** id en campaign_images — solo en modo edición */
  id?: string
  /** URL pública (edición) u object URL (pendiente) */
  url: string
  alt: string
  /** Archivo comprimido listo para subir — solo fotos pendientes */
  file?: File
  /** Cache del upload si flushPending falló a mitad: evita re-subir al reintentar */
  uploadedUrl?: string
  uploadedPath?: string
}

export interface PhotoManagerHandle {
  /** Sube las fotos pendientes al bucket (campaña nueva) y las devuelve en orden. */
  flushPending: (
    slug: string,
  ) => Promise<
    { success: true; images: StagedImage[] } | { success: false; error: string }
  >
}

interface PhotoManagerProps {
  campaignSlug: string
  /** Presente en modo edición: los cambios se persisten al instante. */
  campaignId?: string
  initialImages: PhotoManagerImage[]
  onCountChange?: (count: number) => void
  onBusyChange?: (busy: boolean) => void
  error?: string
  ref?: Ref<PhotoManagerHandle>
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"]
const MAX_ORIGINAL_SIZE = 10 * 1024 * 1024 // se comprime después, el server acepta hasta 5MB
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024
const MAX_PHOTOS = 20
const SKIP_COMPRESSION_UNDER = 500 * 1024

// ─── Compresión ───────────────────────────────────────────────────────────────

async function optimizeImage(
  file: File,
  onProgress: (percent: number) => void,
): Promise<File> {
  if (file.size < SKIP_COMPRESSION_UNDER) return file
  try {
    const imageCompression = (await import("browser-image-compression")).default
    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2400,
      useWebWorker: true,
      fileType: "image/webp",
      onProgress,
    })
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp"
    return new File([compressed], name, { type: "image/webp" })
  } catch (err) {
    console.warn("No se pudo comprimir la imagen, se sube el original:", err)
    return file
  }
}

// ─── Editor inline de alt ─────────────────────────────────────────────────────

function AltEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: string
  onSave: (alt: string) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(initial)
  return (
    <>
      <input
        className="admin-input"
        style={{ padding: "4px 8px", fontSize: 12 }}
        value={draft}
        maxLength={200}
        autoFocus
        placeholder="Describí la foto (texto alternativo)"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(draft)
          if (e.key === "Escape") onCancel()
        }}
      />
      <button
        type="button"
        onClick={() => onSave(draft)}
        aria-label="Guardar texto alternativo"
        className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-90"
        style={{ background: "var(--color-bordo)", color: "var(--color-hueso)" }}
      >
        <Check size={12} />
      </button>
    </>
  )
}

// ─── Card sortable ────────────────────────────────────────────────────────────

function PhotoCard({
  photo,
  index,
  total,
  onRemove,
  onMove,
  onSaveAlt,
  editing,
  onStartEdit,
  onCancelEdit,
}: {
  photo: ManagedPhoto
  index: number
  total: number
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  onSaveAlt: (alt: string) => void
  editing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: photo.key, disabled: editing })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="photo-card-enter relative"
    >
      <div
        className="overflow-hidden rounded-xl border bg-white"
        style={{
          borderColor: isOver && !isDragging ? "var(--color-dorado)" : "rgba(201,168,130,0.4)",
          boxShadow: isDragging
            ? "0 16px 32px rgba(26,0,8,0.25)"
            : isOver
              ? "0 0 0 2px var(--color-dorado)"
              : undefined,
          opacity: isDragging ? 0.92 : 1,
        }}
      >
        {/* Zona draggable: el thumbnail */}
        <div
          {...attributes}
          {...listeners}
          className="relative touch-none select-none"
          style={{
            aspectRatio: "4 / 3",
            cursor: editing ? "default" : isDragging ? "grabbing" : "grab",
          }}
          aria-label={`Foto ${index + 1} de ${total}. Arrastrá para reordenar.`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.alt || `Foto ${index + 1}`}
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />

          {/* Badge de orden */}
          {index === 0 ? (
            <span
              className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1 font-mono uppercase"
              style={{
                fontSize: 8,
                letterSpacing: "0.1em",
                background: "var(--color-bordo)",
                color: "var(--color-hueso)",
              }}
            >
              <Star size={9} fill="currentColor" />
              Destacada
            </span>
          ) : (
            <span
              className="absolute left-2 top-2 rounded-full px-2.5 py-1 font-mono"
              style={{
                fontSize: 9,
                background: "var(--color-arena)",
                color: "var(--color-gris-bordo)",
              }}
            >
              {index + 1}
            </span>
          )}
        </div>

        {/* Controles superiores (fuera de la zona drag) */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Eliminar foto ${index + 1}`}
          className="absolute right-2 top-2 rounded-full p-1.5 shadow transition-opacity hover:opacity-100"
          style={{ background: "rgba(26,0,8,0.75)", color: "var(--color-hueso)", opacity: 0.85 }}
        >
          <X size={13} />
        </button>

        {/* Mover arriba/abajo: fallback sin drag (touch viejo, lectores) */}
        <div className="absolute bottom-[52px] right-2 flex flex-col gap-1">
          {index > 0 && (
            <button
              type="button"
              onClick={() => onMove(-1)}
              aria-label="Mover antes"
              className="rounded-full p-1 shadow"
              style={{ background: "rgba(254,252,239,0.9)", color: "var(--color-gris-bordo)" }}
            >
              <ChevronUp size={13} />
            </button>
          )}
          {index < total - 1 && (
            <button
              type="button"
              onClick={() => onMove(1)}
              aria-label="Mover después"
              className="rounded-full p-1 shadow"
              style={{ background: "rgba(254,252,239,0.9)", color: "var(--color-gris-bordo)" }}
            >
              <ChevronDown size={13} />
            </button>
          )}
        </div>

        {/* Footer: alt */}
        <div
          className="flex items-center gap-2 border-t px-3 py-2"
          style={{ borderColor: "rgba(201,168,130,0.3)", background: "var(--color-hueso)" }}
        >
          {editing ? (
            <AltEditor initial={photo.alt} onSave={onSaveAlt} onCancel={onCancelEdit} />
          ) : (
            <>
              <p
                className="min-w-0 flex-1 truncate font-sans text-xs"
                style={{ color: photo.alt ? "var(--color-gris-bordo)" : "rgba(74,48,64,0.4)" }}
                title={photo.alt}
              >
                {photo.alt || "Sin texto alternativo"}
              </p>
              <button
                type="button"
                onClick={onStartEdit}
                aria-label={`Editar texto alternativo de la foto ${index + 1}`}
                className="shrink-0 rounded p-1 transition-colors hover:bg-[rgba(102,0,31,0.06)]"
                style={{ color: "var(--color-bordo)" }}
              >
                <Pencil size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PhotoManager({
  campaignSlug,
  campaignId,
  initialImages,
  onCountChange,
  onBusyChange,
  error,
  ref,
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<ManagedPhoto[]>(() =>
    initialImages
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((img) => ({ key: img.id, id: img.id, url: img.url, alt: img.alt })),
  )
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState<null | {
    total: number
    done: number
    phase: "optimizing" | "uploading"
    percent: number
  }>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<{
    photo: ManagedPhoto
    index: number
  } | null>(null)
  const [removingPhoto, setRemovingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Espejo para acceso imperativo (flushPending) sin closures viejas.
  const photosRef = useRef(photos)
  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    onCountChange?.(photos.length)
  }, [photos.length, onCountChange])

  useEffect(() => {
    onBusyChange?.(progress !== null)
  }, [progress, onBusyChange])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // Limpiar object URLs al desmontar.
  useEffect(() => {
    return () => {
      for (const p of photosRef.current) {
        if (p.url.startsWith("blob:")) URL.revokeObjectURL(p.url)
      }
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ── Reordenar ──
  const persistOrder = useCallback(
    (next: ManagedPhoto[], previous: ManagedPhoto[]) => {
      if (!campaignId) return // pendientes: el orden vive en el estado
      reorderImages(
        campaignId,
        next.map((p) => p.id!),
      ).then((result) => {
        if (!result.success) {
          setPhotos(previous)
          setToast(result.error)
        }
      })
    },
    [campaignId],
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const prev = photosRef.current
    const oldIndex = prev.findIndex((p) => p.key === active.id)
    const newIndex = prev.findIndex((p) => p.key === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(prev, oldIndex, newIndex)
    setPhotos(next)
    persistOrder(next, prev)
  }

  function movePhoto(index: number, dir: -1 | 1) {
    const target = index + dir
    const prev = photosRef.current
    if (target < 0 || target >= prev.length) return
    const next = arrayMove(prev, index, target)
    setPhotos(next)
    persistOrder(next, prev)
  }

  // ── Subida ──
  async function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files)
    if (incoming.length === 0) return

    const valid: File[] = []
    for (const file of incoming) {
      if (!ALLOWED_MIME.includes(file.type)) {
        setToast(`"${file.name}" no es JPG, PNG ni WebP — se salteó.`)
        continue
      }
      if (file.size > MAX_ORIGINAL_SIZE) {
        setToast(`"${file.name}" pesa más de 10MB — se salteó.`)
        continue
      }
      valid.push(file)
    }
    if (valid.length === 0) return

    if (photosRef.current.length + valid.length > MAX_PHOTOS) {
      setToast(`El máximo es ${MAX_PHOTOS} fotos por campaña.`)
      return
    }

    if (campaignId && !campaignSlug) {
      setToast("Falta el slug de la campaña. Recargá la página.")
      return
    }

    setProgress({ total: valid.length, done: 0, phase: "optimizing", percent: 0 })
    let added = 0

    for (const [i, file] of valid.entries()) {
      setProgress({ total: valid.length, done: i, phase: "optimizing", percent: 0 })
      const optimized = await optimizeImage(file, (percent) =>
        setProgress({ total: valid.length, done: i, phase: "optimizing", percent }),
      )

      if (optimized.size > MAX_UPLOAD_SIZE) {
        setToast(`"${file.name}" sigue pesando más de 5MB tras comprimirla — se salteó.`)
        continue
      }

      if (!campaignId) {
        // Campaña nueva: queda pendiente en el cliente hasta el primer guardado.
        const key = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        setPhotos((prev) => [
          ...prev,
          { key, url: URL.createObjectURL(optimized), alt: "", file: optimized },
        ])
        added++
        continue
      }

      setProgress({ total: valid.length, done: i, phase: "uploading", percent: 100 })
      const fd = new FormData()
      fd.set("file", optimized)
      fd.set("slug", campaignSlug)
      fd.set("campaignId", campaignId)
      const result = await uploadCampaignImage(fd)
      if (!result.success) {
        setToast(result.error || "No pudimos guardar la foto. Intentá de nuevo.")
        continue
      }
      setPhotos((prev) => [
        ...prev,
        { key: result.id!, id: result.id, url: result.url, alt: "" },
      ])
      added++
    }

    setProgress(null)
    if (added > 0) {
      setToast(
        campaignId
          ? `${added === 1 ? "Imagen subida" : `${added} imágenes subidas`}.`
          : `${added === 1 ? "Foto lista" : `${added} fotos listas`} — se suben al guardar.`,
      )
    }
  }

  // ── Eliminar ──
  async function confirmRemovePhoto() {
    if (!confirmRemove) return
    setRemovingPhoto(true)
    await removePhoto(confirmRemove.photo, confirmRemove.index)
    setRemovingPhoto(false)
    setConfirmRemove(null)
  }

  async function removePhoto(photo: ManagedPhoto, index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    if (!photo.id) {
      if (photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url)
      return
    }
    const result = await deleteCampaignImage(photo.id)
    if (!result.success) {
      setToast(result.error)
      setPhotos((prev) => {
        const next = [...prev]
        next.splice(Math.min(index, next.length), 0, photo)
        return next
      })
    }
  }

  // ── Alt ──
  async function saveAlt(photo: ManagedPhoto, index: number, alt: string) {
    const clean = alt.trim().slice(0, 200)
    setEditingKey(null)
    if (clean === photo.alt) return
    const previousAlt = photo.alt
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, alt: clean } : p)))
    if (!photo.id) return // pendiente: viaja con el primer guardado
    const result = await updateImageAlt(photo.id, clean)
    if (!result.success) {
      setToast(result.error)
      setPhotos((prev) =>
        prev.map((p) => (p.key === photo.key ? { ...p, alt: previousAlt } : p)),
      )
    }
  }

  // ── Flush de pendientes (campaña nueva) ──
  useImperativeHandle(
    ref,
    () => ({
      async flushPending(slug: string) {
        const images: StagedImage[] = []
        for (const photo of photosRef.current) {
          // Ya subida en un intento anterior que falló más adelante: no re-subir.
          if (photo.uploadedUrl && photo.uploadedPath) {
            images.push({ url: photo.uploadedUrl, path: photo.uploadedPath, alt: photo.alt })
            continue
          }
          if (!photo.file) continue
          const fd = new FormData()
          fd.set("file", photo.file)
          fd.set("slug", slug)
          const result = await uploadCampaignImage(fd)
          if (!result.success) {
            return {
              success: false as const,
              error: result.error || "No pudimos guardar las fotos. Intentá de nuevo.",
            }
          }
          photo.uploadedUrl = result.url
          photo.uploadedPath = result.path
          images.push({ url: result.url, path: result.path, alt: photo.alt })
        }
        return { success: true as const, images }
      },
    }),
    [],
  )

  const overallPercent = progress
    ? Math.round(((progress.done + progress.percent / 100) / progress.total) * 100)
    : 0

  return (
    <div className="flex flex-col gap-4">
      {/* ── Drop zone ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Subir fotos"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          addFiles(e.dataTransfer.files)
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors"
        style={{
          borderColor: dragOver ? "var(--color-dorado)" : "rgba(201,168,130,0.5)",
          background: dragOver ? "rgba(102,0,31,0.05)" : "var(--color-hueso)",
        }}
      >
        <Upload size={20} style={{ color: "var(--color-bordo)" }} />
        <p className="font-sans text-sm" style={{ color: "var(--color-negro-bordo)" }}>
          Arrastrá fotos acá o hacé click para seleccionar
        </p>
        <p className="font-mono" style={{ fontSize: 10, color: "rgba(74,48,64,0.5)" }}>
          JPG, PNG o WebP — se optimizan automáticamente al subirlas
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {/* ── Progreso ── */}
      {progress && (
        <div className="flex flex-col gap-1.5">
          <p
            className="flex items-center gap-2 font-sans text-sm"
            style={{ color: "var(--color-gris-bordo)" }}
          >
            <Loader2 size={14} className="animate-spin" />
            {progress.phase === "optimizing"
              ? `Optimizando imagen ${progress.done + 1} de ${progress.total}…`
              : `Subiendo ${progress.done + 1} de ${progress.total}…`}
          </p>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(201,168,130,0.25)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${overallPercent}%`, background: "var(--color-bordo)" }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="font-sans text-xs" style={{ color: "#B3261E" }}>
          {error}
        </p>
      )}

      {/* ── Grid sortable ── */}
      {photos.length === 0 && !progress ? (
        <p className="font-sans text-sm" style={{ color: "rgba(74,48,64,0.55)" }}>
          Todavía no hay fotos. La primera del orden es la destacada.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={photos.map((p) => p.key)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, i) => (
                <PhotoCard
                  key={photo.key}
                  photo={photo}
                  index={i}
                  total={photos.length}
                  editing={editingKey === photo.key}
                  onStartEdit={() => setEditingKey(photo.key)}
                  onCancelEdit={() => setEditingKey(null)}
                  onSaveAlt={(alt) => saveAlt(photo, i, alt)}
                  onRemove={() => setConfirmRemove({ photo, index: i })}
                  onMove={(dir) => movePhoto(i, dir)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 font-sans text-sm shadow-lg"
          style={{ backgroundColor: "var(--color-negro-bordo)", color: "var(--color-hueso)" }}
        >
          {toast}
        </div>
      )}

      {/* Confirmación de borrado de foto */}
      <ConfirmDialog
        open={!!confirmRemove}
        title="¿Eliminar esta foto? No se puede deshacer."
        busy={removingPhoto}
        onConfirm={confirmRemovePhoto}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  )
}
