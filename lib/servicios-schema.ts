/**
 * Esquema de contenido editable de /servicios.
 * Fuente única de verdad: sitio público (fallback), seed y editor admin.
 * Los fallbacks son EXACTAMENTE los textos oficiales aprobados por Marian
 * ("Pilares del servicio" / PDF), palabra por palabra. Si Supabase está vacío,
 * la página se ve idéntica y el build nunca falla.
 *
 * Estructura: hero + pilares + 4 bloques de servicio + CTA final. Las listas de
 * ítems se editan como longtext multilínea (un ítem por línea).
 */
import type { SectionDef } from "@/lib/content-schema"
import { fallbacksForIn, fallbackOfIn } from "@/lib/content-schema"

export const SERVICIOS_SECTIONS: SectionDef[] = [
  {
    section: "hero",
    title: "Hero",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (línea superior)", fallback: "Servicios", maxChars: 30, resizable: true },
      {
        field: "h1",
        type: "longtext",
        // Es el H1 de la página: no puede llevar HTML adentro.
        plain: true,
        label: "Título principal (H1)",
        fallback: "La Estrategia en Comunicación se asienta sobre tres pilares fundamentales.",
        maxChars: 120,
        resizable: true,
      },
      {
        field: "description",
        type: "longtext",
        label: "Bajada (opcional — el título solo basta)",
        fallback: "",
        maxChars: 400,
        resizable: true,
      },
    ],
  },

  /* ───────────── PILARES ───────────── */
  {
    section: "pilares",
    title: "Pilares del servicio",
    legend: "Tres pilares en columnas. Cada pilar: título + ítems (uno por línea). La nota final es la bisagra hacia el catálogo de servicios.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Pilares", maxChars: 30, resizable: true },
      { field: "title", type: "text", label: "Título", fallback: "Pilares del servicio.", maxChars: 80, resizable: true },
      { field: "pilar_1_title", type: "text", label: "Pilar 01 — Título", fallback: "Propósito", maxChars: 60, resizable: true },
      { field: "pilar_1_items", type: "longtext", plain: true, label: "Pilar 01 — Ítems (uno por línea)", fallback: "Se parte siempre del porqué de la empresa.\nLa comunicación refleja los valores, la visión y la identidad de la organización.\nSe evita la comunicación vacía o desconectada de la realidad del negocio.", maxChars: 600, resizable: true },
      { field: "pilar_2_title", type: "text", label: "Pilar 02 — Título", fallback: "Plataformas adecuadas", maxChars: 60, resizable: true },
      { field: "pilar_2_items", type: "longtext", plain: true, label: "Pilar 02 — Ítems (uno por línea)", fallback: "Se seleccionan los canales según la estrategia y el público objetivo.\nPueden incluir medios tradicionales, redes sociales, eventos presenciales, producciones audiovisuales, activaciones de marca, medios digitales, entre otros.\nNo existe una fórmula única: cada empresa requiere su propio mix de comunicación.", maxChars: 700, resizable: true },
      { field: "pilar_3_title", type: "text", label: "Pilar 03 — Título", fallback: "Objetivos comerciales", maxChars: 60, resizable: true },
      { field: "pilar_3_items", type: "longtext", plain: true, label: "Pilar 03 — Ítems (uno por línea)", fallback: "Cada acción de comunicación responde a un objetivo de negocio concreto.\nSe busca visibilidad, posicionamiento, reputación y resultados medibles.\nLa estrategia se evalúa y ajusta de forma periódica según los resultados obtenidos.", maxChars: 600, resizable: true },
      { field: "intro_note", type: "longtext", plain: true, label: "Nota introductoria al catálogo", fallback: "Los siguientes servicios están contenidos dentro de la Estrategia en Comunicación y pueden ofrecerse como parte del paquete integral o de manera individual según las necesidades de cada cliente.", maxChars: 400, resizable: true },
    ],
  },

  /* ───────────── BLOQUE 01 — Estrategia y Consultoría General ───────────── */
  {
    section: "servicio_01",
    title: "Servicio 01 — Estrategia y consultoría",
    legend: "Servicio principal. La descripción admite varios párrafos (separalos con una línea en blanco).",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Servicio principal", maxChars: 40, resizable: true },
      { field: "title", type: "text", label: "Título", fallback: "Estrategia y consultoría general de comunicación", maxChars: 90, resizable: true },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "Este servicio está diseñado exclusivamente para empresas y marcas personales que buscan delegar su comunicación con absoluta confianza, liberando tiempo clave de su agenda para enfocarlo en el crecimiento del negocio.\n\nAquí entra un esquema de trabajo flexible, el servicio se adapta con total fluidez a la estructura del cliente. Es posible coordinar y potenciar a los profesionales o proveedores que la empresa ya tenga contratados, o bien encargarse de buscar y acercar al perfil experto adecuado para cubrir cada necesidad específica mediante alianzas estratégicas.",
        maxChars: 900,
        resizable: true,
      },
      { field: "includes_label", type: "text", label: "Label de la lista", fallback: "Incluye", maxChars: 40, resizable: true },
      { field: "sub_1_title", type: "text", label: "Punto 1 — Título", fallback: "Planificación y visión 360°", maxChars: 80, resizable: true },
      { field: "sub_1_desc", type: "longtext", plain: true, label: "Punto 1 — Descripción", fallback: "Se diseña o adapta la estrategia macro y se coordina cada una de sus aristas para que todas las acciones tanto internas como externas y contenidos formen parte de un mismo mecanismo integrado.", maxChars: 400, resizable: true },
      { field: "sub_2_title", type: "text", label: "Punto 2 — Título", fallback: "Cero micromanagement", maxChars: 80, resizable: true },
      { field: "sub_2_desc", type: "longtext", plain: true, label: "Punto 2 — Descripción", fallback: "Se elimina por completo la carga operativa del referente de la empresa. El servicio asume la supervisión técnica directa de las redacciones, piezas visuales y campañas, evitando la necesidad de que el cliente tenga que validar o aprobar cada detalle diario.", maxChars: 400, resizable: true },
      { field: "sub_3_title", type: "text", label: "Punto 3 — Título", fallback: "Asistencia y consultoría", maxChars: 80, resizable: true },
      { field: "sub_3_desc", type: "longtext", plain: true, label: "Punto 3 — Descripción", fallback: "Funciona como un espacio de asesoría continua sobre cómo trabajar estratégicamente la comunicación en cada plataforma. Incluye un acompañamiento permanente y técnico a los profesionales de redes sociales, marketing, diseño, programación y productores audiovisuales, asegurando que ejecuten bajo un mismo criterio.", maxChars: 500, resizable: true },
      { field: "sub_4_title", type: "text", label: "Punto 4 — Título", fallback: "Garantía de coherencia", maxChars: 80, resizable: true },
      { field: "sub_4_desc", type: "longtext", plain: true, label: "Punto 4 — Descripción", fallback: "Se asegura que el propósito del negocio se traduzca de forma idéntica, orgánica y fluida en cada canal, logrando que toda la comunicación funcione.", maxChars: 400, resizable: true },
    ],
  },

  /* ───────────── BLOQUE 02 — Prensa ───────────── */
  {
    section: "servicio_02",
    title: "Servicio 02 — Prensa",
    legend: "Dos modalidades (orgánica/pautada) como mini-cards + lista común. Cada lista: un ítem por línea.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (opcional)", fallback: "", maxChars: 40, resizable: true },
      { field: "title", type: "text", label: "Título", fallback: "Prensa", maxChars: 90, resizable: true },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "El servicio de prensa tiene como objetivo lograr que la empresa y su vocero aparezca en medios de comunicación relevantes para su rubro y audiencia. Se trabaja en dos modalidades.",
        maxChars: 400,
        resizable: true,
      },
      { field: "organica_label", type: "text", label: "Modalidad A — Nombre", fallback: "Prensa orgánica", maxChars: 40, resizable: true },
      { field: "organica_items", type: "longtext", plain: true, label: "Modalidad A — Ítems (uno por línea)", fallback: "Se aprovecha la red de contactos del responsable de prensa en medios locales para lograr cobertura de manera espontánea y no pautada.\nLa noticia se instala de forma natural gracias a la relación con periodistas y editores, pero fundamentalmente por la elección de la temática que debe ser de interés genuino, y hasta de servicio al ciudadano.\nMayor credibilidad percibida por el público al no identificarse como publicidad.\nMenor costo, pero requiere una propuesta de valor noticiable y timing adecuado.", maxChars: 900, resizable: true },
      { field: "pautada_label", type: "text", label: "Modalidad B — Nombre", fallback: "Prensa pautada", maxChars: 40, resizable: true },
      { field: "pautada_items", type: "longtext", plain: true, label: "Modalidad B — Ítems (uno por línea)", fallback: "Publicación garantizada en medios mediante inversión publicitaria acordada.\nMás directa y con resultados predecibles en cuanto a aparición y alcance.\nPermite mayor control sobre el mensaje, el formato y el medio elegido.\nIdeal para lanzamientos, campañas o momentos clave del negocio.", maxChars: 700, resizable: true },
      { field: "includes_label", type: "text", label: "Label de la lista común", fallback: "En ambos casos, el servicio incluye", maxChars: 60, resizable: true },
      { field: "includes_items", type: "longtext", plain: true, label: "Lista común (uno por línea)", fallback: "Redacción de la gacetilla de prensa.\nDefinición del ángulo noticioso o novedad a comunicar.\nSelección de medios y gestión de la publicación.\nSeguimiento del impacto y reporte de apariciones (clipping).\nAgenda de vocería en medios.\nInforme final y próximos pasos.", maxChars: 700, resizable: true },
    ],
  },

  /* ───────────── BLOQUE 03 — Relaciones Públicas y Eventos ───────────── */
  {
    section: "servicio_03",
    title: "Servicio 03 — Relaciones públicas y eventos",
    legend: "Lista + párrafo de cierre + sub-servicio destacado. La descripción del sub-servicio admite varios párrafos.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (opcional)", fallback: "", maxChars: 40, resizable: true },
      { field: "title", type: "text", label: "Título", fallback: "Relaciones públicas y eventos", maxChars: 90, resizable: true },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "Las relaciones públicas son el vínculo estratégico entre la empresa o marca personal y sus públicos de interés: clientes, aliados, medios, comunidad y referentes del sector. Dentro de este servicio se incluye la diagramación y organización de eventos como herramienta de comunicación tangible y experiencial.",
        maxChars: 500,
        resizable: true,
      },
      { field: "includes_label", type: "text", label: "Label de la lista", fallback: "El trabajo incluye", maxChars: 40, resizable: true },
      { field: "includes_items", type: "longtext", plain: true, label: "Lista (uno por línea)", fallback: "Definición del objetivo del evento en función de la estrategia comercial (lanzamiento, networking, fidelización, posicionamiento, entre otros).\nArmado de la lista de invitados según el público objetivo y el propósito del encuentro.\nDiseño del concepto del evento y la experiencia que se quiere generar.\nCoordinación logística y comunicacional antes, durante y después del evento.\nGeneración de contenido y cobertura del evento para amplificar su impacto en medios y redes (en caso de que sea compatible).", maxChars: 900, resizable: true },
      { field: "closing", type: "longtext", plain: true, label: "Párrafo de cierre", fallback: "El foco está en que cada evento tenga un impulso estratégico real, y no sea simplemente una acción aislada sin retorno medible.", maxChars: 300, resizable: true },
      { field: "sub_label", type: "text", label: "Sub-servicio — Label", fallback: "Sub-servicio", maxChars: 40, resizable: true },
      { field: "sub_title", type: "text", label: "Sub-servicio — Título", fallback: "Monitoreo de agenda y gestión de oportunidades", maxChars: 90, resizable: true },
      { field: "sub_desc", type: "longtext", plain: true, label: "Sub-servicio — Descripción (admite párrafos)", fallback: "Incluye un seguimiento constante y estratégico de las principales actividades, foros y eventos clave de la región vinculados directamente al nicho de tu negocio. Identificación de dónde tiene que estar la marca de cada empresa, y sugerencia de conexiones de valor.\n\nGestión de invitaciones o accesos preferenciales para que un referente de la empresa pueda participar, consolidando así el posicionamiento institucional y la red de contactos en los espacios que verdaderamente importan.", maxChars: 700, resizable: true },
    ],
  },

  /* ───────────── BLOQUE 04 — Oratoria y Asesoría de Imagen ───────────── */
  {
    section: "servicio_04",
    title: "Servicio 04 — Oratoria y asesoría de imagen",
    legend: "Dos sub-bloques (entrenamiento e imagen). Cada uno con un ítem por línea.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow (opcional)", fallback: "", maxChars: 40, resizable: true },
      { field: "title", type: "text", label: "Título", fallback: "Entrenamiento en oratoria y asesoría de imagen", maxChars: 90, resizable: true },
      {
        field: "intro",
        type: "longtext",
        plain: true,
        label: "Descripción introductoria",
        fallback:
          "Una estrategia de comunicación es tan fuerte como la persona que la transmite. Este servicio trabaja con el vocero o referente de la empresa para que pueda comunicarse con seguridad, claridad y coherencia en cualquier plataforma o instancia pública.",
        maxChars: 500,
        resizable: true,
      },
      { field: "oratoria_label", type: "text", label: "Sub-bloque A — Label", fallback: "El entrenamiento abarca", maxChars: 50, resizable: true },
      { field: "oratoria_items", type: "longtext", plain: true, label: "Sub-bloque A — Ítems (uno por línea)", fallback: "Técnicas de oratoria y manejo del lenguaje verbal y no verbal.\nPreparación específica para entrevistas en medios (radio, TV, prensa escrita, podcast, etc.).\nComunicación efectiva en redes sociales, videos institucionales y presentaciones en vivo.\nGestión de situaciones de crisis comunicacional o Q&A de crisis para estar preparado ante preguntas incómodas.", maxChars: 700, resizable: true },
      { field: "imagen_label", type: "text", label: "Sub-bloque B — Label", fallback: "La asesoría de imagen contempla", maxChars: 50, resizable: true },
      { field: "imagen_items", type: "longtext", plain: true, label: "Sub-bloque B — Ítems (uno por línea)", fallback: "Presentación personal del vocero acorde al mensaje, la audiencia y la plataforma.\nCoherencia entre la imagen de la persona y la identidad de la empresa.\nRecomendaciones de indumentaria, estética y comunicación visual para cada contexto.", maxChars: 500, resizable: true },
    ],
  },

  /* ───────────── CTA FINAL ───────────── */
  {
    section: "cta",
    title: "CTA Final",
    legend: "Cierre de la página, centrado. El botón lleva a /contacto.",
    fields: [
      { field: "eyebrow", type: "text", label: "Eyebrow", fallback: "Conversemos", maxChars: 40, resizable: true },
      { field: "title", type: "text", label: "Título", fallback: "Diseñemos juntos tu estrategia.", maxChars: 90, resizable: true },
      {
        field: "description",
        type: "longtext",
        label: "Bajada",
        fallback: "Cada empresa requiere su propio mix de comunicación.",
        maxChars: 300,
        resizable: true,
      },
      { field: "button_text", type: "text", label: "Texto del botón", fallback: "Agendá una conversación", maxChars: 40, resizable: true },
    ],
  },
]

export function fallbacksFor(section: string): Record<string, string> {
  return fallbacksForIn(SERVICIOS_SECTIONS, section)
}
export function fallbackOf(section: string, field: string): string {
  return fallbackOfIn(SERVICIOS_SECTIONS, section, field)
}
