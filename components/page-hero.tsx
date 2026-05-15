import { TextureOverlay } from "@/components/ui/texture-overlay"

interface PageHeroProps {
  eyebrow: string
  title: string
  titleAccent?: string
  subtitle?: string
}

export function PageHero({ eyebrow, title, titleAccent, subtitle }: PageHeroProps) {
  return (
    <section className="relative pt-20 bg-arena overflow-hidden">
      <TextureOverlay texture="paperGrain" opacity={0.3} />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota mb-5">
          {eyebrow}
        </p>
        <h1 className="font-playfair font-bold text-marino leading-[1.1] text-[2.75rem] sm:text-[3.75rem] lg:text-[5rem] max-w-3xl">
          <span className="block">{title}</span>
          {titleAccent && (
            <em className="block italic text-terracota">{titleAccent}</em>
          )}
        </h1>
        {subtitle && (
          <p className="mt-6 font-sans text-gris-tx text-base sm:text-lg leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
