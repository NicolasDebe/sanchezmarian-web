import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Cliente Supabase para el servidor (Server Components, Server Actions y
 * páginas del admin). Lee/escribe la sesión vía cookies de next/headers.
 *
 * En Next 16 cookies() es async. El setAll va envuelto en try/catch porque
 * cuando se llama desde un Server Component (no una Server Action ni Route
 * Handler) no se pueden escribir cookies — en ese caso lo ignoramos y dejamos
 * que el proxy/middleware refresque la sesión.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Llamado desde un Server Component: se ignora de forma segura.
          }
        },
      },
    },
  )
}
