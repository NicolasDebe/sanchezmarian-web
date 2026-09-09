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

### Texto enriquecido (Tiptap global, 2026-06-11)
- TODOS los campos `longtext` editables usan Tiptap (`RichTextEditor`) en el
  admin y se renderizan con `<RichText />` (`components/ui/RichText.tsx`) en el
  sitio. EXCEPCIONES marcadas con `plain: true` en los esquemas (siguen siendo
  textarea + texto plano): las meta descriptions de `seo`, `servicios/hero/h1`
  (es un H1) y `mis_valores/bio/paragraph_1_pre` (patrón pre/accent).
- `lib/rich-text.ts`: utils compartidos — `plainToHtml` (doble salto = `<p>`,
  salto simple = `<br/>`, escapa & < >), `hasHtmlTags`, `htmlToPlainText`
  (contadores y vistas breves) y `sanitizeHtml` (allowlist propia, sin
  DOMPurify/jsdom; permite los tags/clases del contenido legacy de campañas:
  p.lead, blockquote.dark, footer, style en links).
- `<RichText html={...} />`: null si vacío; texto plano legacy se envuelve en
  `<p>` automáticamente (los fallbacks de los esquemas siguen siendo texto
  plano y se ven idénticos). Dos contextos de estilo en globals.css:
  `.rich-content` (artículos: detalle de campañas) y `.rich-inline` (longtext
  embebido en componentes: los `<p>` heredan tipografía/color del wrapper —
  clave para que las páginas se vean IDÉNTICAS al diseño original).
- Migraciones de datos (idempotentes, con backup en `content_versions`):
  `npx tsx scripts/migrate-longtext-to-html.ts` y
  `npx tsx scripts/migrate-campaigns-to-html.ts`. ⚠ Correr SIEMPRE después de
  deployar el código que renderiza con RichText (el código viejo mostraría los
  tags literales).
- El contador de caracteres del admin mide el texto visible (sin tags). El
  RichTextEditor agrega `https://` automáticamente a links sin protocolo.

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

### Campañas (CRUD completo, 2026-06-11)
- Tablas Supabase: `campaigns` (slug único, brand, title, description, content
  HTML, status, date texto "Junio 2026") y `campaign_images` (campaign_id FK,
  url, alt, position — menor position = foto destacada). Bucket Storage
  público `campaign-images`, archivos en `{slug}/{timestamp}-{random}-{nombre}`.
- Status canónicos: `draft` / `active` / `finished` (labels Borrador/Activa/
  Finalizada). Migración `supabase/migrations/20260611_campaigns_status.sql`
  (idempotente, pegar en el SQL Editor) convierte los legacy ACTIVA/FINALIZADA
  y extiende el CHECK constraint. HASTA CORRERLA la base rechaza drafts: el
  código normaliza al leer (`normalizeStatus`) y al escribir reintenta con el
  valor legacy (`legacyStatus`); guardar un borrador devuelve un error claro
  pidiendo correr la migración.
- Público: `/campanas` (revalidate 60, `getPublicCampaigns()` filtra drafts,
  fallback hardcoded en `data/campaigns-fallback.ts` si Supabase falla) y
  `/campanas/[slug]` (force-dynamic, detalle con `.rich-content` de
  globals.css; contenido legacy en texto plano se envuelve en `<p>` vía
  `ensureHtml`). Drafts: 404 salvo `?preview=true` + sesión activa (banner
  "Borrador — vista previa").
- Admin: `/admin/campanas` (lista con filtros por status vía query param,
  buscador client-side, eliminar con modal + toast), `/admin/campanas/nueva` y
  `/admin/campanas/{slug}/editar` (form compartido
  `components/admin/campaign-form.tsx`: slug auto-generado con slugify +
  chequeo de unicidad con debounce, fecha con input month ⇄ "Junio 2026",
  contadores de caracteres, footer sticky Guardar borrador/Publicar,
  publicar exige ≥1 foto). Server actions en
  `app/admin/(panel)/campanas/actions.ts` (create/update/delete campaña,
  upload/delete imagen con compactación de positions, checkSlugAvailability,
  updateImageAlt, reorderImages).
