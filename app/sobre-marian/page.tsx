import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"

export const metadata: Metadata = {
  title: "Sobre Marian — Marian Sánchez",
  description:
    "Estratega de comunicación con más de 10 años de experiencia. Conecto marcas y profesionales con los medios que importan en Mendoza y Argentina.",
  openGraph: {
    title: "Sobre Marian — Marian Sánchez",
    description:
      "Estratega de comunicación con más de 10 años de experiencia. Conecto marcas y profesionales con los medios que importan en Mendoza y Argentina.",
    url: "https://sanchezmarian.com/sobre-marian",
  },
}

const TIMELINE = [
  {
    year: "2016",
    title: "Primeros pasos",
    body: "Comencé a trabajar en comunicación corporativa en Mendoza, construyendo las primeras relaciones con periodistas y aprendiendo desde adentro cómo funcionan los medios.",
  },
  {
    year: "2018",
    title: "Fundación de GB Consulting",
    body: "Creé mi propia consultora para ofrecer un servicio más personalizado. El foco: comunicación estratégica con resultados medibles para marcas y profesionales.",
  },
  {
    year: "2020",
    title: "Expansión nacional",
    body: "Incorporé clientes de alcance nacional y amplié la red de medios a nivel argentino, consolidando la metodología de trabajo que uso hasta hoy.",
  },
  {
    year: "2022",
    title: "Más de 30 clientes activos",
    body: "GB Consulting superó los 10 clientes activos y 100+ apariciones en medios documentadas. Un hito que confirmó que el enfoque de relaciones reales funciona.",
  },
  {
    year: "2024",
    title: "Referente en Mendoza",
    body: "Reconocida como una de las consultoras de comunicación de referencia en Mendoza. Hoy sigo acompañando a marcas y profesionales que quieren estar donde tiene que estar su historia.",
  },
]

const VALUES = [
  {
    title: "Relaciones reales",
    body: "No trabajo con bases de datos frías. Mis contactos con periodistas son vínculos genuinos, construidos con el tiempo y la confianza.",
  },
  {
    title: "Estrategia antes de publicidad",
    body: "Antes de hablar con un periodista, definimos qué historia contar. El mensaje correcto multiplica el impacto de cada acción.",
  },
  {
    title: "Honestidad sobre resultados",
    body: "Te digo exactamente qué es posible con tu presupuesto y tu situación. Sin promesas vacías, con compromiso real.",
  },
  {
    title: "Resultados documentados",
    body: "Cada aparición en medios, nota y entrevista queda registrada. Vas a ver exactamente el impacto de lo que hacemos juntos.",
  },
]

export default function SobreMarianPage() {
  return (
    <main>
      <Nav />

      <PageHero
        eyebrow="Sobre Marian"
        title="Mariana Sánchez,"
        titleAccent="estratega de comunicación."
        subtitle="Más de una década construyendo relaciones con periodistas y resultados reales para marcas y profesionales en Argentina."
      />

      {/* Bio principal */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Foto placeholder */}
          <div className="relative">
            <div className="absolute top-5 left-5 w-full aspect-[3/4] max-w-[420px] rounded-[2rem] border-2 border-lino pointer-events-none" />
            <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-[2rem] rounded-tr-[4rem] overflow-hidden bg-lino">
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-40">
                <div className="w-24 h-24 rounded-full bg-marino/30" />
                <div className="w-32 h-3 rounded-full bg-marino/20" />
                <p className="font-mono text-xs text-marino/50 uppercase tracking-widest mt-1">
                  Foto · Marian
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-2 lg:-right-6 bg-marino text-white px-5 py-4 rounded-2xl shadow-xl">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Más de una</p>
              <p className="font-playfair font-bold text-2xl leading-none">década</p>
              <p className="font-sans text-xs text-white/70 mt-0.5">en comunicación</p>
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-4 font-sans text-gris-tx text-base leading-relaxed">
              <p>
                Saber qué historia contar, a quién y en qué momento. Conecto tu
                marca personal o empresarial con el ecosistema de medios de Mendoza
                de forma natural, aportando valor al periodista y visibilidad
                estratégica a tu proyecto.
              </p>
              <p>
                Mi nombre es Marian Sánchez y ayudo a empresas y marcas personales
                a transformar su propósito en noticias, conectando su propuesta de
                valor con los canales de comunicación adecuados. Llevo más de una
                década construyendo vínculos reales con los protagonistas de los
                medios locales.
              </p>
              <p>
                Mi enfoque no se limita a la difusión masiva; se basa en el vínculo
                real. Entiendo el ADN de cada cliente para identificar exactamente
                qué periodista o medio de comunicación está buscando esa historia.
                Diseño estrategias personalizadas, adaptadas a las necesidades de
                cada proyecto, porque cada marca tiene un ritmo, un tono y un
                objetivo diferente.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-marino/10">
              {[
                { n: "100+", label: "Apariciones en medios" },
                { n: "10+", label: "Clientes activos" },
                { n: "10+ años", label: "De experiencia" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-playfair font-bold text-marino text-2xl lg:text-3xl">{stat.n}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-gris-tx/60 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-terracota text-white px-6 py-3.5 rounded-full font-sans text-sm font-semibold hover:bg-terracota/90 transition-colors group w-fit"
            >
              Hablar con Marian
              <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trayectoria */}
      <section className="bg-arena py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota mb-5">
            Trayectoria
          </p>
          <h2 className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.75rem] leading-[1.1] mb-16 max-w-xl">
            <span className="block">El camino hasta</span>
            <em className="block italic text-terracota">acá.</em>
          </h2>

          <div className="relative flex flex-col gap-0">
            {/* Línea vertical */}
            <div className="absolute left-[88px] top-0 bottom-0 w-px bg-marino/15 hidden sm:block" />

            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex flex-col sm:flex-row gap-4 sm:gap-10 pb-12 last:pb-0">
                <div className="flex-shrink-0 w-[88px] flex flex-col items-end sm:pr-10">
                  <span className="font-playfair font-bold text-terracota text-xl">{item.year}</span>
                </div>
                <div className="relative flex-1 pb-2">
                  {/* Dot */}
                  <div className="absolute -left-[2.85rem] top-[7px] w-2.5 h-2.5 rounded-full bg-terracota hidden sm:block" />
                  <h3 className="font-playfair font-bold text-marino text-lg mb-2">{item.title}</h3>
                  <p className="font-sans text-gris-tx text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-marino-osc py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-terracota mb-5">
            Valores
          </p>
          <h2 className="font-playfair font-bold text-white text-[2rem] sm:text-[2.75rem] leading-[1.1] mb-14 max-w-xl">
            <span className="block">En qué creo</span>
            <em className="block italic text-terracota">cuando trabajo.</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title} className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-terracota/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-playfair font-bold text-white text-xl">{v.title}</h3>
                <p className="font-sans text-white/55 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-playfair font-bold text-marino text-[2rem] sm:text-[2.5rem] leading-[1.1] mb-5">
            ¿Trabajamos juntos?
          </h2>
          <p className="font-sans text-gris-tx text-base leading-relaxed mb-8 max-w-md mx-auto">
            La primera consulta es gratuita. En 30 minutos podemos ver exactamente cómo puedo ayudarte.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-terracota text-white px-8 py-4 rounded-full font-sans text-sm font-semibold hover:bg-terracota/90 transition-colors group"
          >
            Agendá una consulta gratis
            <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
