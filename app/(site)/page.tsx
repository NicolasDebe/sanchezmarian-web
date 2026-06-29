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
import { globalFallbacksFor } from "@/lib/global-schema"
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
  // La vidriera de servicios del home (jerarquía 1+3) lee su contenido de
  // home/servicios; los textos completos por servicio viven en /servicios.
  const [
    hero,
    stats,
    metodo,
    bio,
    ctaFinal,
    serviciosHeader,
    contact,
    footer,
  ] = await Promise.all([
    getContentBatch("home", "hero", fallbacksFor("hero")),
    getContentBatch("home", "stats", fallbacksFor("stats")),
    getContentBatch("home", "metodo", fallbacksFor("metodo")),
    getContentBatch("home", "bio", fallbacksFor("bio")),
    getContentBatch("home", "cta_final", fallbacksFor("cta_final")),
    getContentBatch("home", "servicios", fallbacksFor("servicios")),
    getContentBatch("home", "contact", fallbacksFor("contact")),
    // Redes sociales editables desde el CMS (global/footer); única fuente de URLs.
    getContentBatch("global", "footer", globalFallbacksFor("footer")),
  ])

  const social = {
    instagram: footer.instagram_url,
    linkedin: footer.linkedin_url,
  }

  return (
    <>
      <Hero content={hero} />
      <Stats content={stats} />
      <Ideas content={metodo} />
      <Clientes />
      <HomeServicios section={serviciosHeader} />
      <Bio content={bio} social={social} />
      <EnMedias />
      <CtaFinal content={ctaFinal} contact={contact} social={social} />
    </>
  )
}
