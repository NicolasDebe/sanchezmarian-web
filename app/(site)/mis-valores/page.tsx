import type { Metadata } from "next"
import { MisValoresSections } from "@/components/mis-valores-sections"
import { getPageContent, getTextScales } from "@/lib/content"
import { MIS_VALORES_SECTIONS } from "@/lib/mis-valores-schema"
import { buildMetadata, SITE_URL } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("mis_valores", `${SITE_URL}/mis-valores`)
}

export default async function MisValoresPage() {
  const [content, scales] = await Promise.all([
    getPageContent("mis_valores", MIS_VALORES_SECTIONS),
    getTextScales("mis_valores"),
  ])

  return <MisValoresSections content={content} scales={scales} />
}