- Editor de contenido: `components/admin/RichTextEditor.tsx` (Tiptap v3,
  StarterKit con link integrado — NO agregar @tiptap/extension-link aparte,
  duplica la extensión — `immediatelyRender: false` obligatorio por SSR).
- Fotos: `components/admin/PhotoManager.tsx` (sesión 2026-06-11). Drag & drop
  para reordenar con @dnd-kit (PointerSensor distance 8 + KeyboardSensor:
  Space + flechas; fallback de botones subir/bajar en cada card), alt editable
  inline (lápiz → input → check, máx. 200 chars), eliminar individual, badge
  "Destacada" en la primera card (= la de menor position; ojo: las campañas
  seed tienen positions desde 1, las nuevas desde 0 — siempre comparar por
  orden, no por position === 0). Compresión client-side ANTES del upload con
  browser-image-compression (maxSizeMB 2, maxWidthOrHeight 2400, convierte a
  .webp, skip si el original pesa <500KB, fallback al original si falla; el
  límite del archivo original es 10MB, el server action sigue aceptando 5MB
  post-compresión). Dos modos: edición (campaignId presente → cada cambio se
  persiste al instante, optimistic UI con revert + toast) y campaña nueva
  (las fotos quedan como object URLs locales y se suben al bucket recién al
  guardar, vía `flushPending(slug)` expuesto por ref — si createCampaign
  falla, el retry no re-sube las que ya subieron). reorderImages hace upsert
  en batch (una sentencia) y revalida /campanas y el detalle.
- `next.config.ts`: `serverActions.bodySizeLimit: "8mb"` (fotos hasta 5MB van
  por server action).
- deleteCampaign borra primero los archivos del bucket (por URL parseada y por
  carpeta del slug) y las filas de `campaign_images` explícitamente (no
  depende de cascade).
- Tests: `npx tsx scripts/e2e-campaigns.ts` con el dev server corriendo
  (auto-limpiante; crea y borra usuario y campaña de prueba). Para el
  PhotoManager: `npx tsx scripts/e2e-photo-manager.ts` (Playwright con el
  Edge del sistema vía playwright-core, headless; prueba drag con mouse y
  teclado, alt, compresión real, delete, flush de pendientes y touch/mobile.
  `playwright-core` está en devDependencies porque tsconfig typecheckea
  `scripts/` en el build — si se quita, Vercel rompe con TS2307).
  `scripts/audit-campaign-images.ts` imprime schema y positions actuales.

### Reseñas con moderación (base de datos + capa de datos, 2026-09-08)
Sistema de reseñas de marcas/clientes y periodistas, con moderación manual.
(Nació con doble opt-in por mail; se sacó el 2026-09-09, ver más abajo.) **Este paso es SOLO backend: todavía no hay UI ni rutas.**

- Tabla Supabase `testimonials`. SQL en
  `supabase/migrations/20260908_testimonials.sql` (idempotente, se pega en el
  SQL Editor del dashboard). Columnas: `reviewer_type` ('marca' | 'periodista'),
  datos del autor (`author_name`, `author_role`, `author_brand`, `author_url`),
  `rating` (1-5), `body`, `author_email` (NUNCA se muestra en público),
  `status`, campos de moderación (`moderation_note`, `moderated_at`,
  `moderated_by`), de verificación (`verification_token`,
  `verification_expires_at` = 7 días, `verified_at`), `published_at`,
  `created_at` y antiabuso (`ip_hash`, `user_agent`).
  Índices: `status`, `published_at DESC` y `verification_token` (UNIQUE: es la
  clave del link de verificación, una colisión verificaría la reseña
  equivocada).

