import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { BlogGrid } from "./blog-grid"

export const metadata: Metadata = {
  title: "Novedades — Marian Sánchez",
  description:
    "Artículos sobre comunicación estratégica, prensa y marca personal. Herramientas prácticas para marcas y profesionales.",
  openGraph: {
    title: "Novedades — Marian Sánchez",
    description:
      "Artículos sobre comunicación estratégica, prensa y marca personal.",
    url: "https://sanchezmarian.com/blog",
  },
}

export default function BlogPage() {
  return (
    <main>
      <Nav />

      <PageHero
        eyebrow="Novedades"
        title="Comunicación"
        titleAccent="sin vueltas."
        subtitle="Artículos prácticos sobre prensa, comunicación estratégica y todo lo que necesitás saber para comunicar mejor tu marca o proyecto."
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <BlogGrid />
        </div>
      </section>

      <Footer />
    </main>
  )
}
