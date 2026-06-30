import type { Metadata } from "next"
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
import { getOgDefaults, absoluteUrl, SITE_URL } from "@/lib/seo"
import { createAdminClient } from "@/lib/supabase"
import { getScaleValue, type ScalePresetKey } from "@/lib/design"
import "./globals.css"

// Solo los pesos realmente usados en el sitio: 400 (texto/H1 plano), 600
// (rich-content h2/h3, detalle de campañas) y 700 (titulares font-bold), en
// normal e itálica. Se quitaron 300/500/800/900 (sin consumidores) para
// recortar el payload de fuentes en mobile.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
})

// Instancia VARIABLE (eje wght 400–900) aislada: solo la usa el typography
// morph de /servicios vía --font-playfair-var. El resto del sitio sigue con
// las instancias estáticas de arriba (sin cambios de render).
const playfairVariable = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-var",
  display: "swap",
  weight: "variable",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

// DM Mono se usa solo para eyebrows/labels/números a peso regular.
const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
  weight: ["400"],
})

const BASE_URL = SITE_URL

/**
 * Metadata por defecto del sitio. Lee los defaults OG editables
 * (global/metadata) y arma OpenGraph + Twitter con imagen ABSOLUTA. Las
 * páginas que definen su propio generateMetadata (vía buildMetadata) lo
 * sobrescriben; las que no, heredan esto.
 *
 * Sin `title.template`: los títulos por página ya incluyen el sufijo de marca
 * ("… — Marian Sánchez"), así que un template duplicaría el nombre.
 */
export async function generateMetadata(): Promise<Metadata> {
  const g = await getOgDefaults()
  const imageUrl = absoluteUrl(g.og_default_image)

  return {
    metadataBase: new URL(BASE_URL),
    title: g.og_default_title,
    description: g.og_default_description,
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/favicon-180.png", sizes: "180x180" }],
    },
    openGraph: {
      type: "website",
      url: BASE_URL,
      siteName: g.og_site_name,
      title: g.og_default_title,
      description: g.og_default_description,
      locale: "es_AR",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: g.og_default_title,
      description: g.og_default_description,
      images: [imageUrl],
      ...(g.twitter_handle?.trim() ? { creator: g.twitter_handle.trim(), site: g.twitter_handle.trim() } : {}),
    },
    alternates: {
      canonical: BASE_URL,
    },
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Mariana Sánchez",
  url: BASE_URL,
  jobTitle: "Consultora de comunicación estratégica",
  description:
    "Consultora de comunicación y prensa en Mendoza. Ayudo a marcas y profesionales a aparecer en los medios que importan.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mendoza",
    addressCountry: "AR",
  },
  knowsAbout: [
    "Comunicación estratégica",
    "Prensa y medios",
    "Copywriting",
    "Social Media",
    "Relaciones Públicas",
  ],
  worksFor: {
    "@type": "Organization",
    name: "GB Consulting",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Escala tipográfica controlada desde /admin/tipografia (singleton en DB).
  // Si la tabla todavía no existe o falla la lectura, caemos a 1 (idéntico al
  // diseño actual).
  let mobileScale = 1
  let desktopScale = 1
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("design_settings")
      .select("text_scale_mobile, text_scale_desktop")
      .eq("singleton_lock", true)
      .single()
    if (data) {
      mobileScale = getScaleValue(data.text_scale_mobile as ScalePresetKey)
      desktopScale = getScaleValue(data.text_scale_desktop as ScalePresetKey)
    }
  } catch {
    /* defaults a 1 si la tabla todavía no existe o falla la lectura */
  }

  return (
    <html
      lang="es"
      className={`${playfairDisplay.variable} ${playfairVariable.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      style={{
        ["--text-scale-mobile" as string]: String(mobileScale),
        ["--text-scale-desktop" as string]: String(desktopScale),
      }}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#3D000F",
              color: "#FEFCEF",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  )
}
