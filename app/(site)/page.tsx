import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Ideas } from "@/components/ideas"
import { Clientes } from "@/components/clientes"
import { HomeServicios } from "@/components/home-servicios"
import { NewsletterSection } from "@/components/newsletter-section"
import { Conexiones } from "@/components/conexiones"
import { Bio } from "@/components/bio"
import { CtaFinal } from "@/components/cta-final"
import { getContentBatch, getTextScales } from "@/lib/content"
import { getActiveConnections } from "@/lib/connections"
import { fallbacksFor } from "@/lib/home-schema"
import { fallbacksFor as serviciosFallbacksFor } from "@/lib/servicios-schema"
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
  // La vidriera de servicios del home ESPEJA /servicios: lee los mismos
  // servicio_01…04 de page="servicios" (resumidos), no un copy propio. Solo el
  // texto del botón "ver todos" sigue saliendo de home/servicios (cta_label).
  const [
    hero,
    stats,
    metodo,
    bio,
    ctaFinal,
    serviciosHeader,
    servicio1,
    servicio2,
    servicio3,
    servicio4,
    contact,
    footer,
    connections,
    scales,
    serviciosScales,
  ] = await Promise.all([
    getContentBatch("home", "hero", fallbacksFor("hero")),
    getContentBatch("home", "stats", fallbacksFor("stats")),
    getContentBatch("home", "metodo", fallbacksFor("metodo")),
    getContentBatch("home", "bio", fallbacksFor("bio")),
    getContentBatch("home", "cta_final", fallbacksFor("cta_final")),
    getContentBatch("home", "servicios", fallbacksFor("servicios")),
    getContentBatch("servicios", "servicio_01", serviciosFallbacksFor("servicio_01")),
    getContentBatch("servicios", "servicio_02", serviciosFallbacksFor("servicio_02")),
    getContentBatch("servicios", "servicio_03", serviciosFallbacksFor("servicio_03")),
    getContentBatch("servicios", "servicio_04", serviciosFallbacksFor("servicio_04")),
    getContentBatch("home", "contact", fallbacksFor("contact")),
    // Redes sociales editables desde el CMS (global/footer); única fuente de URLs.
    getContentBatch("global", "footer", globalFallbacksFor("footer")),
    // Conexiones (alianzas): CRUD propio, lectura resiliente con fallback.
    getActiveConnections(),
    // Tamaños de texto por campo (títulos/párrafos resizables).
    getTextScales("home"),
    // La vidriera de servicios espeja /servicios: usa los tamaños de ESA página,
    // así el ajuste que Marian hace en el editor de servicios vale en los dos lados.
    getTextScales("servicios"),
  ])

  const social = {
    instagram: footer.instagram_url,
    linkedin: footer.linkedin_url,
  }

  return (
    <>
      <Hero content={hero} scales={scales} />
      <Stats content={stats} scales={scales} />
      <Ideas content={metodo} scales={scales} />
      <Clientes />
      {/* Newsletter + canal de WhatsApp: montado tras el social proof (logos de
          clientes) para máxima motivación y visibilidad a media página. Reutiliza
          el bloque compartido (mismo copy editable en global/newsletter). */}
      <NewsletterSection />
      <HomeServicios
        servicios={{
          servicio_01: servicio1,
          servicio_02: servicio2,
          servicio_03: servicio3,
          servicio_04: servicio4,
        }}
        ctaLabel={serviciosHeader.cta_label}
        ctaScale={scales["servicios.cta_label"]}
        scales={serviciosScales}
      />
      <Conexiones connections={connections} />
      <Bio content={bio} social={social} scales={scales} />
      <CtaFinal content={ctaFinal} contact={contact} social={social} scales={scales} />
    </>
  )
}
