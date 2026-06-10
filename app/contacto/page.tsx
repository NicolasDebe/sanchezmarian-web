import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { ContactoContent } from "@/components/contacto-content"
import { getPageContent } from "@/lib/content"
import { CONTACTO_SECTIONS } from "@/lib/contacto-schema"
import { getGlobalContent } from "@/lib/global-content"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("contacto", "https://sanchezmarian.com/contacto")
}

export default async function ContactoPage() {
  const [global, content] = await Promise.all([
    getGlobalContent(),
    getPageContent("contacto", CONTACTO_SECTIONS),
  ])

  return (
    <main>
      <Nav content={global.nav} />
      <ContactoContent content={content} />
      <Footer content={global.footer} nav={global.nav} />
    </main>
  )
}
