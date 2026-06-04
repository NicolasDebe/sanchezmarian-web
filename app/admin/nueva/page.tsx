import Link from "next/link"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { CampaignForm } from "@/components/admin/CampaignForm"

export default function NuevaPage() {
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
          <h1
            className="font-playfair"
            style={{ fontSize: 28, fontWeight: 700, color: "var(--color-negro-bordo)", marginTop: 12 }}
          >
            Nueva campaña
          </h1>
          <p className="font-sans" style={{ fontSize: 14, color: "var(--color-gris-bordo)", marginTop: 4 }}>
            Completá los campos. Podés subir fotos antes o después de crear.
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
          <CampaignForm />
        </div>

      </main>
    </>
  )
}