- **Flujo de estados** (desde 2026-09-09, sin doble opt-in):

  ```
  [envío del form] → pending_review ──Marian decide──┬─→ published
                                                     └─→ rejected
                                                           ↕
                                              (se puede republicar/bajar)
  ```

  - `pending_review` → recién enviada, esperando moderación.
  - `published` → visible en el sitio.
  - `rejected` → descartada; `moderation_note` guarda el motivo (uso interno,
    no se le manda al autor).
  - `pending_verification` sigue en el CHECK de la tabla y en el tipo, pero
    NADA lo produce: es del flujo viejo.

  **La moderación es el ÚNICO filtro.** Lo que reemplaza a la confirmación por
  mail es que Marian conoce a quien la reseña y que cada reseña exige un link a
  un perfil público, que se abre desde el panel antes de aprobar.

- **RLS**: activado, con UNA sola policy pública — `SELECT` donde
  `status = 'published'`. Ninguna policy de insert ni de update para anon: todas
  las escrituras pasan por `createAdminClient()` con `SUPABASE_SERVICE_ROLE_KEY`.
  Además hay `GRANT SELECT` **por columna** para anon/authenticated: la policy
  deja pasar la fila entera y la anon key es pública, así que sin los grants
  cualquiera podría leer `author_email`, `ip_hash` o `verification_token` de las
  reseñas publicadas.

- `lib/testimonials.ts` (SOLO servidor). Lectura pública con la anon key,
  escritura y lectura de admin con el service role. Las lecturas nunca tiran
  excepción (devuelven `[]` / resumen vacío), igual que `getContent`:
  - `getPublishedTestimonials(limit?, reviewerType?)` — publicadas, orden
    `published_at DESC`, con filtro opcional por tipo de reseñador.
  - `getRatingSummary()` — `{ average, count, countMarcas, countPeriodistas }`.
    El promedio va sobre TODAS las publicadas juntas, sin distinguir tipo,
    redondeado a un decimal.
  - `createTestimonial(input, meta?)` — valida con zod, hashea el IP con
    `sha256(ip + TESTIMONIAL_IP_SALT)`, inserta en `pending_verification` y
    devuelve el token del link de confirmación (⚠ el token NO va en la
    respuesta HTTP: es solo para armar el mail).
  - `verifyTestimonial(token)` — resultado tipado
    (`ok | already_verified | expired | not_found | error`), nunca lanza.
  - `getAllTestimonials()` / `getPendingCount()` — para el panel y el badge.
  - `publishTestimonial(id, adminEmail)` / `rejectTestimonial(id, note, adminEmail)`.
  - **El contenido de una reseña es inmutable**: ninguna función actualiza
    `body`, `rating` ni los datos del autor. Solo status, moderación y
    verificación.

- `lib/testimonials-schema.ts` — validación con zod (fuente única de los
  límites, la comparten cliente y servidor). `author_name` 3-80, `author_role`
  3-80, `author_brand` 2-80, `author_url` obligatoria y restringida a
  `http(s)` (así no entra un `javascript:` a un href del sitio), `rating`
  entero 1-5, `body` 80-1200, `author_email` válido. Mensajes en castellano
  rioplatense. `toFieldErrors()` aplana los issues a `{ campo: mensaje }`.
  Ojo con el orden: el `.trim()` va antes del formato (vía `.pipe()`), porque
  la gente pega mails y enlaces con espacios al final.

- `zod` pasó a ser dependencia directa (`package.json`). Antes estaba en
  `node_modules` solo como dependencia transitiva de `eslint-config-next`.

- Env var nueva: `TESTIMONIAL_IP_SALT` (cualquier string aleatorio largo). Sin
  ella `ip_hash` se guarda en `null` y queda un warning en los logs — el alta
  funciona igual, pero se pierde la señal antiabuso **y con ella el rate limit
  del formulario, que se apoya en el hash**.

