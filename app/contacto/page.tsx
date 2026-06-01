import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
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
      <ContactoContent />
      <Footer />
    </main>
  )
}
