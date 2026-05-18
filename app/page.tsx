import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { Ideas } from "@/components/ideas"
import { MarqueeBand } from "@/components/marquee-band"
import { Servicios } from "@/components/servicios"
import { Bio } from "@/components/bio"
import { Clientes } from "@/components/clientes"
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
      <MarqueeBand />
      <Servicios />
      <Bio />
      <Clientes />
      <EnMedias />
      <CtaFinal />
      <Footer />
    </main>
  )
}