### Reseñas — formulario público (2026-09-08)
Segundo paso: la parte que ve la gente. Sigue sin haber panel de moderación ni
sección de reseñas en el sitio.

- **`/resenas/nueva`** (`app/resenas/nueva/page.tsx` + `components/resena-nueva-content.tsx`).
  Vive FUERA del grupo `(site)` a propósito: es una página autónoma para
  compartir por WhatsApp, sin Navbar ni Footer (solo un wordmark que linkea al
  home). Mobile-first, ancho máximo 680px. Copy hardcodeado por ahora, con el
  patrón pre/accent en el H1 ("Contá cómo fue" / *"trabajar con Marian."*) y la
  animación de `hero-reveal` como el resto de los heros.

- **`components/resena-form.tsx`**. El primer campo es "¿Desde dónde escribís?"
  (dos botones grandes tipo toggle, sin default). La elección cambia las
  etiquetas de cargo / marca-medio / link, y hasta que no está elegida el resto
  va dentro de un `<fieldset disabled>` atenuado — deshabilitado de verdad, no
  solo en apariencia. Valida con el MISMO esquema zod que el servidor, así los
  mensajes son idénticos de los dos lados.

- **`components/star-input.tsx`**. Radiogroup REAL: `<fieldset>` + cinco
  `<input type="radio">` en `sr-only` (NO `display:none`, que los sacaría del
  orden de tabulación). Las flechas navegan porque lo hace el navegador, no
  porque haya código para eso; cada opción tiene `aria-label="N de 5"`. Sin
  valor por defecto. Dorado `#C9A882` las activas, gris-bordo al 20% las
  inactivas. Ojo en los tests: al radio hay que llegarle por el `<label>`, un
  click directo al input lo intercepta el span.

- **`POST /api/resenas`**. Filtros en orden: honeypot (`website`, oculto con CSS
  fuera de pantalla — devuelve 200 con éxito simulado y NO inserta) → rate limit
  (3 por `ip_hash` cada 24h, 429 con mensaje amable) → zod (422 con errores por
  campo) → insert en `pending_review` → aviso al equipo con `after()` (después
  de responder, así el formulario no espera a Resend). El éxito y el honeypot
  devuelven EL MISMO texto: si el bot recibiera algo distinto, aprendería que
  lo detectamos.

- **Mail con Resend** (`lib/testimonials-email.ts`). Queda UNO solo: el aviso
  al equipo de que hay una reseña para moderar, asunto "Reseña nueva para
  revisar · [nombre] de [marca]". Sale desde `info@sanchezmarian.com`
  (`SITE_EMAIL`) y llega a `MODERATION_NOTIFY_EMAIL` o, si no está seteada, a
  `SITE_EMAIL`. Es best-effort: si falla se loguea y nada se rompe — la reseña
  ya está guardada y el badge del panel la cuenta. **Sin `RESEND_API_KEY` el
  sistema entero funciona igual**, solo que nadie recibe el aviso y hay que
  mirar el panel. Todo el texto de usuario se escapa antes de entrar al HTML.
  `npx tsx scripts/preview-emails.ts` lo escribe a `.preview-emails/`.

- Env vars, TODAS opcionales desde que se sacó el doble opt-in:
  `RESEND_API_KEY` y `MODERATION_NOTIFY_EMAIL` (sin ellas no llega el aviso de
  moderación, pero las reseñas entran igual), `TESTIMONIAL_IP_SALT` (sin ella
  no hay rate limit) y `NEXT_PUBLIC_SITE_URL` (si falta, los links salen al
  dominio canónico de `lib/seo.ts`).

- Tests: `npx tsx scripts/e2e-resena-form.ts` (Playwright con el Edge del
  sistema; 38 checks de interacción y accesibilidad, NO toca la base porque
  intercepta el POST) y `npx tsx scripts/e2e-resenas.ts` (API + base, requiere
  la migración corrida; auto-limpiante por prefijo de email).

