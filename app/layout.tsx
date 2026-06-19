import type { Metadata } from "next"
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
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

const BASE_URL = "https://sanchezmarian.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Marian Sánchez — Comunicación estratégica · Mendoza",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180" }],
  },
  description:
    "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Marian Sánchez",
    title: "Marian Sánchez — Comunicación estratégica · Mendoza",
    description:
      "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.",
    locale: "es_AR",
    images: [{ url: "/images/logo-marian-positivo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marian Sánchez — Comunicación estratégica · Mendoza",
    description:
      "Comunicación estratégica y narrativas multiplataforma para negocios. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.",
    images: ["/images/logo-marian-positivo.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${playfairDisplay.variable} ${playfairVariable.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
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
