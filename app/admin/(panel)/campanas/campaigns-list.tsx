"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Search, Pencil, Trash2, Eye, ImageOff } from "lucide-react"
import { STATUS_LABELS, type Campaign, type CampaignStatus } from "@/lib/types/campaign"
import { hasHtmlTags, htmlToPlainText } from "@/lib/rich-text"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { deleteCampaign } from "./actions"

export type CampaignFilter = "todas" | "draft" | "active" | "finished"

const BADGE_STYLES: Record<CampaignStatus, React.CSSProperties> = {
  draft:    { background: "var(--color-arena)",        color: "var(--color-gris-bordo)" },
  active:   { background: "var(--color-bordo)",        color: "var(--color-hueso)" },
  finished: { background: "var(--color-bordo-oscuro)", color: "var(--color-hueso)" },
}

const FILTER_LABELS: Record<CampaignFilter, string> = {
  todas: "Todas",
  draft: "Borradores",
  active: "Activas",
  finished: "Finalizadas",
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: 9,
        letterSpacing: "0.1em",
        borderRadius: 100,
        padding: "4px 12px",
        ...BADGE_STYLES[status],
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function Thumbnail({ campaign }: { campaign: Campaign }) {
  const featured = campaign.images?.[0]
  if (!featured) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2"
        style={{ background: "var(--color-arena)", color: "rgba(74,48,64,0.4)" }}
      >
        <ImageOff size={20} strokeWidth={1.5} />
        <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: "0.1em" }}>
          Sin fotos
        </span>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={featured.url}
      alt={featured.alt || campaign.title}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  )
}