### Reseñas — página pública y bloque del home (2026-09-08)
Tercer paso: mostrar las reseñas publicadas. Sigue faltando el panel de
moderación.

- **`/resenas`** (`app/(site)/resenas/page.tsx`). DENTRO del grupo `(site)`, a
  diferencia de `/resenas/nueva`: está en el menú, así que necesita Navbar y
  Footer. `revalidate = 60`. Todo el fetch vive en el server component
  (`getPublishedTestimonials` + `getRatingSummary` + contenido + escalas) y baja
  por props; los componentes client no leen datos.

- **Reglas duras** (están en el código con su porqué, no las bajes sin pensar):
  · el promedio solo se muestra con **5 reseñas o más** (con menos no significa
    nada); · los chips de filtro (Todas / Marcas / Periodistas, con contador,
    client-side sin recargar) solo con **8 o más Y al menos 2 de cada tipo**;
  · el bloque de adelanto devuelve `null` con **menos de 2** publicadas.

- **Una sola lista mezclada** por `published_at desc`, dos columnas en desktop.
  No se parte en dos bloques por tipo: con pocas reseñas quedarían dos secciones
  casi vacías. Nada de carrusel.

- **SIN `AggregateRating` de schema.org**, a propósito: Google no muestra
  estrellas para reseñas que una organización aloja sobre sí misma, así que no
  aporta SEO y puede leerse como marcado engañoso. No agregarlo "por las dudas".

- `components/star-rating.tsx` (solo lectura, `role="img"` con
  aria-label "4 de 5 estrellas") y `components/resena-card.tsx` (fondo arena,
  sin sombra; etiqueta de tipo arriba a la derecha: PERIODISTA en bordó con
  borde, MARCA en gris discreto — la distinción es deliberada, una reseña de
  periodista respalda algo distinto que la de un cliente). La fecha se formatea
  parseando el string ISO, NO con `new Date()`: así el mes es idéntico en server
  y cliente y no hay error de hidratación por huso horario.

- **`components/resenas-preview.tsx`**, reutilizable, insertado en el home
  (entre Conexiones y Bio, `bg-hueso`) y al final de `/servicios` (después de
  Conexiones, `bg-hueso-oscuro`) para respetar la alternancia de fondos de cada
  página. Orden siempre `published_at desc`; ÚNICA excepción: si hay alguna
  reseña de periodista publicada y ninguna entra en las 3 más recientes, la de
  periodista más reciente ocupa el tercer lugar (respalda la promesa de
  "relaciones reales con periodistas" del hero). Por eso las dos páginas leen
  TODAS las publicadas, no solo 3.

- Copy editable en `content_blocks` con `page='resenas'`
  (`lib/resenas-schema.ts`, tres secciones: `hero`, `preview`, `empty`), editor
  en `/admin/edit/resenas`. El texto del pie tiene una redacción fija que NO hay
  que aflojar: "Cada reseña la escribe la persona que la firma y se publica sin
  editar el texto. Podés verificar quién es cada una desde su perfil público."
  Nunca decir que se publican todas las recibidas: hay aprobación interna.

- "Reseñas" agregado a `NAV_ITEMS` (`lib/constants.ts`), que alimenta Navbar y
  Footer a la vez, más `link_resenas` en `global/nav` y la sección `resenas` en
  el esquema de SEO.

- `/dev/resenas-harness` es un banco de pruebas con datos falsos que da **404 en
  producción**; existe para poder verificar la UI mientras no haya reseñas
  reales. Lo usa `npx tsx scripts/e2e-resenas-publicas.ts` (33 checks de las
  reglas duras + `pickPreview`).

### Reseñas — panel de moderación (2026-09-09)
Cuarto y último paso del sistema de reseñas. Con esto el circuito está completo:
alguien la escribe → confirma su mail → Marian decide → se ve en el sitio.

