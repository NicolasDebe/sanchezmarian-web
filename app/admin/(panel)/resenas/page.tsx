import { headers } from "next/headers"
import { getAllTestimonials } from "@/lib/testimonials"
import { ResenasManager } from "./resenas-manager"

export const dynamic = "force-dynamic"

/**
 * URL absoluta del formulario público, armada desde el host de la request.
 *
 * Es el link que Marian copia y manda por WhatsApp, así que tiene que ser el
 * dominio por el que entró: sale bien en localhost, en el preview de Vercel y
 * en producción sin depender de ninguna env var. En Vercel el protocolo real
 * viene en x-forwarded-proto (la request interna llega como http).
 */
async function getShareUrl(): Promise<string> {
  try {
    const h = await headers()
    const host = h.get("host")
    if (!host) return "/resenas/nueva"
    const proto =
      h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
    return `${proto}://${host}/resenas/nueva`
  } catch {
    return "/resenas/nueva"
  }
}

/**
 * Panel de moderación de reseñas.
 *
 * Todo el fetch vive acá (server): el manager es client y solo recibe props,
 * así el service role nunca se acerca al browser.
 */
export default async function AdminResenasPage() {
  const [{ rows, ok }, shareUrl] = await Promise.all([
    getAllTestimonials(),
    getShareUrl(),
  ])

  return <ResenasManager resenas={rows} shareUrl={shareUrl} loadError={!ok} />
}
