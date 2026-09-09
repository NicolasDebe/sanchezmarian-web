import type { Metadata } from "next"
import { ResenaNuevaContent } from "@/components/resena-nueva-content"
import { SITE_URL, absoluteUrl } from "@/lib/seo"

/**
 * /resenas/nueva — formulario público de carga de reseñas.
 *
 * Vive FUERA del grupo (site) a propósito: es una página autónoma, pensada para
 * compartirse por WhatsApp, sin la navegación ni el footer del sitio.
 */

const TITLE = "Dejá tu reseña — Marian Sánchez"
const DESCRIPTION =
  "Contá cómo fue trabajar con Marian. Tu reseña se publica firmada y sin editar, después de una revisión del equipo."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/resenas/nueva` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/resenas/nueva`,
    title: TITLE,
    description: DESCRIPTION,
    locale: "es_AR",
    images: [{ url: absoluteUrl("/og/default.jpg"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [absoluteUrl("/og/default.jpg")],
  },
}

export default function ResenaNuevaPage() {
  return <ResenaNuevaContent />
}