- La migración `20260908_testimonials.sql` YA ESTÁ CORRIDA en Supabase
  (verificado: la tabla existe y la RLS bloquea a anon en `author_email`,
  `verification_token` y en cualquier insert).

- **`/admin/resenas`** (`app/admin/(panel)/resenas/`): `page.tsx` (server,
  `force-dynamic`, hace TODO el fetch), `resenas-manager.tsx` (client, solo
  recibe props: el service role nunca se acerca al browser) y `actions.ts`.
  Sigue el patrón visual de `/admin/clippings`: ancho 960, eyebrow mono +
  H1 Playfair `clamp(40px,5vw,56px)`, contenedores sobre hueso-oscuro con borde
  `rgba(201,168,130,0.3)`.

- **Tres pestañas** (`role="tablist"` con roving tabindex y flechas), en el
  orden en que se trabajan: **Para revisar** (abierta por defecto), Publicadas,
  Rechazadas. Cada una con su contador, y adentro el desglose por tipo
  ("3 reseñas · 2 de marcas · 1 de periodista").
  Las `pending_verification` NO se muestran en ninguna pestaña: el autor
  todavía no confirmó el mail, no hay nada para decidir sobre ellas.

- **Cada fila** muestra todo lo necesario para decidir sin abrir nada: etiqueta
  de tipo, estrellas, nombre, cargo, marca/medio, link al perfil (target blank +
  rel noopener), el cuerpo COMPLETO sin truncar, el mail con la fecha en que se
  verificó, la fecha de envío, y —si ya pasó por moderación— `moderated_by`,
  `moderated_at` y el `moderation_note`.

- **Acciones por estado**:
  · Para revisar → **Publicar** (confirmación simple, sin motivo) y **Rechazar**.
  · Publicadas → Ver en el sitio y **Despublicar**.
  · Rechazadas → **Publicar** (moderar mal no es irreversible).

- **Despublicar ≠ rechazar.** Rechazar es una decisión tomada; despublicar baja
  la reseña del sitio y la devuelve a `pending_review`, o sea a la cola, y por
  eso vuelve a contar en el badge de pendientes: queda una decisión abierta.
  Lo hace `unpublishTestimonial` (lib/testimonials.ts), con `.eq("status",
  "published")` para no pisar una decisión más nueva tomada en otra pestaña.
  `published_at` no se borra (registro de que estuvo online; nadie lo lee salvo
  con status publicado).

