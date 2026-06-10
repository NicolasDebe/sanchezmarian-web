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

## CMS Admin — edición de contenido sin tocar código
El sitio tiene un panel de administración para editar los textos de TODO el
sitio desde el navegador. Stack: Next.js 16 + Supabase (auth + Postgres).

### Cómo se usa
- Entrar a `/admin/login` e iniciar sesión (usuario en Supabase Auth;
  hoy: nicodebe05@gmail.com).
- Dashboard en `/admin/dashboard` con una tarjeta por página editable.
- Editores disponibles: `/admin/edit/home`, `/servicios`, `/mis-valores`,
  `/casos-de-exito`, `/contacto`, `/global` (menú + footer) y `/seo` (metadata).
- Clippings de casos de éxito: `/admin/clippings` (alta/edición/baja por
  cliente, con auto-completar desde la URL de la nota).
- Cada editor es un acordeón por sección; cada sección se guarda por separado.
  Los cambios se ven en el sitio público en ~1 minuto.

### Patrón pre/accent/post (textos con acento editorial)
Los textos donde parte va en cursiva + color (bordó/dorado/terracota) se parten
en campos `{x}_pre` / `{x}_accent` / `{x}_post`. El styling vive HARDCODED en el
JSX; Mariana solo edita texto plano por campo y es imposible que rompa el diseño.
Tipos compartidos en `lib/content-schema.ts`. Cada página tiene su esquema:
`lib/{home,servicios,mis-valores,casos,contacto,global,seo}-schema.ts`.
Helpers de lectura: `getPageContent` y `getGlobalContent` (siempre con fallback).
Metadata SEO editable vía `generateMetadata` + `lib/seo.ts` (page="seo",
una sección por página).

### Cómo funciona por dentro
- Tablas Supabase: `content_blocks` (contenido actual, unique en
  page+section+field) y `content_versions` (backup automático del valor anterior
  en cada guardado). Las claves Supabase son legacy JWT (eyJhbGci...).
- `lib/home-schema.ts` es la fuente ÚNICA de verdad: define secciones, campos,
  tipos, labels y los textos de fallback (los originales del código). Lo usan el
  sitio público, el seed y el editor.
- `lib/content.ts` (`getContent` / `getContentBatch`): lectura pública con la
  anon key. NUNCA tiran excepción: si Supabase falla, devuelven el fallback, así
  el build de Vercel jamás rompe por Supabase.
- El home (`app/page.tsx`) es estático con `revalidate = 60`; el save action hace
  `revalidatePath('/')`.
- Auth/escritura: `proxy.ts` (en Next 16 el middleware se llama "proxy") protege
  `/admin/*`; `app/admin/actions.ts` tiene `signIn`, `signOut` y
  `saveContentSection` (escribe con service_role, hace backup de versiones).
- Seed inicial: `npx tsx scripts/seed-content.ts` (idempotente, ~43 filas).

### Clippings de /casos-de-exito (sistema completo, 2026-06-10)
- Tablas Supabase: `clients` (slug único, name, logo_url, order_position,
  is_active) y `clippings` (client_id FK con cascade, medium, title,
  published_at DATE, scope local/nacional/regional/internacional, format
  Digital/Gráfico/TV/Radio/Streaming — define el color del borde de la card —,
  url, order_position). SQL en `supabase/migrations/20260610_clients_clippings.sql`
  (idempotente, se pega en el SQL Editor del dashboard).
- Seed: `npx tsx scripts/seed-clippings.ts` (idempotente: clients por slug,
  clippings por client+url; 11 clientes, 90 clippings con fecha placeholder
  año-mes-01 — Mariana corrige las fechas reales desde el admin).
- Lectura pública: `getClientsWithClippings()` en `lib/clippings.ts` (anon key,
  orden published_at DESC). Si Supabase falla o las tablas no existen, cae al
  fallback hardcoded de `data/clippings.ts` y la página se ve idéntica.
- Admin: `/admin/clippings` (grid de clientes con contador) →
  `/admin/clippings/{slug}` (tabla + modal alta/edición + eliminar con confirm).
  El modal tiene "Auto-completar desde URL": pega el link de la nota y un server
  action (cheerio, timeout 5s) llena medio/título/fecha desde Open Graph y
  JSON-LD. Server actions en `app/admin/(panel)/clippings/actions.ts`.
- El carrusel "Coberturas destacadas" (12 cards rotativas) sigue siendo una
  curaduría fija por ids de `data/clippings.ts` (decisión: es contenido curado,
  no un listado). Lo mismo el grid del home.

### Pendiente (próxima iteración)
- Correr la migración SQL de clippings en el dashboard + seed (paso manual,
  ver arriba). Hasta entonces el admin de clippings muestra el aviso de setup
  y la página pública usa el fallback.
- Páginas secundarias (`/campanas`, `/privacidad`, `/terminos`, `/sobre-marian`)
  usan Nav/Footer con sus textos de fallback (no leen `global` aún). Se ven
  idénticas; si se editan los textos globales, esas páginas no los reflejan.

### Reglas críticas (no romper)
1. Rutas admin SIEMPRE con `export const dynamic = 'force-dynamic'`.
2. `getContent`/`getContentBatch` SIEMPRE con fallback; nunca tiran excepción.
3. Usar las legacy keys (eyJhbGci...), NO el formato sb_publishable_/sb_secret_.
4. Lecturas públicas con el cliente de `lib/supabase.ts` (anon); el server client
   de `@supabase/ssr` es solo para el admin.

## Cómo trabajar conmigo
- Soy estudiante de Comunicación Digital (UCA Mendoza), no desarrollador
- Trabajo con Claude como copiloto: necesito instrucciones claras y código listo para ejecutar
- Cuando algo no está claro, preguntar antes de asumir
- El primer entregable que sale tiene que ser profesional desde el arranque
- Estrategia: ejecutar con Claude en tiempo real para garantizar calidad, consolidar autonomía con la repetición
