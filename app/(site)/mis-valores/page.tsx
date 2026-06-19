import type { Metadata } from "next"
import { MisValoresSections } from "@/components/mis-valores-sections"
import { getPageContent } from "@/lib/content"
import { MIS_VALORES_SECTIONS } from "@/lib/mis-valores-schema"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("mis_valores", "https://sanchezmarian.com/mis-valores")
}

export default async function MisValoresPage() {
  const content = await getPageContent("mis_valores", MIS_VALORES_SECTIONS)

  return <MisValoresSections content={content} />
}
