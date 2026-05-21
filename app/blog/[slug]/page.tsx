import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { ARTICLES, CATEGORY_COLORS } from "../data"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES.find((a) => a.slug === slug)
  if (!article) return {}
  return {
    title: `${article.title} — Marian Sánchez`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://sanchezmarian.com/blog/${article.slug}`,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = ARTICLES.find((a) => a.slug === slug)
  if (!article) notFound()

  return (
    <main>
      <Nav />

      {/* Eyebrow band */}
      <div className="bg-arena pt-24 pb-12">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-terracota hover:text-marino transition-colors mb-8"
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Sala de Prensa
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${
                CATEGORY_COLORS[article.category] ?? "bg-lino text-marino"
              }`}
            >
              {article.category}
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-gris-tx/50">
              <Clock size={11} strokeWidth={1.5} />
              {article.readTime}
            </span>
            <span className="font-mono text-[10px] text-gris-tx/40">{article.date}</span>
          </div>

          <h1 className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.5rem] lg:text-[3rem] leading-[1.15] mb-6">
            {article.title}
          </h1>

          <p className="font-playfair italic text-gris-tx text-xl leading-relaxed border-l-[3px] border-terracota pl-5">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Cuerpo del artículo */}
      <article className="bg-white py-16 lg:py-20">
        <div className="max-w-[800px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            {article.body.map((paragraph, i) => (
              <p
                key={i}
                className="font-sans text-[16px] text-gris-tx leading-[1.7]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Firma */}
          <div className="mt-14 pt-8 border-t border-marino/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-bordo/10 flex items-center justify-center shrink-0">
              <span className="font-playfair font-bold italic text-bordo text-sm">M</span>
            </div>
            <div>
              <p className="font-sans font-semibold text-marino text-sm">Marian Sánchez</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gris-tx/50">
                Estratega de comunicación · Mendoza
              </p>
            </div>
          </div>

          {/* Volver */}
          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-sans text-sm font-medium text-terracota hover:text-marino transition-colors group"
            >
              <ArrowLeft
                size={14}
                strokeWidth={2}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Ver todos los artículos
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
