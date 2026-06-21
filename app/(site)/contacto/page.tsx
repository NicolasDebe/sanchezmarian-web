import type { Metadata } from "next"
import { ContactoContent } from "@/components/contacto-content"
import { getPageContent } from "@/lib/content"
import { CONTACTO_SECTIONS } from "@/lib/contacto-schema"
import { buildMetadata, SITE_URL } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("contacto", `${SITE_URL}/contacto`)
}

export default async function ContactoPage() {
  const content = await getPageContent("contacto", CONTACTO_SECTIONS)

  return <ContactoContent content={content} />
}
