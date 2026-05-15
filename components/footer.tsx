import Link from "next/link"

const NAV_LINKS = [
  { label: "Servicios", href: "/servicios" },
  { label: "Sobre mí", href: "/sobre-marian" },
  { label: "En medios", href: "/en-medios" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
]

function IconLinkedin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

const SOCIAL = [
  { label: "LinkedIn", href: "https://linkedin.com", Icon: IconLinkedin },
  { label: "Instagram", href: "https://instagram.com", Icon: IconInstagram },
]

export function Footer() {
  return (
    <footer className="bg-marino-osc pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-10 pb-12 border-b border-white/8">

          {/* Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="font-playfair text-2xl font-bold italic text-white hover:text-terracota transition-colors w-fit"
            >
              Marian.
            </Link>
            <p className="font-sans text-xs text-white/35 leading-relaxed max-w-[220px]">
              Consultora de comunicación estratégica.
              <br />Mendoza, Argentina.
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Links de navegación">
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/45 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social + CTA */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-3">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/45 hover:border-terracota/50 hover:text-terracota transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-terracota/15 border border-terracota/30 text-terracota px-5 py-2.5 rounded-full font-sans text-xs font-medium hover:bg-terracota hover:text-white hover:border-terracota transition-all"
            >
              Consulta gratis
            </Link>
          </div>

        </div>

        {/* Bottom row */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-white/25 tracking-wide">
            © {new Date().getFullYear()} Mariana Sánchez. Todos los derechos reservados.
          </p>
          <p className="font-mono text-[10px] text-white/20 tracking-wide">
            Diseñado y desarrollado con intención.
          </p>
        </div>

      </div>
    </footer>
  )
}
