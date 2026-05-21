export type Article = {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  body: string[]
}

export const ARTICLES: Article[] = [
  {
    slug: "como-conseguir-que-un-periodista-te-cubra",
    title: "Cómo conseguir que un periodista te cubra (sin conocerlo de antes)",
    category: "Prensa",
    date: "Dic 2024",
    readTime: "6 min",
    excerpt:
      "Tener relaciones con periodistas ayuda, pero no es el único camino. Te cuento las estrategias que funcionan para conseguir cobertura desde cero.",
    body: [
      "El primer error que cometen la mayoría de las marcas al buscar cobertura mediática es pensar que necesitan un 'contacto' dentro del medio. La realidad es más simple y más exigente al mismo tiempo: los periodistas publican lo que es noticia. Tu trabajo es demostrarles que tu historia lo es.",
      "Antes de enviar cualquier comunicado, preguntate: ¿qué tiene de nuevo, relevante o sorprendente esto que quiero comunicar? ¿A quién le importa más allá de mi empresa? ¿Qué dice este hecho sobre algo más grande que está pasando en el sector, la economía o la sociedad? Si no podés responder esas preguntas con claridad, el periodista tampoco va a poder hacerlo.",
      "Una vez que tenés el ángulo correcto, el siguiente paso es encontrar al periodista adecuado. No se trata de mandar un correo masivo a toda la redacción: se trata de identificar quién cubre tu tema, leer sus últimas notas y personalizar tu propuesta. Un periodista que recibe un mensaje que claramente fue pensado para él responde mucho más que uno que recibe el mismo boletín que otros cien.",
      "El seguimiento también importa. Un solo email raramente alcanza. Si no tuviste respuesta en 48 horas, un recordatorio breve y respetuoso puede marcar la diferencia. Lo que nunca funciona es la insistencia agresiva: en comunicación, quemar un contacto es fácil y caro.",
    ],
  },
  {
    slug: "5-errores-de-comunicacion-de-emprendedores",
    title: "Los 5 errores de comunicación que cometen los emprendedores",
    category: "Comunicación",
    date: "Nov 2024",
    readTime: "5 min",
    excerpt:
      "Desde comunicar sin estrategia hasta ignorar los medios locales. Estos son los errores más comunes — y cómo evitarlos.",
    body: [
      "La comunicación no es algo que se hace cuando sobra tiempo. Es parte del negocio. Sin embargo, la mayoría de los emprendedores la tratan como una tarea secundaria y pagan el costo en visibilidad y credibilidad.",
      "El primero y más frecuente de los errores es comunicar sin un relato claro. Hablar de todo a la vez — productos, valores, logros, novedades — diluye el mensaje y no deja huella. El segundo error es creer que las redes sociales reemplazan a la prensa: tienen propósitos distintos y audiencias distintas. El tercero es ignorar los medios locales, que suelen ser más accesibles y tienen una audiencia más calificada para muchos negocios.",
      "El cuarto error es no tener un porta-voz preparado. Cuando un periodista llama, no hay tiempo para pensar. Y el quinto — quizás el más costoso — es no medir nada. Sin datos, es imposible saber qué funciona y mejorar.",
      "Evitar estos errores no requiere un presupuesto enorme. Requiere claridad, consistencia y la voluntad de tratar la comunicación como lo que es: una herramienta estratégica de crecimiento.",
    ],
  },
  {
    slug: "tu-historia-de-marca-como-encontrarla",
    title: "Tu historia de marca: cómo encontrarla y contarla bien",
    category: "Relaciones Públicas",
    date: "Oct 2024",
    readTime: "7 min",
    excerpt:
      "Todas las marcas tienen una historia. El problema es que pocas saben cómo contarla. Te explico el proceso que uso con mis clientes.",
    body: [
      "Antes de hablar con un solo periodista o publicar un solo post, necesitás tener claro quién sos y qué diferencia hacés. No en términos de producto o servicio, sino en términos de propósito: por qué hacés lo que hacés, a quién le cambia la vida y de qué forma.",
      "El proceso que uso con mis clientes empieza siempre con tres preguntas: ¿de dónde venís?, ¿qué problema resolvés que nadie más resuelve de la misma manera?, y ¿qué querés que la gente diga de vos cuando no estás en la sala? Las respuestas a esas preguntas, bien trabajadas, son el núcleo de tu historia de marca.",
      "Una vez que tenés ese núcleo, todo lo demás — los mensajes, los canales, los tonos — se vuelve mucho más fácil de construir. El storytelling no es mentirle al público: es encontrar la versión más honesta y más atractiva de la verdad.",
    ],
  },
  {
    slug: "por-que-tu-instagram-no-convierte",
    title: "Por qué tu Instagram no convierte (y qué hacer al respecto)",
    category: "Comunicación",
    date: "Sep 2024",
    readTime: "5 min",
    excerpt:
      "El problema no es la cantidad de seguidores ni el algoritmo. Es la coherencia entre lo que publicás y lo que querés lograr.",
    body: [
      "Muchas marcas tienen miles de seguidores y ningún cliente nuevo. El algoritmo es el chivo expiatorio favorito, pero rara vez es el culpable real. El problema, en la mayoría de los casos, es más simple y más difícil de resolver: falta de coherencia entre el mensaje, la audiencia y el objetivo.",
      "Instagram es una herramienta de relación, no de venta directa. Cuando se usa para vender todo el tiempo, la gente deja de escuchar. Cuando se usa para mostrar quién sos, cómo pensás y qué hacés diferente, se convierte en el mejor captador de clientes cualificados que existe.",
      "El primer paso para arreglar un Instagram que no convierte no es cambiar el diseño ni publicar más seguido. Es hacerse una pregunta incómoda: ¿quién es exactamente la persona que quiero que me siga, y qué tiene que ver en mi perfil para que quiera trabajar conmigo?",
    ],
  },
  {
    slug: "gacetilla-de-prensa-que-es-y-como-escribir-una",
    title: "Gacetilla de prensa: qué es y cómo escribir una que se publique",
    category: "Prensa",
    date: "Jul 2024",
    readTime: "6 min",
    excerpt:
      "La gacetilla es la herramienta básica de la prensa. Pero la mayoría se escribe mal. Te muestro el formato que usan los medios para decidir qué publican.",
    body: [
      "La gacetilla de prensa es, en su forma más simple, un documento que cuenta una noticia desde la perspectiva de quien la genera. El objetivo no es convencer al lector de que tu noticia es importante: es darle al periodista todo lo que necesita para publicarla sin tener que investigar de más.",
      "El error más común es escribir una gacetilla como si fuera un aviso publicitario. Los periodistas reciben decenas por día; las que hablan de 'innovación disruptiva' o 'soluciones de vanguardia' van directo a la papelera. Las que funcionan hablan de hechos concretos, tienen un ángulo claro y responden las cinco W básicas: quién, qué, cuándo, dónde y por qué.",
      "El formato ideal arranca con el dato más importante en el primer párrafo, desarrolla el contexto en el segundo y tercero, incluye una cita de un vocero real en el cuarto, y cierra con los datos de contacto del responsable de prensa. Nada más. Una gacetilla que ocupa más de una carilla es una gacetilla que no se va a leer.",
    ],
  },
  {
    slug: "comunicacion-en-crisis-como-proteger-tu-reputacion",
    title: "Comunicación en crisis: cómo proteger tu reputación",
    category: "Comunicación",
    date: "Jun 2024",
    readTime: "8 min",
    excerpt:
      "Cuando algo sale mal, la comunicación puede ser tu mayor activo o tu peor enemigo. Las claves para manejar una crisis sin empeorarla.",
    body: [
      "La mayoría de las crisis de reputación no matan a las marcas. Lo que las mata es la respuesta equivocada: el silencio prolongado, la negación de hechos evidentes o el mensaje que suena a cobertura antes que a responsabilidad.",
      "El primer principio de la comunicación de crisis es simple y contraintuitivo: antes de hablar con el público, hablá con los afectados. Las personas que se sintieron perjudicadas o ignoradas necesitan saber que fueron escuchadas antes de que nadie más lo sepa. Eso no es debilidad — es la base de cualquier recuperación de confianza.",
      "El segundo principio es controlar el ritmo de la información. Una crisis que se deja crecer en el silencio se alimenta de rumores y especulaciones. Una comunicación activa, aunque sea para decir 'estamos evaluando la situación y daremos novedades en 24 horas', cierra el espacio para las versiones no controladas.",
      "El tercer principio, y el más importante a largo plazo, es que toda crisis bien manejada es una oportunidad de mostrar quién sos cuando las cosas se ponen difíciles. Las marcas que más credibilidad ganan son las que demuestran honestidad exactamente cuando más les cuesta.",
    ],
  },
  {
    slug: "newsletter-vs-redes-sociales",
    title: "Newsletter vs redes sociales: cuál funciona mejor para tu negocio",
    category: "Comunicación",
    date: "May 2024",
    readTime: "5 min",
    excerpt:
      "No son excluyentes, pero tampoco son iguales. Te ayudo a decidir en cuál invertir tu tiempo y energía según tus objetivos.",
    body: [
      "Existe una diferencia fundamental entre las redes sociales y el newsletter que pocas marcas tienen en cuenta a la hora de planificar su comunicación: en las redes, alquilás audiencia; en el newsletter, la poseés. Cuando Instagram cambia el algoritmo o una plataforma cierra, tu lista de correo sigue siendo tuya.",
      "Dicho esto, las redes sociales tienen ventajas que el newsletter no puede reemplazar: alcance orgánico, descubrimiento y viralidad. Son el lugar donde la gente nueva te encuentra. El newsletter es el lugar donde construís una relación profunda con quien ya confía en vos.",
      "La estrategia más efectiva no es elegir uno sobre el otro, sino entender para qué sirve cada herramienta. Las redes para atraer; el newsletter para convertir y retener. Si tenés que priorizar con recursos limitados, la pregunta clave es: ¿estoy en la etapa de hacer crecer mi audiencia o de profundizar la relación con la que ya tengo?",
    ],
  },
  {
    slug: "marca-personal-para-profesionales",
    title: "Marca personal para profesionales: la guía que nadie te da",
    category: "Relaciones Públicas",
    date: "Abr 2024",
    readTime: "9 min",
    excerpt:
      "Construir una marca personal no es vanidad, es estrategia. Todo lo que necesitás saber para posicionarte como referente en tu industria.",
    body: [
      "La marca personal no es un perfil de LinkedIn optimizado ni una foto de portada profesional. Es la percepción que tienen de vos las personas que importan para tu carrera o negocio — y esa percepción existe te ocupes de ella o no. La pregunta es si vas a dejarla al azar o vas a gestionarla con intención.",
      "El primer paso para construir una marca personal sólida es definir con precisión a quién le estás hablando. Muchos profesionales cometen el error de intentar ser relevantes para todos y terminan siendo invisibles para todos. Cuanto más específico sea tu público objetivo, más fácil es construir autoridad ante él.",
      "El segundo paso es elegir un formato de comunicación que se adecue a tu manera de ser. No todo el mundo tiene que tener un podcast ni escribir artículos largos. Lo que importa es la consistencia: una persona que aparece regularmente en un solo canal con contenido de valor se posiciona mucho más rápido que una que prueba todo y sostiene nada.",
      "Por último: la marca personal se construye comunicando lo que hacés, pero también lo que pensás. Los profesionales que comparten su punto de vista sobre los temas de su industria — incluso cuando es polémico — son los que se vuelven referentes. La visibilidad sin posición es solo ruido.",
    ],
  },
]

export const CATEGORY_COLORS: Record<string, string> = {
  Prensa: "bg-marino/8 text-marino",
  Comunicación: "bg-terracota/10 text-terracota",
  "Relaciones Públicas": "bg-lino text-marino",
}

export const CATEGORY_STRIP: Record<string, string> = {
  Prensa: "bg-marino",
  Comunicación: "bg-terracota",
  "Relaciones Públicas": "bg-lino",
}
