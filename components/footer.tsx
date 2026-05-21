import Link from "next/link"

const NAV_LINKS = [
  { label: "Servicios", href: "/servicios" },
  { label: "Sobre mí", href: "/sobre-marian" },
  { label: "Casos de éxito", href: "/casos-de-exito" },
  { label: "Sala de Prensa", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
]

function IconLinkedin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

// TODO: Marian debe confirmar URLs reales de Instagram y LinkedIn
const SOCIAL = [
  { label: "LinkedIn", href: "https://linkedin.com/in/PENDIENTE", Icon: IconLinkedin },
  { label: "Instagram", href: "https://instagram.com/PENDIENTE", Icon: IconInstagram },
]

export function Footer() {
  return (
    <footer className="bg-bordo-oscuro pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Dorado top divider */}
        <div className="w-full h-px bg-dorado/25 mb-12" />

        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-10 pb-10 border-b border-hueso/6">

          {/* Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="font-playfair text-2xl font-bold italic text-hueso hover:text-dorado transition-colors w-fit"
            >
              Marian.
            </Link>
            <p className="font-sans text-xs text-hueso/30 leading-relaxed max-w-[200px]">
              Estratega de comunicación · Mendoza, Argentina.
            </p>
            <a
              href="mailto:sanchezmariana15@gmail.com"
              className="font-mono text-[10px] text-hueso/35 hover:text-hueso/70 transition-colors tracking-wide"
            >
              sanchezmariana15@gmail.com
            </a>
          </div>

          {/* Nav links */}
          <nav aria-label="Links de navegación">
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-hueso/35 hover:text-hueso/70 transition-colors"
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
                  className="w-9 h-9 rounded-full border border-hueso/12 flex items-center justify-center text-hueso/35 hover:border-dorado/40 hover:text-dorado transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-hueso/6 border border-hueso/12 text-hueso/50 px-5 py-2.5 rounded-full font-sans text-xs font-medium hover:bg-hueso hover:text-bordo hover:border-hueso transition-all"
            >
              Conversemos
            </Link>
          </div>

        </div>

        {/* Bottom row */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-hueso/20 tracking-wide flex items-center gap-2 flex-wrap">
            © {new Date().getFullYear()} Mariana Sánchez
            <span className="text-hueso/10">·</span>
            <Link href="/privacidad" className="hover:text-hueso/40 transition-colors">
              Privacidad
            </Link>
            <span className="text-hueso/10">·</span>
            <Link href="/terminos" className="hover:text-hueso/40 transition-colors">
              Términos
            </Link>
          </p>
          <p className="font-mono text-[10px] text-hueso/15 tracking-wide">
            Diseñado con intención.
          </p>
        </div>

      </div>
    </footer>
  )
}
