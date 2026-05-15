# Contexto del Proyecto — Rediseño sanchezmarian.com

## Quién soy
Nicolás Debé. Pasante en GB Consulting (consultora de prensa y comunicación).
Jefa directa: Mariana Sánchez (dueña). Equipo de dos personas.
Estoy a cargo del rediseño completo del sitio web de Marian.

## El sitio actual
URL: sanchezmarian.com
CMS: WordPress (Elementor 4.0.8 + theme GeneratePress)
Problema principal: todas las páginas internas dan 404, sitio en noindex (invisible para Google), contenido Lorem Ipsum en producción.

## El cliente — Marian Sánchez
- Consultora de comunicación y prensa. Dueña de GB Consulting, Mendoza, Argentina.
- Posicionamiento nuevo (a validar con Marian): de "Content Writer" a "Consultora de comunicación estratégica"
- Servicios: Prensa y medios, Copywriting, Asesoría y comunicación, Social Media
- Diferencial clave: relaciones con periodistas, conseguir apariciones en medios para sus clientes
- Personalidad: cálida, argentina, accesible, directa, con propósito
- Tiene fotos profesionales disponibles

## Paleta de color — USAR SIEMPRE ESTA
```
--marino:     #1C2E4A   /* Principal — solidez, profesionalismo */
--terracota:  #C1644A   /* Acento — calidez, CTAs, detalles */
--arena:      #F7F4EF   /* Fondo alternativo — editorial */
--lino:       #D8C9B8   /* Superficies, cards */
--blanco:     #FFFFFF   /* Fondo base */
--marino-osc: #141E2E   /* Footer, secciones oscuras */
--gris-tx:    #5a6070   /* Texto secundario */
```

## Tipografía — USAR SIEMPRE ESTA
- Display/Titulares: Playfair Display (serif, editorial, con autoridad)
- Cuerpo: DM Sans (limpio, moderno, legible)
- Monospace/Tags: DM Mono (para eyebrows, labels, números)

## Estilo visual de referencia
- Inspiración: Creatix template (dark + light sections alternadas, layout en dos columnas, imágenes con overlays, números grandes, marquee animado)
- Personalidad del diseño: editorial + cálido + mediterráneo. NO genérico, NO corporativo frío.
- Tipografía con impronta editorial (Playfair Display en titulares con italic en palabras clave)
- Cursor personalizado, scroll reveal, micro-interacciones
- Secciones oscuras (marino) alternadas con secciones claras (arena/blanco)

## Arquitectura del sitio — 6 páginas
1. Home — Hero + stats + servicios + bio + portfolio de medios + CTA
2. Servicios — Prensa, Copywriting, Asesoría, Social Media (detalle)
3. Sobre Marian — Bio larga, trayectoria, valores, foto
4. En medios — Portfolio de resultados y apariciones
5. Blog — Artículos sobre comunicación y prensa
6. Contacto — Formulario de consulta gratuita

## Estructura del Home (secciones en orden)
1. NAV — Logo "Marian." + links + CTA terracota "Consulta gratis"
2. HERO — 2 columnas: texto izquierda (eyebrow + H1 Playfair + body + 2 CTAs + rating) / foto derecha con badge flotante
3. STATS — Banda marino oscuro: 50+ medios · 30+ clientes · 8 años · 4 servicios
4. IDEAS — 2 columnas: texto izquierda + grid de imágenes asimétrico derecha
5. MARQUEE — Banda terracota animada con los servicios
6. SERVICIOS — Fondo marino oscuro: lista interactiva de servicios + card promo
7. BIO — Fondo arena: frame de foto izquierda + texto bio derecha con tags
8. EN MEDIOS — Fondo blanco: grid de 6 cards con apariciones en medios reales
9. CTA FINAL — Fondo marino: titular + formulario de contacto
10. FOOTER — Marino oscuro: logo + links + copyright

## Stack tecnológico del proyecto
- Cult-ui: componentes de diseño (https://github.com/nolly-studio/cult-ui)
- shadcn/ui: componentes base
- Tailwind CSS: estilos
- Next.js o HTML/CSS puro (a definir)
- Deploy final: WordPress (el cliente mantiene el host ahí)

## Dos preguntas pendientes de validar con Marian
1. ¿Confirma el cambio de posicionamiento de "Content Writer" a "Consultora de comunicación"?
2. ¿Qué hacemos con el lead magnet del checklist (formulario de captura de emails)?

## Lo que ya existe
- Auditoría UX/UI completa con puntuaciones y problemas priorizados
- Concepto visual validado (paleta + tipografía + wireframe)
- Comparación sección por sección entre sitio actual y propuesta nueva
- Demo HTML en producción (descartada — resultó genérica, hay que rehacer)
- Informe PDF completo para presentarle a Marian

## Cómo trabajar conmigo
- Soy estudiante de Comunicación Digital (UCA Mendoza), no desarrollador
- Trabajo con Claude como copiloto: necesito instrucciones claras y código listo para ejecutar
- Cuando algo no está claro, preguntar antes de asumir
- El primer entregable que sale tiene que ser profesional desde el arranque
- Estrategia: ejecutar con Claude en tiempo real para garantizar calidad, consolidar autonomía con la repetición
