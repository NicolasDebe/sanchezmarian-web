/**
 * GET /api/buscar — índice completo del buscador global, como JSON.
 *
 * Sin parámetros a propósito: el filtrado lo hace el browser
 * (lib/search-match.ts) sobre este índice, que se baja UNA sola vez la primera
 * vez que alguien abre el panel. Así escribir en el buscador no genera una
 * request por tecla, y el índice no viaja en el HTML de todas las páginas.
 *
 * Next 16: los Route Handlers NO se cachean por defecto; `force-static` +
 * `revalidate` es lo que los vuelve estáticos con ISR (cacheComponents está
 * desactivado en este proyecto, así que aplica el modelo clásico).
 */

import { buildSearchIndex } from "@/lib/search"

export const dynamic = "force-static"
export const revalidate = 300

export async function GET() {
  // buildSearchIndex nunca tira: cada fuente cae a [] por separado.
  const docs = await buildSearchIndex()

  return Response.json(
    { docs },
    {
      headers: {
        // Contenido público que cambia poco: que lo sirva el edge y que el
        // browser pueda reusar la copia vieja mientras revalida.
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    },
  )
}
