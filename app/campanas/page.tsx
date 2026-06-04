import type { Metadata } from "next"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { CampanasContent } from "@/components/campanas-content"
import type { Campaign } from "@/lib/types/campaign"

export const metadata: Metadata = {
  title: "Campañas activas — Marian Sánchez",
  description:
    "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza.",
  openGraph: {
    title: "Campañas activas — Marian Sánchez",
    description:
      "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza.",
    url: "https://sanchezmarian.com/campanas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campañas activas — Marian Sánchez",
    description:
      "Campañas de prensa en curso. Estrategias de comunicación activas para marcas y proyectos en Mendoza.",
  },
}

const CAMPAIGNS_DATA: Campaign[] = [
  {
    id: "1",
    slug: "campana-lynk-co-grupo-presidente",
    brand: "Grupo Presidente",
    title: "Preventa Lynk & Co Mendoza",
    description:
      "Grupo Presidente confirma el inicio de la preventa exclusiva de Lynk & Co en Mendoza. Tres modelos SUV híbridos premium con apertura de Urban Store en Palmares Mall prevista para el segundo semestre de 2026.",
    status: "ACTIVA",
    date: "Junio 2026",
    created_at: "",
    updated_at: "",
    content: `
<p class="lead">Hay hitos que cambian el pulso de un mercado, y lo que ocurre hoy en Mendoza es uno de ellos. Grupo Presidente confirma el inicio de la preventa exclusiva de Lynk &amp; Co, la marca global que está transformando la industria automotriz.</p>

<h3>Más que un SUV: una declaración de principios</h3>

<p>Fundada en 2016 en Gotemburgo, Suecia, Lynk &amp; Co nació como un proyecto global que combina ingeniería y diseño europeo con respaldo industrial global y una fuerte integración digital en el vehículo. La marca se construye sobre los más altos estándares escandinavos de seguridad, calidad e innovación tecnológica.</p>

<p>La línea de productos disponibles en preventa incluye el Lynk &amp; Co 01 (el SUV que inaugura la experiencia premium), el 06 (mayor refinamiento interior y dinámica deportiva) y el flagship 08 (lujo, espacio y tecnología sin límites). Los tres modelos PHEV cuentan con 5 estrellas Euro NCAP.</p>

<h3>El respaldo de un peso pesado regional</h3>

<p>La elección de Lynk &amp; Co por parte de Grupo Presidente no es casual: es el resultado de una visión compartida de excelencia y vanguardia. Lynk &amp; Co propone además una nueva experiencia de compra con Flagship Hubs y el nuevo Urban Store en Palmares Mall, cuya apertura está prevista para el segundo semestre de 2026.</p>

<blockquote class="dark">
  <p>"En Presidente trabajamos con una visión clara: impulsar la llegada al oeste argentino de las marcas más innovadoras del mundo."</p>
  <footer>— Dirección de Grupo Presidente</footer>
</blockquote>

<h3>Oportunidad de pioneros</h3>

<p>La preventa exclusiva ya está habilitada a través de las redes oficiales @lynkco.clubmza. Los primeros compradores contarán con un paquete de beneficios y experiencias exclusivas que marcan el ADN de la marca.</p>
`.trim(),
    images: [
      { id: "1-1", campaign_id: "1", url: "/images/1.jpg", alt: "Lynk & Co Mendoza", position: 1 },
      { id: "1-2", campaign_id: "1", url: "/images/2.jpg", alt: "Lynk & Co Mendoza", position: 2 },
      { id: "1-3", campaign_id: "1", url: "/images/3.jpg", alt: "Lynk & Co Mendoza", position: 3 },
      { id: "1-4", campaign_id: "1", url: "/images/4.jpg", alt: "Lynk & Co Mendoza", position: 4 },
      { id: "1-5", campaign_id: "1", url: "/images/5.jpg", alt: "Lynk & Co Mendoza", position: 5 },
    ],
  },
  {
    id: "2",
    slug: "campana-bolsa-comercio-mosto",
    brand: "Bolsa de Comercio de Mendoza",
    title: "Comisión Precio del Vino · Vinexpo Explorer",
    description:
      "La BCM reafirmó su posición como nexo articulador de la economía regional con un nuevo encuentro de la Comisión del Precio del Vino.",
    status: "ACTIVA",
    date: "Junio 2026",
    created_at: "",
    updated_at: "",
    content: `
<p class="lead">La Bolsa de Comercio de Mendoza reafirmó su posición como nexo articulador de la economía regional al realizar un nuevo encuentro de la Comisión del Precio del Vino, histórica en la institución.</p>

<h3>Mendoza, epicentro mundial del vino a granel</h3>

<p>Patricia Giménez (ProMendoza) expuso sobre Vinexpo Explorer — The Bulk Wine Chapter, el prestigioso encuentro internacional que se celebrará en la provincia del 8 al 10 de junio de 2026, con apertura oficial en la Bolsa de Comercio de Mendoza.</p>

<blockquote>
  <p>"Si bien más del 60% de los compradores internacionales ya comercializaba vino argentino, más del 80% de ellos no conocía Mendoza en persona. Aquí es donde la identidad mendocina juega un rol clave."</p>
  <footer>— Patricia Giménez, ProMendoza</footer>
</blockquote>

<h3>Radiografía y proyección del sector del mosto</h3>

<p>El 90% del mosto argentino se destina al mercado externo, siendo Estados Unidos el principal comprador, seguido por Japón, Sudáfrica y Canadá. La campaña estimada alcanza 93.000 toneladas, utilizadas como endulzante natural premium en bebidas y alimentos industrializados.</p>

<p>La Comisión concluyó en la necesidad de continuar generando estos espacios de debate para dotar de herramientas estratégicas a las pymes y productores de la provincia.</p>
`.trim(),
    images: [
      { id: "2-1", campaign_id: "2", url: "/images/NAC_3874.jpg", alt: "BCM Comisión del Precio del Vino", position: 1 },
      { id: "2-2", campaign_id: "2", url: "/images/NAC_3895.jpg", alt: "BCM Comisión del Precio del Vino", position: 2 },
      { id: "2-3", campaign_id: "2", url: "/images/NAC_4000.jpg", alt: "BCM Comisión del Precio del Vino", position: 3 },
      { id: "2-4", campaign_id: "2", url: "/images/NAC_4067.jpg", alt: "BCM Comisión del Precio del Vino", position: 4 },
    ],
  },
  {
    id: "3",
    slug: "campana-capilla-carlo-acutis",
    brand: "Capilla Carlo Acutis",
    title: "17% de avance · Inauguración 2028",
    description:
      "A un año de iniciar la construcción de la primera capilla dedicada al santo millennial en Chacras de Coria, la obra alcanzó solo el 17% de avance y corre riesgo de paralizarse por falta de fondos.",
    status: "ACTIVA",
    date: "Junio 2026",
    created_at: "",
    updated_at: "",
    content: `
<p class="lead">A un año de haber iniciado la construcción de la primera capilla dedicada al «Ciberapóstol de la Eucaristía» en Chacras de Coria, Luján de Cuyo, la coordinación del proyecto advierte que la obra se encuentra en una etapa crítica y corre riesgo de paralizarse debido a la falta de fondos.</p>

<p>La obra ha alcanzado solo el 17% de avance: cimientos, subsuelo y losa del piso del templo. El próximo objetivo es la construcción de las primeras columnas del proyecto, con inauguración prevista para el primer semestre de 2028.</p>

<p>Ante este escenario, se ha lanzado un nuevo sistema de donaciones integrado con Mercado Pago, que permite a ciudadanos de todo el país suscribirse de forma anual con distintos montos, de manera simple y segura, buscando garantizar el flujo de recursos necesarios para avanzar en la concreción de la obra.</p>

<blockquote>
  <p>"Luego de un pequeño párate en la obra, ya estamos reanudándola nuevamente gracias a la solidaridad de muchas personas de Argentina y del exterior que se sienten movilizadas con este proyecto. La idea es seguir adelante con todo y no detenernos hasta su inauguración durante el primer semestre de 2028."</p>
  <footer>— Carlos Bajach, coordinador del proyecto</footer>
</blockquote>

<h3>Cómo colaborar</h3>

<p>Los interesados en preservar este espacio dedicado al santo Carlo Acutis pueden sumarse a través del sistema de suscripción, aportando montos fijos que permiten una planificación real de los trabajos de construcción. Más información en <a href="https://capillacarloacutis.com/" target="_blank" rel="noopener noreferrer" style="color:var(--color-bordo)">capillacarloacutis.com</a>.</p>

<blockquote class="dark">
  <p>"Pocas oportunidades tendremos en nuestras vidas de ser parte, de manera real e importante, en la construcción de una capilla. Para agradecer a todos los que colaboran, habrá un chapón gigante con los nombres de los donantes de esta obra, que será un legado para nuestras familias, hijos y nietos. El momento es ahora: hay que animarse a aportar."</p>
  <footer>— Carlos Bajach, coordinador del proyecto</footer>
</blockquote>
`.trim(),
    images: [
      { id: "3-1", campaign_id: "3", url: "/images/1.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 1 },
      { id: "3-2", campaign_id: "3", url: "/images/2.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 2 },
      { id: "3-3", campaign_id: "3", url: "/images/3.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 3 },
      { id: "3-4", campaign_id: "3", url: "/images/4.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 4 },
      { id: "3-5", campaign_id: "3", url: "/images/5.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 5 },
      { id: "3-6", campaign_id: "3", url: "/images/6.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 6 },
      { id: "3-7", campaign_id: "3", url: "/images/7.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 7 },
      { id: "3-8", campaign_id: "3", url: "/images/8.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 8 },
      { id: "3-9", campaign_id: "3", url: "/images/9.jpeg", alt: "Capilla Carlo Acutis Luján de Cuyo", position: 9 },
    ],
  },
]

export default function CampanasPage() {
  return (
    <main>
      <Nav />
      <CampanasContent campaigns={CAMPAIGNS_DATA} />
      <Footer />
    </main>
  )
}
