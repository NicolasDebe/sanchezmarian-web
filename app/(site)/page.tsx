import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Ideas } from "@/components/ideas"
import { Clientes } from "@/components/clientes"
import { HomeServicios } from "@/components/home-servicios"
import { Bio } from "@/components/bio"
import { EnMedias } from "@/components/en-medios"
import { CtaFinal } from "@/components/cta-final"
import { getContentBatch } from "@/lib/content"
import { fallbacksFor } from "@/lib/home-schema"
import { fallbacksFor as serviciosFallbacks } from "@/lib/servicios-schema"
import { buildMetadata, SITE_URL } from "@/lib/seo"
import type { Metadata } from "next"

// Revalidación incremental: combinada con revalidatePath('/') en el save action,
// los cambios del admin se reflejan en el sitio en ~1 minuto.
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("home", SITE_URL)
}

export default async function Home() {
  // Lectura resiliente: getContentBatch nunca tira excepción y ya trae fallbacks,
  // así que el build de Vercel jamás rompe por una falla de Supabase.
  // La vidriera de servicios del home LEE su contenido de page='servicios'
  // (no duplica texto): Mentoría=servicio_02, Prensa=servicio_01, RRPP=servicio_03.
  const [
    hero,
    stats,
    metodo,
    bio,
    ctaFinal,
    serviciosHeader,
    contact,
    svcMentoria,
    svcPrensa,
    svcRrpp,
  ] = await Promise.all([
    getContentBatch("home", "hero", fallbacksFor("hero")),
    getContentBatch("home", "stats", fallbacksFor("stats")),
    getContentBatch("home", "metodo", fallbacksFor("metodo")),
    getContentBatch("home", "bio", fallbacksFor("bio")),
    getContentBatch("home", "cta_final", fallbacksFor("cta_final")),
    getContentBatch("home", "servicios", fallbacksFor("servicios")),
    getContentBatch("home", "contact", fallbacksFor("contact")),
    getContentBatch("servicios", "servicio_02", serviciosFallbacks("servicio_02")),
    getContentBatch("servicios", "servicio_01", serviciosFallbacks("servicio_01")),
    getContentBatch("servicios", "servicio_03", serviciosFallbacks("servicio_03")),
  ])

  return (
    <>
      <Hero content={hero} />
      <Stats content={stats} />
      <Ideas content={metodo} />
      <Clientes />
      <HomeServicios
        section={serviciosHeader}
        mentoria={svcMentoria}
        prensa={svcPrensa}
        rrpp={svcRrpp}
      />
      <Bio content={bio} />
      <EnMedias />
      <CtaFinal content={ctaFinal} contact={contact} />
    </>
  )
}