- **Las dos acciones que piden motivo** (rechazar y despublicar) comparten un
  diálogo con textarea, tan accesible como `ConfirmDialog` (foco al abrir,
  Escape, click afuera). El motivo es OBLIGATORIO y de mínimo
  `MODERATION_NOTE_MIN` = 10 caracteres, constante de lib/testimonials.ts que
  valida el SERVIDOR; el diálogo solo adelanta el aviso ("escribí N caracteres
  más"). Es el único registro de por qué se bajó algo, y un "no" suelto no le
  sirve a nadie dentro de seis meses. Es interno: no se le manda al autor.
  El diálogo se monta con `key` por reseña para que cada apertura arranque
  vacío sin un setState en un efecto (lo prohíbe `react-hooks/set-state-in-effect`).

- **Aviso fijo arriba de todo**, con redacción acordada: "Rechazar deja registro
  del motivo. Tené presente que la persona que escribió la reseña sabe que la
  mandó: si se rechaza una crítica honesta, el costo es con esa marca."

- **NO se puede editar el texto, el puntaje ni los datos del autor, ni borrar
  filas.** No existe la acción; no es que esté escondida en la UI. El contenido
  de una reseña es inmutable: si no va, se rechaza y queda el registro.

- **`actions.ts` chequea la sesión SIEMPRE antes de tocar la base**, con
  `getUser()` (valida el token contra Supabase), nunca `getSession()`. Las
  funciones del lib escriben con el service role, que se saltea la RLS;
  `proxy.ts` protege las páginas de `/admin/*`, pero un server action se puede
  invocar por POST directo sin pasar por la página, así que la barrera tiene que
  estar en la acción. El `adminEmail` que queda en `moderated_by` sale de esa
  sesión y NUNCA de un parámetro del cliente: si viniera del browser,
  cualquiera podría firmar una moderación con el mail de otra persona.

- Toda acción revalida **tres** rutas: `/resenas`, `/` y `/servicios` (las dos
  últimas por el bloque de adelanto).

- **Badge de pendientes en el sidebar** (`app/admin/(panel)/layout.tsx`, vía
  `getPendingCount`), en la entrada "Reseñas" ubicada justo debajo de
  Clippings. Sin pendientes no se dibuja el badge. Más una tarjeta "Reseñas
  recibidas" en el dashboard con el resumen (N para moderar · N publicadas).

- **Link para pedir reseñas** con botón de copiar: es el que Marian manda por
  WhatsApp. La URL absoluta la arma el server desde el host de la request (no
  `window.location` en un efecto, no una env var), así sale bien en localhost,
  en el preview de Vercel y en producción.

- `getAllTestimonials()` devuelve `{ rows, ok }`. A diferencia de las lecturas
  públicas, en el panel NO da lo mismo "no llegó ninguna reseña" que "no pude
  leer la base": con el estado vacío Marian creería que nadie le escribió
  mientras hay reseñas esperando.

- Las fechas se formatean parseando el string ISO (nunca `new Date()`), igual
  que en `resena-card`: el manager se renderiza en server y en cliente, y el
  huso horario cambiaría el día (error de hidratación).

- Tests: `npx tsx scripts/e2e-resenas-panel.ts` con el dev server corriendo
  (51 checks: login, badge, posición en el sidebar, las tres pestañas y sus
  contadores, que las sin verificar no se muestren, el contenido de la fila,
  que no haya editar ni borrar, publicar con confirmación, Escape sin publicar,
  el mínimo de 10 caracteres del motivo, despublicar → vuelve a Para revisar y
  desaparece del sitio, rechazar y republicar. Playwright con el Edge del
  sistema; auto-limpiante por prefijo de email).


### Pendiente (próxima iteración)
- ~~Correr la migración de reseñas~~ → hecha (2026-09-09, verificada contra la
  base).
- ~~Panel `/admin/resenas`~~ → hecho (2026-09-09, ver arriba).
- ~~BLOQUEANTE: sin RESEND_API_KEY nadie podía confirmar su reseña~~ → ya no
  aplica: se sacó el paso de confirmación (2026-09-09). El sistema funciona de
  punta a punta sin ninguna env var; probado contra producción y contra la base.
- Pendiente NO bloqueante, en Vercel: `TESTIMONIAL_IP_SALT` (sin ella el
  formulario no tiene rate limit; el valor está en `.env.local`) y, si se
  quiere el aviso por mail de reseña nueva, `RESEND_API_KEY` (hay que crear la
  cuenta en resend.com y verificar el dominio sanchezmarian.com). Sin esta
  última hay que mirar el badge del panel para enterarse.
- Reseñas, lo único que falta: migrar el copy del formulario de alta
  (`/resenas/nueva`, hoy hardcodeado) al CMS.
- Correr la migración SQL de clippings en el dashboard + seed (paso manual,
  ver arriba). Hasta entonces el admin de clippings muestra el aviso de setup
  y la página pública usa el fallback.
- Correr la migración SQL de campañas
  (`supabase/migrations/20260611_campaigns_status.sql`) en el SQL Editor para
  habilitar borradores (ver sección Campañas).
- ~~Sesión 3: reorder de fotos por drag & drop~~ → hecho (PhotoManager,
  2026-06-11).
- Páginas secundarias (`/privacidad`, `/terminos`, `/sobre-marian`)
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
