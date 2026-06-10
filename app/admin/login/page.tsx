import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-hueso)" }}
    >
      <div
        className="w-full rounded-2xl border p-8 sm:p-10"
        style={{
          maxWidth: 420,
          backgroundColor: "var(--color-hueso-oscuro)",
          borderColor: "rgba(201,168,130,0.3)",
          boxShadow: "0 12px 48px rgba(102,0,31,0.08)",
        }}
      >
        <div className="mb-8 text-center">
          <p
            className="font-playfair text-3xl font-bold"
            style={{ color: "var(--color-bordo)" }}
          >
            Marian<span style={{ color: "var(--color-dorado)" }}>.</span>
          </p>
          <p
            className="mt-2 font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--color-gris-bordo)" }}
          >
            Panel de administración
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
