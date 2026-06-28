import Link from "next/link"
import { MessageCircle, MapPin } from "lucide-react"
import { Instagram, Linkedin } from "@/components/ui/social-icons"
import { globalFallbacksFor } from "@/lib/global-schema"
import { NAV_ITEMS, SOCIAL_LINKS, SITE_EMAIL, SITE_TAGLINE, WHATSAPP_HREF } from "@/lib/constants"
import { Logo } from "@/components/layout/Logo"

export function Footer({
  content,
  nav,
}: {
  content?: Record<string, string>
  nav?: Record<string, string>
}) {
  const c = { ...globalFallbacksFor("footer"), ...content }
  const tagline = c.tagline || SITE_TAGLINE
  const email = c.email || SITE_EMAIL
  const phone = c.phone || "+54 261 543-3882"
  const locationTag = c.location_tag || "Mendoza, Argentina · Trabajo remoto en LATAM"

  // Navegación: un único array (NAV_ITEMS), con texto editable desde el CMS.
  const NAV_LINKS = NAV_ITEMS.map((item) => ({
    label: nav?.[item.key] ?? item.label,
    href: item.href,
  }))
  const SOCIAL = [
    {
      label: "@marian15s",
      aria: "Instagram de Marian Sánchez",
      href: c.instagram_url || SOCIAL_LINKS.instagram,
      Icon: Instagram,
    },
    {
      label: "Marian Sánchez",
      aria: "LinkedIn de Marian Sánchez",
      href: c.linkedin_url || SOCIAL_LINKS.linkedin,
      Icon: Linkedin,
    },
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
            <Logo variant="negative" height={38} />
            <p
              className="font-sans text-hueso/55"
              style={{
                fontSize: 12,
                lineHeight: 1.65,
                maxWidth: 340,
                marginTop: 4,
              }}
            >
              {tagline}
            </p>
            <a
              href={`mailto:${email}`}
              className="font-mono text-[11px] text-hueso/55 hover:text-hueso/80 transition-colors tracking-wide"
            >
              {email}
            </a>

            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 font-sans text-[13px] text-hueso/60 hover:text-hueso transition-colors"
            >
              <MessageCircle size={14} strokeWidth={1.5} className="shrink-0" />
              {phone}
            </a>

            <p className="inline-flex items-center gap-2 font-sans text-[13px] text-hueso/45">
              <MapPin size={14} strokeWidth={1.5} className="shrink-0" />
              {locationTag}
            </p>
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
            <div className="flex flex-col gap-3">
              {SOCIAL.map(({ label, aria, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={aria}
                  className="group flex min-h-11 items-center gap-3 transition-colors"
                >
                  <Icon size={22} strokeWidth={1.5} className="shrink-0 text-hueso/75 transition-colors group-hover:text-hueso" />
                  <span className="font-sans text-xs text-hueso/60 transition-colors group-hover:text-hueso">
                    {label}
                  </span>
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