export function CampaignsList({
  campaigns,
  filter,
  counts,
  loadError,
}: {
  campaigns: Campaign[]
  filter: CampaignFilter
  counts: Record<CampaignFilter, number>
  loadError: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [confirm, setConfirm] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState(false)
  // Toast post-redirect desde el editor (?deleted=1)
  const [toast, setToast] = useState<string | null>(() =>
    searchParams.get("deleted") === "1" ? "Campaña eliminada." : null,
  )

  useEffect(() => {
    if (searchParams.get("deleted") === "1") {
      router.replace("/admin/campanas", { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return campaigns
    return campaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q),
    )
  }, [campaigns, search])

  async function handleDelete() {
    if (!confirm) return
    setDeleting(true)
    const result = await deleteCampaign(confirm.id)
    setDeleting(false)
    setConfirm(null)
    if (!result.success) {
      setToast(result.error)
      return
    }
    setToast("Campaña eliminada.")
    router.refresh()
  }

  const noCampaignsAtAll = counts.todas === 0 && !loadError

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="font-mono uppercase"
            style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--color-bordo)" }}
          >
            Panel
          </p>
          <h1
            className="mt-2 font-playfair font-bold"
            style={{ fontSize: "2.25rem", color: "var(--color-negro-bordo)" }}
          >
            Campañas
          </h1>
        </div>
        <Link
          href="/admin/campanas/nueva"
          className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Nueva campaña
        </Link>
      </div>

      {loadError && (
        <div
          className="mt-6 rounded-2xl border border-dashed p-6 font-sans text-sm"
          style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
        >
          No se pudieron cargar las campañas. Recargá la página; si persiste,
          revisá la conexión con Supabase.
        </div>
      )}

      {!loadError && noCampaignsAtAll ? (
        /* Estado vacío */
        <div
          className="mt-10 flex flex-col items-center rounded-2xl border border-dashed px-8 py-16 text-center"
          style={{ borderColor: "rgba(201,168,130,0.5)" }}
        >
          <p
            className="font-playfair"
            style={{ fontSize: 22, fontWeight: 600, color: "var(--color-negro-bordo)" }}
          >
            Aún no creaste campañas
          </p>
          <p className="mt-2 font-sans text-sm" style={{ color: "var(--color-gris-bordo)" }}>
            Empezá con tu primera: contá la historia, sumá fotos y publicala cuando esté lista.
          </p>
          <Link
            href="/admin/campanas/nueva"
            className="mt-6 flex items-center gap-2 rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Nueva campaña
          </Link>
        </div>
      ) : (
        !loadError && (
          <>
            {/* Filtros + buscador */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(FILTER_LABELS) as CampaignFilter[]).map((f) => {
                  const isActive = filter === f
                  return (
                    <Link
                      key={f}
                      href={f === "todas" ? "/admin/campanas" : `/admin/campanas?status=${f}`}
                      className="rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-colors"
                      style={
                        isActive
                          ? { background: "var(--color-bordo)", color: "var(--color-hueso)" }
                          : {
                              background: "var(--color-hueso-oscuro)",
                              color: "var(--color-gris-bordo)",
                              border: "1px solid rgba(201,168,130,0.35)",
                            }
                      }
                    >
                      {FILTER_LABELS[f]}
                      <span style={{ opacity: 0.6, marginLeft: 6 }}>{counts[f]}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(74,48,64,0.4)" }}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título o marca…"
                  className="admin-input"
                  style={{ paddingLeft: 34, width: 240 }}
                />
              </div>
            </div>

            {/* Grid de cards */}
            {visible.length === 0 ? (
              <div
                className="mt-6 rounded-2xl border border-dashed p-10 text-center font-sans text-sm"
                style={{ borderColor: "rgba(201,168,130,0.5)", color: "var(--color-gris-bordo)" }}
              >
                {search.trim()
                  ? "Ninguna campaña coincide con la búsqueda."
                  : "No hay campañas con este estado."}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                {visible.map((c) => (
                  <article
                    key={c.id}
                    className="overflow-hidden rounded-2xl border transition-colors hover:border-[var(--color-bordo)]"
                    style={{
                      backgroundColor: "var(--color-hueso-oscuro)",
                      borderColor: "rgba(201,168,130,0.3)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative" style={{ height: 150 }}>
                      <Thumbnail campaign={c} />
                      <div className="absolute left-3 top-3">
                        <StatusBadge status={c.status} />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <p
                        className="font-mono uppercase"
                        style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--color-bordo)" }}
                      >
                        {c.brand}
                      </p>
                      <h2
                        className="mt-1.5 font-playfair font-semibold"
                        style={{ fontSize: 18, color: "var(--color-negro-bordo)", lineHeight: 1.3 }}
                      >
                        {c.title}
                      </h2>
                      <p
                        className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed"
                        style={{ color: "var(--color-gris-bordo)" }}
                      >
                        {hasHtmlTags(c.description) ? htmlToPlainText(c.description) : c.description}
                      </p>
                      <p
                        className="mt-3 font-mono"
                        style={{ fontSize: 11, color: "var(--color-gris-bordo)", opacity: 0.5 }}
                      >
                        {c.date}
                        {c.images && c.images.length > 0 && (
                          <span style={{ marginLeft: 10 }}>
                            {c.images.length} foto{c.images.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Footer */}
                    <div
                      className="flex items-center gap-1 border-t px-3 py-2"
                      style={{ borderColor: "rgba(201,168,130,0.25)" }}
                    >
                      {c.status === "draft" && (
                        <a
                          href={`/campanas/${c.slug}?preview=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs transition-colors hover:bg-[rgba(102,0,31,0.08)]"
                          style={{ color: "var(--color-gris-bordo)" }}
                        >
                          <Eye size={13} />
                          Ver borrador
                        </a>
                      )}
                      <Link
                        href={`/admin/campanas/${c.slug}/editar`}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs transition-colors hover:bg-[rgba(102,0,31,0.08)]"
                        style={{ color: "var(--color-gris-bordo)" }}
                      >
                        <Pencil size={13} />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirm(c)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs transition-colors hover:bg-[rgba(102,0,31,0.08)]"
                        style={{ color: "var(--color-bordo)" }}
                      >
                        <Trash2 size={13} />
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )
      )}

      {/* Modal de confirmación */}
      <ConfirmDialog
        open={!!confirm}
        title={`¿Eliminar «${confirm?.title ?? ""}»? No se puede deshacer.`}
        body={
          (confirm?.images?.length ?? 0) > 0
            ? `Esta acción borra también las ${confirm?.images?.length} foto${
                confirm?.images?.length === 1 ? "" : "s"
              } cargadas.`
            : undefined
        }
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 font-sans text-sm shadow-lg"
          style={{ backgroundColor: "var(--color-negro-bordo)", color: "var(--color-hueso)" }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
