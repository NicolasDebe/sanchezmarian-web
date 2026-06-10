import { createBrowserClient } from "@supabase/ssr"

/**
 * Cliente Supabase para el browser (Client Components del admin).
 * Usa las legacy keys (eyJhbGci...) vía las env NEXT_PUBLIC_*.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
