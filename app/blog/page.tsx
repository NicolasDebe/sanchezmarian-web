import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { BlogGrid } from "./blog-grid"

export const metadata: Metadata = {
  title: "Sala de Prensa — Marian Sánchez",
  description:
    "Comunicados, columnas de opinión y análisis sobre comunicación estratégica y prensa en Mendoza.",
  openGraph: {
    title: "Sala de Prensa — Marian Sánchez",
    description:
      "Comunicados, columnas de opinión y análisis sobre comunicación estratégica y prensa en Mendoza.",
    url: "https://sanchezmarian.com/blog",
  },
}

export default function BlogPage() {
  return (
    <main>
      <Nav />

      <PageHero
        eyebrow="Sala de Prensa"
        title="Sala de"
        titleAccent="Prensa."
        subtitle="Comunicados, columnas de opinión y análisis sobre comunicación estratégica y prensa en Mendoza."
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
