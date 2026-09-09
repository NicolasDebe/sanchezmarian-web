import { notFound } from "next/navigation"
import { ResenasContent } from "@/components/resenas-content"
import { ResenasPreview } from "@/components/resenas-preview"
import type { PublicTestimonial, RatingSummary } from "@/lib/testimonials"

/**
 * Banco de pruebas de la UI de reseñas — SOLO DESARROLLO (en producción da 404).
 *
 * Renderiza <ResenasContent> y <ResenasPreview> con datos falsos, para poder
 * verificar las reglas duras (promedio con 5+, chips con 8+, estado vacío, el
 * tope de 3 del adelanto) sin depender de que haya reseñas reales publicadas.
 * Lo usa scripts/e2e-resenas-publicas.ts.
 *
 *   /dev/resenas-harness?n=9            → la página completa con 9 reseñas
 *   /dev/resenas-harness?view=preview&n=9 → el bloque del home
 */
export const dynamic = "force-dynamic"

const BODIES = [
  "Trabajar con Marian fue clarísimo de punta a punta. Entiende los tiempos de la redacción, manda material chequeado y nunca insiste de más. Es de las pocas consultoras que entiende cómo trabajamos del otro lado.",
  "Llegamos con una marca que nadie conocía fuera de Mendoza. En seis meses estábamos en tres medios nacionales, y no por casualidad: hubo estrategia, insistencia y una lectura muy fina de qué le interesaba a cada periodista.",
  "Lo que más valoro es que no promete lo que no puede cumplir. Nos dijo desde el primer día qué era realista y qué no, y eso nos ahorró meses de expectativas infladas.",
  "Ordenó un mensaje que teníamos hecho un nudo. Salimos de las reuniones sabiendo qué decir y, sobre todo, qué dejar afuera.",
]

function stub(n: number): PublicTestimonial[] {
  const out: PublicTestimonial[] = []
  for (let i = 0; i < n; i++) {
    // Alterna marca/periodista salvo el caso i=0, para tener mezcla.
    const esPeriodista = i % 3 === 1
    const mes = String(12 - (i % 12)).padStart(2, "0")
    out.push({
      id: `stub-${i}`,
      reviewer_type: esPeriodista ? "periodista" : "marca",
      author_name: esPeriodista ? `Lucía Fernández ${i}` : `Martín Aguirre ${i}`,
      author_role: esPeriodista ? "Editora de Economía" : "Fundador",
      author_brand: esPeriodista ? "Los Andes" : "Bodega Aguirre",
      author_url: "https://example.com/perfil",
      rating: 5 - (i % 2),
      body: BODIES[i % BODIES.length],
      published_at: `2026-${mes}-14T12:00:00.000Z`,
    })
  }
  return out
}

function summaryOf(items: PublicTestimonial[]): RatingSummary {
  if (items.length === 0)
    return { average: null, count: 0, countMarcas: 0, countPeriodistas: 0 }
  const total = items.reduce((a, r) => a + r.rating, 0)
  return {
    average: Math.round((total / items.length) * 10) / 10,
    count: items.length,
    countMarcas: items.filter((r) => r.reviewer_type === "marca").length,
    countPeriodistas: items.filter((r) => r.reviewer_type === "periodista").length,
  }
}

export default async function Harness({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; view?: string }>
}) {
  // Nunca sale al aire: es una ruta de prueba con datos inventados y no tiene
  // por qué existir en el sitio público.
  if (process.env.NODE_ENV === "production") notFound()

  const sp = await searchParams
  const n = Number(sp.n ?? "0")
  const items = stub(Number.isFinite(n) ? n : 0)

  if (sp.view === "preview") {
    return <ResenasPreview resenas={items} bg="bg-hueso" />
  }

  return <ResenasContent resenas={items} summary={summaryOf(items)} />
}
