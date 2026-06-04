import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { CampaignForm } from "@/components/admin/CampaignForm"
import { getCampaignById } from "@/lib/campaigns"

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function EditarPage({ params }: PageProps) {
  const { id } = await params
  const campaign = await getCampaignById(id)

  if (!campaign) notFound()

  return (
    <>
      <AdminHeader />
      <main style={{ padding: "40px clamp(20px, 5vw, 48px)", maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ marginBottom: 32 }}>
          <Link
            href="/admin/dashboard"
            className="font-mono"
            style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-bordo)", textDecoration: "none" }}
          >
            ← Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <h1 className="font-playfair" style={{ fontSize: 28, fontWeight: 700, color: "var(--color-negro-bordo)" }}>
              {campaign.brand}
            </h1>
            <span
              className="font-mono uppercase"
              style={{
                fontSize:      10,
                letterSpacing: "0.1em",
                borderRadius:  100,
                padding:       "3px 12px",
                background:    campaign.status === "ACTIVA" ? "var(--color-bordo)" : "var(--color-arena)",
                color:         campaign.status === "ACTIVA" ? "var(--color-hueso)" : "var(--color-gris-bordo)",
              }}
            >
              {campaign.status}
            </span>
          </div>
          <p className="font-sans" style={{ fontSize: 14, color: "var(--color-gris-bordo)", marginTop: 4 }}>
            {campaign.images?.length ?? 0} foto{(campaign.images?.length ?? 0) !== 1 ? "s" : ""} · slug: {campaign.slug}
          </p>
        </div>

        <div
          style={{
            background:   "#fff",
            borderRadius: 12,
            border:       "1px solid rgba(102,0,31,0.08)",
            padding:      "32px clamp(20px, 4vw, 40px)",
          }}
        >
          <CampaignForm campaign={campaign} />
        </div>

      </main>
    </>
  )
}
