import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Ideas } from "@/components/ideas"
import { Clientes } from "@/components/clientes"
import { HomeServicios } from "@/components/home-servicios"
import { Bio } from "@/components/bio"
import { EnMedias } from "@/components/en-medios"
import { CtaFinal } from "@/components/cta-final"
import { Footer } from "@/components/footer"
import { getContentBatch } from "@/lib/content"
import { fallbacksFor } from "@/lib/home-schema"
import { getGlobalContent } from "@/lib/global-content"
import { buildMetadata } from "@/lib/seo"
import type { Metadata } from "next"

// Revalidación incremental: combinada con revalidatePath('/') en el save action,
// los cambios del admin se reflejan en el sitio en ~1 minuto.
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("home", "https://sanchezmarian.com")
}

export default async function Home() {
  // Lectura resiliente: getContentBatch nunca tira excepción y ya trae fallbacks,
  // así que el build de Vercel jamás rompe por una falla de Supabase.
  const [global, hero, stats, metodo, bio, ctaFinal] = await Promise.all([
    getGlobalContent(),
    getContentBatch("home", "hero", fallbacksFor("hero")),
    getContentBatch("home", "stats", fallbacksFor("stats")),
    getContentBatch("home", "metodo", fallbacksFor("metodo")),
    getContentBatch("home", "bio", fallbacksFor("bio")),
    getContentBatch("home", "cta_final", fallbacksFor("cta_final")),
  ])

  return (
    <main>
      <Nav content={global.nav} />
      <Hero content={hero} />
      <Stats content={stats} />
      <Ideas content={metodo} />
      <Clientes />
      <HomeServicios />
      <Bio content={bio} />
      <EnMedias />
      <CtaFinal content={ctaFinal} />
      <Footer content={global.footer} nav={global.nav} />
    </main>
  )
}
