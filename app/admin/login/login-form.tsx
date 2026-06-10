"use client"

import { useActionState } from "react"
import { signIn, type AuthState } from "@/app/admin/actions"

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signIn,
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="font-mono uppercase"
          style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--color-gris-bordo)" }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="tu@email.com"
          className="admin-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="font-mono uppercase"
          style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--color-gris-bordo)" }}
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="admin-input"
        />
      </div>

      {state?.error && (
        <p
          className="rounded-lg px-3 py-2 font-sans text-sm"
          style={{
            backgroundColor: "rgba(102,0,31,0.08)",
            color: "var(--color-bordo)",
          }}
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg px-6 py-3 font-sans text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{ backgroundColor: "var(--color-bordo)", color: "var(--color-hueso)" }}
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  )
}
