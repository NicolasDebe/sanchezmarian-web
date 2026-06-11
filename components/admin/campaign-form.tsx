"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import slugify from "slugify"
import { Check, Eye, Loader2, Pencil, Star, Trash2, Upload, X } from "lucide-react"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { STATUS_LABELS, type Campaign, type CampaignStatus } from "@/lib/types/campaign"
import {
  checkSlugAvailability,
  createCampaign,
  deleteCampaign,
  deleteCampaignImage,
  deleteStagedImage,
  updateCampaign,
  uploadCampaignImage,
  type CampaignInput,
} from "@/app/admin/(panel)/campanas/actions"

// ─── Fecha: "Junio 2026" ⇄ "2026-06" (input type="month") ─────────────────────

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function monthInputToLabel(value: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(value)
  if (!m) return value
  return `${MONTHS_ES[Number(m[2]) - 1]} ${m[1]}`
}

function labelToMonthInput(label: string): string {
  const m = /^([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{4})$/.exec(label.trim())
  if (m) {
    const idx = MONTHS_ES.findIndex((name) => name.toLowerCase() === m[1].toLowerCase())
    if (idx !== -1) return `${m[2]}-${String(idx + 1).padStart(2, "0")}`
  }
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function makeSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: "es", trim: true })
}

function plainTextLength(html: string): number {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim().length
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PhotoItem {
  /** id de campaign_images si ya está persistida (modo edición) */
  id?: string
  url: string
  /** path en el bucket si fue subida en esta sesión (campaña nueva) */
  path?: string
}

const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const STATUS_OPTIONS: CampaignStatus[] = ["draft", "active", "finished"]

// ─── Sub-componentes de layout ────────────────────────────────────────────────

function Section({
  title,
  helper,
  children,
}: {
  title: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl border p-6 sm:p-7"
      style={{ backgroundColor: "var(--color-hueso-oscuro)", borderColor: "rgba(201,168,130,0.3)" }}
    >
      <h2
        className="font-playfair font-bold"
        style={{ fontSize: 17, color: "var(--color-negro-bordo)" }}
      >
        {title}
      </h2>
      {helper && (
        <p className="mt-1 font-sans text-xs" style={{ color: "rgba(74,48,64,0.65)" }}>
          {helper}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  error,
  counter,
  children,
}: {
  label: string
  error?: string
  counter?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label
          className="font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--color-gris-bordo)" }}
        >
          {label}
        </label>
        {counter && (
          <span className="font-mono" style={{ fontSize: 10, color: "rgba(74,48,64,0.5)" }}>
            {counter}
          </span>
        )}
      </div>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="mt-1.5 font-sans text-xs" style={{ color: "#B3261E" }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Form principal ───────────────────────────────────────────────────────────

export function CampaignForm({ initial }: { initial?: Campaign }) {
  const router = useRouter()
  const isEdit = !!initial

  const [title, setTitle] = useState(initial?.title ?? "")
  const [brand, setBrand] = useState(initial?.brand ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [slugManual, setSlugManual] = useState(isEdit)
  const [slugEditing, setSlugEditing] = useState(false)
  const [slugCheck, setSlugCheck] = useState<null | { available: boolean; reason?: string }>(null)
  const [status, setStatus] = useState<CampaignStatus>(initial?.status ?? "draft")
  const [dateMonth, setDateMonth] = useState(labelToMonthInput(initial?.date ?? ""))
  const [description, setDescription] = useState(initial?.description ?? "")
  const [content, setContent] = useState(initial?.content ?? "")
  const [photos, setPhotos] = useState<PhotoItem[]>(
    (initial?.images ?? []).map((img) => ({ id: img.id, url: img.url })),
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<null | "draft" | "publish">(null)
  const [uploading, setUploading] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // Validación de unicidad en tiempo real (debounce 500ms). El reset de
  // slugCheck pasa en los handlers que cambian el slug, no acá.
  useEffect(() => {
    if (!slug) return
    if (isEdit && slug === initial?.slug) return
    const t = setTimeout(async () => {
      const result = await checkSlugAvailability(slug, initial?.id)
      setSlugCheck(result)
    }, 500)
    return () => clearTimeout(t)
  }, [slug, isEdit, initial?.slug, initial?.id])

  function clearError(key: string) {
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  function changeTitle(next: string) {
    setTitle(next)
    clearError("title")
    // Slug auto-generado desde el título mientras no se haya editado a mano.
    if (!slugManual) {
      setSlug(makeSlug(next))
      setSlugCheck(null)
    }
  }

  function changeSlug(raw: string) {
    setSlugManual(true)
    setSlug(makeSlug(raw).replace(/-+$/, "") + (raw.endsWith("-") ? "-" : ""))
    setSlugCheck(null)
    clearError("slug")
  }

  // ── Fotos ──
  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (list.length === 0) return

    const folderSlug = slug || makeSlug(title)
    if (!folderSlug) {
      setErrors((e) => ({ ...e, photos: "Completá el título antes de subir fotos." }))
      return
    }
    clearError("photos")

    setUploading((n) => n + list.length)
    for (const file of list) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
      if (!ALLOWED_EXT.includes(ext)) {
        setToast(`"${file.name}" no es JPG, PNG ni WebP — se salteó.`)
        setUploading((n) => n - 1)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        setToast(`"${file.name}" pesa más de 5MB — se salteó.`)
        setUploading((n) => n - 1)
        continue
      }
      const fd = new FormData()
      fd.set("file", file)
      fd.set("slug", folderSlug)
      if (initial?.id) fd.set("campaignId", initial.id)

      const result = await uploadCampaignImage(fd)
      setUploading((n) => n - 1)
      if (!result.success) {
        setToast(result.error)
        continue
      }
      setPhotos((prev) => [...prev, { id: result.id, url: result.url, path: result.path }])
    }
  }

  async function removePhoto(photo: PhotoItem, index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    const result = photo.id
      ? await deleteCampaignImage(photo.id)
      : photo.path
        ? await deleteStagedImage(photo.path)
        : { success: true as const }
    if (!result.success) {
      setToast(result.error)
      setPhotos((prev) => {
        const next = [...prev]
        next.splice(index, 0, photo)
        return next
      })
    }
  }

  // ── Guardado ──
  function validate(finalStatus: CampaignStatus): boolean {
    const next: Record<string, string> = {}
    const t = title.trim()
    if (t.length < 5 || t.length > 100) next.title = "El título tiene que tener entre 5 y 100 caracteres."
    if (!brand.trim()) next.brand = "La marca o cliente es obligatoria."
    if (!slug) next.slug = "El slug no puede quedar vacío."
    else if (slugCheck && !slugCheck.available) next.slug = slugCheck.reason ?? "Ese slug no está disponible."
    const d = description.trim()
    if (d.length < 50 || d.length > 200) next.description = "La descripción tiene que tener entre 50 y 200 caracteres."
    if (plainTextLength(content) < 100) next.content = "El contenido tiene que tener al menos 100 caracteres de texto."
    if (!dateMonth) next.date = "Elegí la fecha."
    if (finalStatus !== "draft" && photos.length === 0)
      next.photos = "Necesitás al menos una foto para publicar."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave(mode: "draft" | "publish") {
    const finalStatus: CampaignStatus = mode === "draft" ? "draft" : status
    if (!validate(finalStatus)) return

    setSaving(mode)
    const data: CampaignInput = {
      title: title.trim(),
      brand: brand.trim(),
      description: description.trim(),
      content,
      slug,
      status: finalStatus,
      date: monthInputToLabel(dateMonth),
    }

    const result = isEdit
      ? await updateCampaign(initial!.id, data)
      : await createCampaign(
          data,
          photos.map((p) => ({ url: p.url, path: p.path })),
        )
    setSaving(null)

    if (!result.success) {
      setErrors((e) => ({ ...e, _global: result.error }))
      return
    }
    router.push("/admin/campanas")
    router.refresh()
  }

  async function handleDelete() {
    if (!initial) return
    setDeleting(true)
    const result = await deleteCampaign(initial.id)
    setDeleting(false)
    setConfirmDelete(false)
    if (!result.success) {
      setToast(result.error)
      return
    }
    router.push("/admin/campanas?deleted=1")
    router.refresh()
  }

  const isDraft = status === "draft"

  return (
    <div className="mx-auto max-w-3xl pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/campanas"
            className="font-sans text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--color-gris-bordo)" }}
          >
            ← Volver a campañas
          </Link>
          <h1
            className="mt-3 font-playfair font-bold"
            style={{ fontSize: "2rem", color: "var(--color-negro-bordo)" }}
          >
            {isEdit ? "Editar campaña" : "Nueva campaña"}
          </h1>
        </div>

        {isEdit && isDraft && (
          <a
            href={`/campanas/${initial!.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border px-4 py-2 font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.04)]"
            style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
          >
            <Eye size={14} />
            Ver borrador
          </a>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {/* ── Sección 1: Datos básicos ── */}
        <Section title="Datos básicos">
          <Field
            label="Título"
            counter={`${title.length}/100`}
            error={errors.title}
          >
            <input
              className="admin-input"
              value={title}
              onChange={(e) => changeTitle(e.target.value)}
              placeholder="Ej.: Lynk & Co llega a Mendoza"
              maxLength={100}
            />
          </Field>

          <Field label="Marca / Cliente" error={errors.brand}>
            <input
              className="admin-input"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                clearError("brand")
              }}
              placeholder="Ej.: Grupo Presidente"
            />
          </Field>

          <Field label="Slug" error={errors.slug}>
            {slugEditing ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm" style={{ color: "rgba(74,48,64,0.5)" }}>
                  /campanas/
                </span>
                <input
                  className="admin-input font-mono"
                  style={{ fontSize: 13 }}
                  value={slug}
                  onChange={(e) => changeSlug(e.target.value)}
                  onBlur={() => setSlug((s) => makeSlug(s))}
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm" style={{ color: "rgba(74,48,64,0.55)" }}>
                  /campanas/{slug || "…"}
                </span>
                <button
                  type="button"
                  onClick={() => setSlugEditing(true)}
                  className="flex items-center gap-1 rounded px-2 py-1 font-sans text-xs transition-colors hover:bg-[rgba(102,0,31,0.06)]"
                  style={{ color: "var(--color-bordo)" }}
                >
                  <Pencil size={11} />
                  Editar slug
                </button>
              </div>
            )}
            {slug && slugCheck && (
              <p
                className="mt-1.5 flex items-center gap-1.5 font-sans text-xs"
                style={{ color: slugCheck.available ? "#2E7D32" : "#B3261E" }}
              >
                {slugCheck.available ? <Check size={12} /> : <X size={12} />}
                {slugCheck.available ? "Disponible" : slugCheck.reason}
              </p>
            )}
          </Field>

          <Field label="Estado">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => {
                const selected = status === s
                return (
                  <label
                    key={s}
                    className="cursor-pointer rounded-full border px-4 py-1.5 font-sans text-xs font-medium transition-colors"
                    style={
                      selected
                        ? { background: "var(--color-bordo)", color: "var(--color-hueso)", borderColor: "var(--color-bordo)" }
                        : { background: "var(--color-hueso)", color: "var(--color-gris-bordo)", borderColor: "rgba(201,168,130,0.5)" }
                    }
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={selected}
                      onChange={() => setStatus(s)}
                      className="sr-only"
                    />
                    {STATUS_LABELS[s]}
                  </label>
                )
              })}
            </div>
          </Field>

          <Field label="Fecha" error={errors.date}>
            <input
              type="month"
              className="admin-input"
              style={{ maxWidth: 220 }}
              value={dateMonth}
              onChange={(e) => {
                setDateMonth(e.target.value)
                clearError("date")
              }}
            />
            <p className="mt-1.5 font-sans text-xs" style={{ color: "rgba(74,48,64,0.55)" }}>
              Se muestra como &ldquo;{monthInputToLabel(dateMonth) || "—"}&rdquo;.
            </p>
          </Field>
        </Section>

        {/* ── Sección 2: Vista breve ── */}
        <Section title="Vista breve" helper="Se muestra en la lista de /campanas.">
          <Field
            label="Descripción corta"
            counter={`${description.length}/200`}
            error={errors.description}
          >
            <textarea
              className="admin-textarea"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                clearError("description")
              }}
              placeholder="Dos o tres frases que resumen la campaña (50 a 200 caracteres)."
              maxLength={200}
            />
          </Field>
        </Section>

        {/* ── Sección 3: Contenido expandido ── */}
        <Section
          title="Contenido expandido"
          helper="Se muestra en la página detalle de la campaña."
        >
          <div>
            <RichTextEditor
              value={content}
              onChange={(html) => {
                setContent(html)
                clearError("content")
              }}
            />
            {errors.content && (
              <p className="mt-1.5 font-sans text-xs" style={{ color: "#B3261E" }}>
                {errors.content}
              </p>
            )}
          </div>
        </Section>

        {/* ── Sección 4: Fotos ── */}
        <Section
          title="Fotos"
          helper="La primera foto es la destacada. JPG, PNG o WebP, hasta 5MB cada una."
        >
          <div
            role="button"
            tabIndex={0}
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
              uploadFiles(e.dataTransfer.files)
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors"
            style={{
              borderColor: dragOver ? "var(--color-bordo)" : "rgba(201,168,130,0.5)",
              background: dragOver ? "rgba(102,0,31,0.04)" : "var(--color-hueso)",
            }}
          >
            <Upload size={20} style={{ color: "var(--color-bordo)" }} />
            <p className="font-sans text-sm" style={{ color: "var(--color-negro-bordo)" }}>
              Arrastrá las fotos acá o hacé click para elegirlas
            </p>
            <p className="font-mono" style={{ fontSize: 10, color: "rgba(74,48,64,0.5)" }}>
              JPG · JPEG · PNG · WEBP — máx. 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) uploadFiles(e.target.files)
                e.target.value = ""
              }}
            />
          </div>

          {uploading > 0 && (
            <p
              className="flex items-center gap-2 font-sans text-sm"
              style={{ color: "var(--color-gris-bordo)" }}
            >
              <Loader2 size={14} className="animate-spin" />
              Subiendo {uploading} foto{uploading === 1 ? "" : "s"}…
            </p>
          )}

          {errors.photos && (
            <p className="font-sans text-xs" style={{ color: "#B3261E" }}>
              {errors.photos}
            </p>
          )}

          {photos.length === 0 && uploading === 0 ? (
            <p className="font-sans text-sm" style={{ color: "rgba(74,48,64,0.55)" }}>
              Subí al menos una foto{isDraft ? " (podés guardar el borrador sin fotos)" : ""}.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, i) => (
                <div
                  key={photo.id ?? photo.path ?? photo.url}
                  className="group relative overflow-hidden rounded-xl border"
                  style={{ borderColor: "rgba(201,168,130,0.4)", aspectRatio: "4 / 3" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Foto ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {i === 0 && (
                    <span
                      className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2.5 py-1 font-mono uppercase"
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
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo, i)}
                    aria-label="Eliminar foto"
                    className="absolute right-2 top-2 rounded-full p-1.5 opacity-0 shadow transition-opacity hover:opacity-100 group-hover:opacity-90"
                    style={{ background: "rgba(26,0,8,0.75)", color: "var(--color-hueso)" }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {errors._global && (
        <div
          className="mt-6 rounded-xl border p-4 font-sans text-sm"
          style={{ borderColor: "#B3261E", color: "#B3261E", background: "rgba(179,38,30,0.05)" }}
        >
          {errors._global}
        </div>
      )}

      {/* ── Footer sticky ── */}
      <div
        className="fixed bottom-0 right-0 z-40 border-t"
        style={{
          left: 240, // ancho del sidebar
          background: "rgba(254,252,239,0.95)",
          backdropFilter: "blur(8px)",
          borderColor: "rgba(201,168,130,0.35)",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-8 py-4">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-sans text-sm transition-colors hover:bg-[rgba(179,38,30,0.08)]"
                style={{ color: "#B3261E" }}
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/campanas"
              className="rounded-lg border px-5 py-2.5 font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.04)]"
              style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={!!saving || uploading > 0}
              className="rounded-lg border px-5 py-2.5 font-sans text-sm font-medium transition-colors hover:bg-[rgba(102,0,31,0.04)] disabled:opacity-50"
              style={{ borderColor: "var(--color-bordo)", color: "var(--color-bordo)" }}
            >
              {saving === "draft"
                ? "Guardando…"
                : isEdit
                  ? "Guardar como borrador"
                  : "Guardar borrador"}
            </button>
            <button
              type="button"
              onClick={() => handleSave("publish")}
              disabled={!!saving || uploading > 0}
              className="rounded-lg px-6 py-2.5 font-sans text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
            >
              {saving === "publish"
                ? "Guardando…"
                : isEdit
                  ? "Guardar cambios"
                  : isDraft
                    ? "Guardar"
                    : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal eliminar ── */}
      {confirmDelete && initial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(26,9,16,0.5)" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) setConfirmDelete(false)
          }}
        >
          <div
            className="w-full rounded-2xl border p-6 shadow-xl sm:p-8"
            style={{
              maxWidth: 440,
              backgroundColor: "var(--color-hueso)",
              borderColor: "rgba(201,168,130,0.4)",
            }}
          >
            <h2
              className="font-playfair text-xl font-bold"
              style={{ color: "var(--color-negro-bordo)" }}
            >
              ¿Eliminar la campaña &ldquo;{initial.title}&rdquo;?
            </h2>
            <p
              className="mt-3 font-sans text-sm leading-relaxed"
              style={{ color: "var(--color-gris-bordo)" }}
            >
              Esta acción borra también las {photos.length} fotos cargadas. No se
              puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-lg border px-4 py-2 font-sans text-sm transition-colors hover:bg-[rgba(102,0,31,0.04)] disabled:opacity-50"
                style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "#B3261E", color: "#fff" }}
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
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
    </div>
  )
}
