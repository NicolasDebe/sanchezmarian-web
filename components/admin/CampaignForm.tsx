"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  createCampaignAction,
  updateCampaignAction,
  deleteCampaignImageAction,
  addCampaignImageAction,
} from "@/app/admin/actions"
import type { Campaign, CampaignImage } from "@/lib/types/campaign"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "10px 14px",
  border:       "1.5px solid rgba(102,0,31,0.15)",
  borderRadius: 8,
  fontSize:     14,
  background:   "#fff",
  color:        "var(--color-negro-bordo)",
  outline:      "none",
  boxSizing:    "border-box",
  fontFamily:   "var(--font-dm-sans), sans-serif",
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="font-mono"
        style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-bordo)", display: "block", marginBottom: 6 }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function Toast({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div
      style={{
        position:  "fixed",
        top:       24,
        right:     24,
        zIndex:    200,
        padding:   "12px 20px",
        borderRadius: 8,
        background: type === "success" ? "var(--color-bordo)" : "#9b1c1c",
        color:      "var(--color-hueso)",
        boxShadow:  "0 4px 20px rgba(0,0,0,0.25)",
        maxWidth:   340,
      }}
    >
      <p className="font-sans" style={{ fontSize: 14 }}>{msg}</p>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CampaignFormProps {
  campaign?: Campaign
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function CampaignForm({ campaign }: CampaignFormProps) {
  const router   = useRouter()
  const isEdit   = !!campaign
  const fileRef  = useRef<HTMLInputElement>(null)

  // Campos del formulario
  const [brand,       setBrand]       = useState(campaign?.brand       ?? "")
  const [slug,        setSlug]        = useState(campaign?.slug        ?? "")
  const [title,       setTitle]       = useState(campaign?.title       ?? "")
  const [description, setDescription] = useState(campaign?.description ?? "")
  const [content,     setContent]     = useState(campaign?.content     ?? "")
  const [status,      setStatus]      = useState<"ACTIVA" | "FINALIZADA">(campaign?.status ?? "ACTIVA")
  const [date,        setDate]        = useState(campaign?.date        ?? "")
  const [slugManual,  setSlugManual]  = useState(isEdit)

  // Fotos
  const [images,       setImages]       = useState<CampaignImage[]>(
    [...(campaign?.images ?? [])].sort((a, b) => a.position - b.position)
  )
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // UI state
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast,     setToast]     = useState<{ type: "success" | "error"; msg: string } | null>(null)

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function handleBrandChange(value: string) {
    setBrand(value)
    if (!slugManual) setSlug(slugify(value))
  }

  // ── Subida de archivo al bucket ────────────────────────────────────────────

  async function uploadFile(file: File, targetSlug: string): Promise<string> {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("slug", targetSlug)

    const res  = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Error al subir imagen")
    return json.url as string
  }

  // ── Guardar ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!brand || !slug || !title || !description || !content || !date) {
      showToast("error", "Completá todos los campos requeridos.")
      return
    }

    setSaving(true)
    try {
      const data = { brand, slug, title, description, content, status, date }

      if (isEdit) {
        // Actualizar campaña existente
        await updateCampaignAction(campaign.id, data)
        showToast("success", "Campaña actualizada correctamente.")
      } else {
        // Crear campaña nueva
        const created = await createCampaignAction(data)

        // Subir fotos pendientes si las hay
        if (pendingFiles.length > 0) {
          setUploading(true)
          for (let i = 0; i < pendingFiles.length; i++) {
            try {
              const url = await uploadFile(pendingFiles[i], created.slug)
              await addCampaignImageAction(created.id, url, `Imagen ${i + 1}`, i + 1)
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Error al subir imagen"
              showToast("error", msg)
            }
          }
          setUploading(false)
        }
        showToast("success", "Campaña creada correctamente.")
      }

      setTimeout(() => router.push("/admin/dashboard"), 1200)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido"
      showToast("error", msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Eliminar imagen (solo editar) ──────────────────────────────────────────

  async function handleDeleteImage(imageId: string) {
    try {
      await deleteCampaignImageAction(imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
    } catch {
      showToast("error", "Error al eliminar la imagen.")
    }
  }

  // ── Subir fotos nuevas (editar: inmediato / nueva: acumula) ───────────────

  async function handleFileChange(files: FileList) {
    if (isEdit) {
      // Subida inmediata
      if (!slug) { showToast("error", "El slug es obligatorio antes de subir fotos."); return }
      setUploading(true)
      const maxPos = images.reduce((m, img) => Math.max(m, img.position), 0)

      for (let i = 0; i < files.length; i++) {
        try {
          const url      = await uploadFile(files[i], slug)
          const position = maxPos + i + 1
          const newImg   = await addCampaignImageAction(campaign!.id, url, `Imagen ${position}`, position)
          setImages(prev => [...prev, newImg])
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error al subir imagen"
          showToast("error", msg)
        }
      }
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    } else {
      // Acumular para subir después de crear
      setPendingFiles(prev => [...prev, ...Array.from(files)])
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const isBusy = saving || uploading

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {toast && <Toast type={toast.type} msg={toast.msg} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Marca + Slug */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Marca *">
            <input
              value={brand}
              onChange={e => handleBrandChange(e.target.value)}
              placeholder="Grupo Presidente"
              style={inputStyle}
            />
          </Field>
          <Field label="Slug *">
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="grupo-presidente"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Título */}
        <Field label="Título *">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titular principal de la campaña"
            style={inputStyle}
          />
        </Field>

        {/* Descripción corta */}
        <Field label="Descripción corta *">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción que aparece en la grilla de campañas…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>

        {/* Contenido largo */}
        <Field label="Contenido largo * (HTML)">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={"<p class=\"lead\">…</p>\n<h3>Título sección</h3>\n<p>Texto…</p>"}
            rows={14}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, resize: "vertical" }}
          />
        </Field>

        {/* Estado + Fecha */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Estado *">
            <select
              value={status}
              onChange={e => setStatus(e.target.value as "ACTIVA" | "FINALIZADA")}
              style={inputStyle}
            >
              <option value="ACTIVA">ACTIVA</option>
              <option value="FINALIZADA">FINALIZADA</option>
            </select>
          </Field>
          <Field label="Fecha *">
            <input
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="Junio 2026"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* ── Gestión de fotos ────────────────────────────────────────────── */}
        <div style={{ borderTop: "1px solid rgba(102,0,31,0.1)", paddingTop: 20 }}>
          <p
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-bordo)", marginBottom: 16 }}
          >
            Fotos
          </p>

          {/* Grid de fotos existentes (solo editar) */}
          {isEdit && images.length > 0 && (
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}
            >
              {images.map(img => (
                <div key={img.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "4/3", background: "var(--color-arena)" }}>
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="160px"
                    style={{ objectFit: "cover" }}
                  />
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    aria-label="Eliminar imagen"
                    style={{
                      position:   "absolute",
                      top:        6,
                      right:      6,
                      width:      26,
                      height:     26,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.55)",
                      border:     "none",
                      color:      "#fff",
                      fontSize:   15,
                      lineHeight: 1,
                      cursor:     "pointer",
                      display:    "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                  <span
                    className="font-mono"
                    style={{
                      position:   "absolute",
                      bottom:     6,
                      left:       6,
                      fontSize:   9,
                      color:      "rgba(255,255,255,0.7)",
                      background: "rgba(0,0,0,0.4)",
                      padding:    "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    #{img.position}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Vista previa de fotos pendientes (solo nueva) */}
          {!isEdit && pendingFiles.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p className="font-sans" style={{ fontSize: 12, color: "var(--color-gris-bordo)", marginBottom: 8 }}>
                {pendingFiles.length} foto{pendingFiles.length > 1 ? "s" : ""} seleccionada{pendingFiles.length > 1 ? "s" : ""} (se subirán al crear)
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {pendingFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(102,0,31,0.06)", borderRadius: 6, padding: "4px 10px" }}>
                    <span className="font-sans" style={{ fontSize: 12, color: "var(--color-negro-bordo)" }}>{f.name}</span>
                    <button
                      onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", color: "var(--color-bordo)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input de subida */}
          <label
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              padding:      "10px 16px",
              border:       "1.5px dashed rgba(102,0,31,0.25)",
              borderRadius: 8,
              cursor:       uploading ? "not-allowed" : "pointer",
              background:   "rgba(102,0,31,0.02)",
              opacity:      uploading ? 0.6 : 1,
            }}
          >
            <span className="font-sans" style={{ fontSize: 13, color: "var(--color-bordo)", fontWeight: 500 }}>
              {uploading ? "Subiendo…" : "+ Agregar fotos"}
            </span>
            <span className="font-sans" style={{ fontSize: 12, color: "var(--color-gris-bordo)" }}>
              JPG, PNG, WebP — múltiple
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              style={{ display: "none" }}
              onChange={e => { if (e.target.files) handleFileChange(e.target.files) }}
            />
          </label>
        </div>

        {/* ── Acciones ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12, paddingTop: 8, borderTop: "1px solid rgba(102,0,31,0.08)" }}>
          <button
            onClick={handleSave}
            disabled={isBusy}
            className="font-sans"
            style={{
              background:   isBusy ? "rgba(102,0,31,0.45)" : "var(--color-bordo)",
              color:        "var(--color-hueso)",
              padding:      "12px 32px",
              borderRadius: 8,
              fontSize:     14,
              fontWeight:   600,
              border:       "none",
              cursor:       isBusy ? "not-allowed" : "pointer",
            }}
          >
            {saving
              ? "Guardando…"
              : uploading
              ? "Subiendo fotos…"
              : isEdit
              ? "Guardar cambios"
              : "Crear campaña"}
          </button>

          <button
            onClick={() => router.push("/admin/dashboard")}
            disabled={isBusy}
            className="font-sans"
            style={{
              background:   "transparent",
              color:        "var(--color-gris-bordo)",
              padding:      "12px 24px",
              borderRadius: 8,
              fontSize:     14,
              border:       "1px solid rgba(102,0,31,0.2)",
              cursor:       isBusy ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  )
}
