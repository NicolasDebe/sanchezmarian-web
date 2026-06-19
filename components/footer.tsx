import Link from "next/link"
import { globalFallbacksFor } from "@/lib/global-schema"

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

export function Footer({
  content,
  nav,
}: {
  content?: Record<string, string>
  nav?: Record<string, string>
}) {
  const c = { ...globalFallbacksFor("footer"), ...content }
  const n = { ...globalFallbacksFor("nav"), ...nav }

  const NAV_LINKS = [
    { label: n.link_servicios, href: "/servicios" },
    { label: n.link_valores, href: "/mis-valores" },
    { label: n.link_casos, href: "/casos-de-exito" },
    { label: n.link_campanas, href: "/campanas" },
  ]
  const SOCIAL = [
    { label: "LinkedIn", href: c.linkedin_url, Icon: IconLinkedin },
    { label: "Instagram", href: c.instagram_url, Icon: IconInstagram },
  ]

  return (
    <footer
      className="pt-14 pb-8"
      style={{
        background: "radial-gradient(ellipse at 70% 80%, rgba(102,0,31,0.25) 0%, transparent 60%), var(--color-bordo-oscuro)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Dorado top divider */}
        <div className="w-full h-px bg-dorado/25 mb-12" />

        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-10 pb-10 border-b border-hueso/6">

          {/* Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity w-fit">
              <span className="font-playfair italic text-[1.5rem] leading-none" style={{ color: "var(--color-hueso)" }}>
                Marian Sánchez
              </span>
            </Link>
            <p className="font-sans text-xs text-hueso/45 leading-relaxed max-w-[200px]">
              {c.tagline}
            </p>
            <a
              href={`mailto:${c.email}`}
              className="font-mono text-[11px] text-hueso/55 hover:text-hueso/80 transition-colors tracking-wide"
            >
              {c.email}
            </a>
          </div>

          {/* Nav links */}
          <nav aria-label="Links de navegación">
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-hueso/60 hover:text-hueso/90 transition-colors"
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
                  className="w-11 h-11 rounded-full border border-hueso/12 flex items-center justify-center text-hueso/45 hover:border-dorado/40 hover:text-dorado transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <Link
              href="/#contacto"
              className="inline-flex items-center gap-2 bg-hueso/6 border border-hueso/12 text-hueso/50 px-5 py-2.5 rounded-full font-sans text-xs font-medium hover:bg-hueso hover:text-bordo hover:border-hueso transition-all"
            >
              {c.cta_text}
            </Link>
          </div>

        </div>

        {/* Bottom row */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-hueso/40 tracking-wide flex items-center gap-2 flex-wrap">
            © {new Date().getFullYear()} {c.copyright_name}
            <span className="text-hueso/20">·</span>
            <Link href="/privacidad" className="hover:text-hueso/70 transition-colors">
              Privacidad
            </Link>
            <span className="text-hueso/20">·</span>
            <Link href="/terminos" className="hover:text-hueso/70 transition-colors">
              Términos
            </Link>
          </p>
          <p className="font-mono text-[11px] text-hueso/30 tracking-wide">
            {c.signature}
          </p>
        </div>

      </div>
    </footer>
  )
}
