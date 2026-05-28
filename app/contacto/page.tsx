import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { ContactoContent } from "@/components/contacto-content"

export const metadata: Metadata = {
  title: "Contacto — Marian Sánchez",
  description:
    "Conversemos sobre tu estrategia de comunicación. Hablemos sobre cómo posicionar tu proyecto en los medios.",
  openGraph: {
    title: "Contacto — Marian Sánchez",
    description: "Conversemos sobre tu proyecto y cómo puedo ayudarte a comunicarlo.",
    url: "https://sanchezmarian.com/contacto",
  },
}

export default function ContactoPage() {
  return (
    <main>
      <Nav />
      <PageHero
        eyebrow="Contacto"
        title="Hablemos sobre"
        titleAccent="tu historia."
        subtitle="Conversemos sobre tu proyecto y cómo puedo ayudarte a comunicarlo."
      />
      <ContactoContent />
      <Footer />
    </main>
  )
}
