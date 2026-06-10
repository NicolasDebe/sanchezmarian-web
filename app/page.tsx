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

// Revalidación incremental: combinada con revalidatePath('/') en el save action,
// los cambios del admin se reflejan en el sitio en ~1 minuto.
export const revalidate = 60

export default async function Home() {
  // Lectura resiliente: getContentBatch nunca tira excepción y ya trae fallbacks,
  // así que el build de Vercel jamás rompe por una falla de Supabase.
  const [hero, stats, metodo, bio, ctaFinal] = await Promise.all([
    getContentBatch("home", "hero", fallbacksFor("hero")),
    getContentBatch("home", "stats", fallbacksFor("stats")),
    getContentBatch("home", "metodo", fallbacksFor("metodo")),
    getContentBatch("home", "bio", fallbacksFor("bio")),
    getContentBatch("home", "cta_final", fallbacksFor("cta_final")),
  ])

  return (
    <main>
      <Nav />
      <Hero content={hero} />
      <Stats content={stats} />
      <Ideas content={metodo} />
      <Clientes />
      <HomeServicios />
      <Bio content={bio} />
      <EnMedias />
      <CtaFinal content={ctaFinal} />
      <Footer />
    </main>
  )
}
