import type { Metadata } from "next"
import Link from "next/link"
import { after } from "next/server"
import { Check, Clock, TriangleAlert } from "lucide-react"
import { verifyTestimonial } from "@/lib/testimonials"
import { sendModerationNotice } from "@/lib/testimonials-email"
import { SITE_EMAIL } from "@/lib/constants"

/**
 * /resenas/verificar/[token] — el destino del link del mail de confirmación.
 *
 * Server component. Llama a verifyTestimonial (que pasa la reseña a
 * `pending_review`) y muestra uno de tres estados. NO hay revalidatePath: en
 * este paso no se publica nada, así que no hay página pública que refrescar.
 *
 * El aviso de moderación al equipo se manda con `after()`, o sea DESPUÉS de
 * responder: si Resend tarda o falla, la persona ya vio su pantalla.
 */

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Confirmación de reseña — Marian Sánchez",
  // Es una URL con un token de un solo uso: no tiene por qué estar en Google.
  robots: { index: false, follow: false },
}

type Screen = {
  icon: "ok" | "expired" | "invalid"
  title: string
  body: React.ReactNode
}

const ICONS = {
  ok: { Cmp: Check, bg: "bg-bordo", fg: "text-hueso" },
  expired: { Cmp: Clock, bg: "bg-dorado", fg: "text-negro-bordo" },
  invalid: { Cmp: TriangleAlert, bg: "bg-gris-bordo/15", fg: "text-gris-bordo" },
} as const

function screenFor(status: string): Screen {
  switch (status) {
    case "ok":
      return {
        icon: "ok",
        title: "Listo, tu reseña quedó confirmada.",
        body: (
          <>
            Antes de publicarse pasa por una revisión. Te va a llegar un aviso
            cuando esté en la web.
          </>
        ),
      }

    case "expired":
      return {
        icon: "expired",
        title: "El link venció.",
        body: (
          <>
            Los links de confirmación duran 7 días. Escribinos a{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="text-bordo underline underline-offset-2"
            >
              {SITE_EMAIL}
            </a>{" "}
            y lo resolvemos, o cargá la reseña de nuevo.
          </>
        ),
      }

    // already_verified, not_found y error caen todos acá: desde afuera no hay
    // diferencia útil entre "ya lo usaste" y "ese token no existe", y decir cuál
    // es le confirmaría a alguien que está probando tokens que acertó uno.
    default:
      return {
        icon: "invalid",
        title: "Este link ya no sirve.",
        body: (
          <>
            Puede que ya lo hayas usado o que esté incompleto. Si copiaste el
            link a mano, revisá que no le falte nada. Si ya lo confirmaste, está
            todo bien: la reseña sigue su curso. Cualquier duda, escribinos a{" "}
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="text-bordo underline underline-offset-2"
            >
              {SITE_EMAIL}
            </a>
            .
          </>
        ),
      }
  }
}

export default async function VerificarPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await verifyTestimonial(token)

  // Solo en la transición real (no cuando el link se reusa) y sin bloquear la
  // respuesta. Si el aviso falla, sendModerationNotice loguea y no tira.
  if (result.status === "ok") {
    const testimonial = result.testimonial
    after(() => sendModerationNotice(testimonial))
  }

  const screen = screenFor(result.status)
  const { Cmp, bg, fg } = ICONS[screen.icon]

  return (
    <div className="flex min-h-screen items-center justify-center bg-hueso px-5 py-16">
      <main className="w-full max-w-[520px] text-center">
        <span
          className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full ${bg}`}
        >
          <Cmp size={26} strokeWidth={2.2} className={fg} aria-hidden="true" />
        </span>

        <h1
          className="font-playfair text-negro-bordo"
          style={{ fontSize: "var(--fs-h2)", lineHeight: 1.2 }}
        >
          {screen.title}
        </h1>

        <p
          className="mx-auto mt-4 max-w-[42ch] font-sans leading-relaxed text-gris-bordo"
          style={{ fontSize: "var(--fs-body-lg)" }}
        >
          {screen.body}
        </p>

        <Link
          href="/resenas"
          className="mt-9 inline-flex items-center justify-center rounded-full bg-bordo px-7 py-3.5 font-sans font-semibold text-hueso transition-colors hover:bg-bordo-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo"
          style={{ fontSize: "var(--fs-body)" }}
        >
          Ver las reseñas
        </Link>
      </main>
    </div>
  )
}
