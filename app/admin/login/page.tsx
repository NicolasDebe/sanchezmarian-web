"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClientSide } from "@/lib/supabase-browser"

const inputStyle: React.CSSProperties = {
  width:         "100%",
  padding:       "10px 14px",
  border:        "1.5px solid rgba(102,0,31,0.18)",
  borderRadius:  8,
  fontSize:      14,
  background:    "#fff",
  color:         "var(--color-negro-bordo)",
  outline:       "none",
  boxSizing:     "border-box",
  fontFamily:    "var(--font-dm-sans), sans-serif",
}

export default function LoginPage() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClientSide()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError("Credenciales incorrectas. Verificá tu email y contraseña.")
      setLoading(false)
    } else {
      router.push("/admin/dashboard")
      router.refresh()
    }
  }

  return (
    <div
      style={{
        minHeight:      "100vh",
        background:     "var(--color-bordo)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>

        {/* Logo */}
        <Image
          src="/images/logo-marian-negativo.png"
          alt="Marian Sánchez"
          width={140}
          height={48}
          style={{ objectFit: "contain" }}
          priority
        />

        {/* Card */}
        <div style={{ width: "100%", background: "var(--color-hueso)", borderRadius: 16, padding: "40px 36px" }}>
          <h1
            className="font-playfair"
            style={{ fontSize: 22, fontWeight: 600, color: "var(--color-negro-bordo)", marginBottom: 6 }}
          >
            Panel de administración
          </h1>
          <p
            className="font-sans"
            style={{ fontSize: 14, color: "var(--color-gris-bordo)", marginBottom: 28 }}
          >
            Ingresá con tu cuenta de Marian.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div>
              <label
                className="font-mono"
                style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-bordo)", display: "block", marginBottom: 6 }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="hola@sanchezmarian.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="font-mono"
                style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-bordo)", display: "block", marginBottom: 6 }}
              >
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(102,0,31,0.08)", borderRadius: 8, border: "1px solid rgba(102,0,31,0.2)" }}>
                <p className="font-sans" style={{ fontSize: 13, color: "var(--color-bordo)" }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-sans"
              style={{
                width:        "100%",
                padding:      "12px",
                background:   loading ? "rgba(102,0,31,0.5)" : "var(--color-bordo)",
                color:        "var(--color-hueso)",
                border:       "none",
                borderRadius: 8,
                fontSize:     14,
                fontWeight:   600,
                cursor:       loading ? "not-allowed" : "pointer",
                marginTop:    4,
              }}
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>

          </form>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="font-sans"
          style={{ fontSize: 13, color: "rgba(254,252,239,0.5)", textDecoration: "none" }}
        >
          ← Volver al sitio
        </Link>

      </div>
    </div>
  )
}
