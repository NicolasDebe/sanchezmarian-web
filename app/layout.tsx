import type { Metadata } from "next"
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
  weight: ["300", "400", "500"],
})

const BASE_URL = "https://sanchezmarian.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Marian Sánchez — Estratega de comunicación · Mendoza",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180" }],
  },
  description:
    "Conecto tu marca con los medios que importan. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.",
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Marian Sánchez",
    title: "Marian Sánchez — Estratega de comunicación · Mendoza",
    description:
      "Conecto tu marca con los medios que importan. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.",
    locale: "es_AR",
    images: [{ url: "/images/logo-marian-positivo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marian Sánchez — Estratega de comunicación · Mendoza",
    description:
      "Conecto tu marca con los medios que importan. Más de 10 años construyendo relaciones reales con periodistas en Mendoza y Argentina.",
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
      className={`${playfairDisplay.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/hero-marian.jpg"
          // @ts-ignore — imagesrcset/imagesizes son atributos HTML válidos no tipados en React
          imagesrcset="/images/hero-marian.jpg 1200w"
          imagesizes="100vw"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
