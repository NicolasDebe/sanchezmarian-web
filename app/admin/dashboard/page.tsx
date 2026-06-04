import Link from "next/link"
import { getAllCampaigns } from "@/lib/campaigns"
import { AdminHeader } from "@/components/admin/AdminHeader"
import type { Campaign } from "@/lib/types/campaign"

export const dynamic = "force-dynamic"

function StatusBadge({ status }: { status: Campaign["status"] }) {
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize:      10,
        letterSpacing: "0.1em",
        borderRadius:  100,
        padding:       "3px 12px",
        display:       "inline-block",
        background:    status === "ACTIVA" ? "var(--color-bordo)" : "var(--color-arena)",
        color:         status === "ACTIVA" ? "var(--color-hueso)" : "var(--color-gris-bordo)",
      }}
    >
      {status}
    </span>
  )
}

export default async function DashboardPage() {
  const campaigns = await getAllCampaigns()

  return (
    <>
      <AdminHeader />
      <main style={{ padding: "40px clamp(20px, 5vw, 48px)", maxWidth: 1200, margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 className="font-playfair" style={{ fontSize: 28, fontWeight: 700, color: "var(--color-negro-bordo)", lineHeight: 1.2 }}>
              Campañas
            </h1>
            <p className="font-sans" style={{ fontSize: 14, color: "var(--color-gris-bordo)", marginTop: 4 }}>
              {campaigns.length === 0
                ? "No hay campañas todavía."
                : `${campaigns.length} campaña${campaigns.length > 1 ? "s" : ""} registrada${campaigns.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/admin/nueva"
            className="font-sans"
            style={{
              background:     "var(--color-bordo)",
              color:          "var(--color-hueso)",
              padding:        "10px 24px",
              borderRadius:   8,
              fontSize:       14,
              fontWeight:     600,
              textDecoration: "none",
              flexShrink:     0,
            }}
          >
            + Nueva campaña
          </Link>
        </div>

        {/* Contenido */}
        {campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <CampaignTable campaigns={campaigns} />
        )}

      </main>
    </>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign:    "center",
        padding:      "80px 24px",
        background:   "#fff",
        borderRadius: 12,
        border:       "1px solid rgba(102,0,31,0.08)",
      }}
    >
      <p className="font-playfair" style={{ fontSize: 20, color: "var(--color-negro-bordo)", marginBottom: 8 }}>
        No hay campañas todavía.
      </p>
      <p className="font-sans" style={{ fontSize: 14, color: "var(--color-gris-bordo)", marginBottom: 28 }}>
        Creá la primera campaña para empezar.
      </p>
      <Link
        href="/admin/nueva"
        className="font-sans"
        style={{
          background:     "var(--color-bordo)",
          color:          "var(--color-hueso)",
          padding:        "10px 28px",
          borderRadius:   8,
          fontSize:       14,
          fontWeight:     600,
          textDecoration: "none",
        }}
      >
        + Nueva campaña
      </Link>
    </div>
  )
}

function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div
      style={{
        background:   "#fff",
        borderRadius: 12,
        border:       "1px solid rgba(102,0,31,0.08)",
        overflow:     "hidden",
      }}
    >
      {/* Header */}
      <div
        className="font-mono"
        style={{
          display:             "grid",
          gridTemplateColumns: "180px 1fr 130px 120px 170px",
          padding:             "10px 24px",
          background:          "rgba(102,0,31,0.03)",
          fontSize:            10,
          letterSpacing:       "0.12em",
          textTransform:       "uppercase",
          color:               "var(--color-gris-bordo)",
          borderBottom:        "1px solid rgba(102,0,31,0.08)",
          gap:                 8,
        }}
      >
        <span>Marca</span>
        <span>Título</span>
        <span>Estado</span>
        <span>Fecha</span>
        <span>Acciones</span>
      </div>

      {/* Filas */}
      {campaigns.map((c, i) => (
        <div
          key={c.id}
          style={{
            display:             "grid",
            gridTemplateColumns: "180px 1fr 130px 120px 170px",
            padding:             "14px 24px",
            alignItems:          "center",
            gap:                 8,
            borderBottom:        i < campaigns.length - 1 ? "1px solid rgba(102,0,31,0.06)" : "none",
          }}
        >
          <p
            className="font-mono"
            style={{ fontSize: 11, color: "var(--color-bordo)", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {c.brand}
          </p>
          <p
            className="font-sans"
            style={{ fontSize: 13, color: "var(--color-negro-bordo)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}
          >
            {c.title}
          </p>
          <span><StatusBadge status={c.status} /></span>
          <p className="font-mono" style={{ fontSize: 11, color: "var(--color-gris-bordo)" }}>
            {c.date}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={`/admin/${c.id}/editar`}
              className="font-sans"
              style={{
                fontSize:       12,
                fontWeight:     500,
                color:          "var(--color-bordo)",
                background:     "rgba(102,0,31,0.07)",
                padding:        "5px 14px",
                borderRadius:   6,
                textDecoration: "none",
              }}
            >
              Editar
            </Link>
            <Link
              href={`/campanas#campana-${c.slug}`}
              target="_blank"
              className="font-sans"
              style={{
                fontSize:       12,
                color:          "var(--color-gris-bordo)",
                padding:        "5px 14px",
                borderRadius:   6,
                textDecoration: "none",
                border:         "1px solid rgba(102,0,31,0.15)",
              }}
            >
              Ver →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
