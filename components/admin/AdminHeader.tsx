"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClientSide } from "@/lib/supabase-browser"

export function AdminHeader() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClientSide()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <header
      style={{
        background:     "var(--color-bordo)",
        padding:        "0 clamp(20px, 5vw, 48px)",
        height:         60,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        position:       "sticky",
        top:            0,
        zIndex:         50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/admin/dashboard" style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/images/logo-marian-negativo.png"
            alt="Marian"
            width={80}
            height={28}
            style={{ objectFit: "contain" }}
          />
        </Link>
        <span
          className="font-mono"
          style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(254,252,239,0.4)" }}
        >
          Admin
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/"
          target="_blank"
          className="font-sans"
          style={{ fontSize: 13, color: "rgba(254,252,239,0.55)", textDecoration: "none" }}
        >
          Ver sitio →
        </Link>
        <button
          onClick={handleLogout}
          className="font-sans"
          style={{
            fontSize:     13,
            color:        "var(--color-hueso)",
            background:   "rgba(254,252,239,0.1)",
            border:       "1px solid rgba(254,252,239,0.18)",
            borderRadius: 6,
            padding:      "6px 14px",
            cursor:       "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
