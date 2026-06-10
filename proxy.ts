import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Proxy (en Next 16 el "middleware" se llama Proxy).
 *
 * Protege todas las rutas /admin/* excepto /admin/login.
 * - Lee la sesión con createServerClient de @supabase/ssr.
 * - Si no hay usuario autenticado → redirect a /admin/login.
 * - Si algo falla por cualquier razón → redirect a /admin/login (nunca crashea).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // El login es público.
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  const loginUrl = new URL("/admin/login", request.url)

  try {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(loginUrl)
    }

    return response
  } catch {
    // Ante cualquier error, mejor mandar al login que crashear.
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ["/admin/:path*"],
}
