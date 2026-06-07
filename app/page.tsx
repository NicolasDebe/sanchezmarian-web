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

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Stats />
      <Ideas />
      <Clientes />
      <HomeServicios />
      <Bio />
      <EnMedias />
      <CtaFinal />
      <Footer />
    </main>
  )
}
