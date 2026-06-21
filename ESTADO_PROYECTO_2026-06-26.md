# Estado del Proyecto — sanchezmarian.com

> Fecha de auditoría: 2026-06-26
> Metodología: lectura de código fuente + `git`/`vercel env ls` (solo lectura). **No se modificó ni ejecutó código de la app.**
> Rama: `master` · working tree limpio · último commit `bb0f281`.

> ⚠️ Nota sobre el contexto pedido: no existen los archivos `CONTEXTO_PROYECTO_v3.md` ni `RESUMEN_PROYECTO_SANCHEZMARIAN.md`. Se usaron los que sí están en el repo: **`CONTEXTO_PROYECTO.md`** y **`AUDITORIA_MOBILE_2026-06.md`** (esta última ya existe, fechada 2026-06-19).

---

## 1. ESTADO DE PÁGINAS PÚBLICAS

Todas las páginas viven bajo el route group `app/(site)/` y comparten `app/(site)/layout.tsx` (Navbar + Footer + WhatsAppFloat). Todas leen contenido de Supabase mediante helpers **resilientes con fallback** (`getContent`/`getContentBatch`/`getPageContent` en `lib/content.ts`), que **nunca tiran excepción**: si Supabase falla, devuelven el fallback hardcoded del esquema. Por diseño, ninguna página rompe el build por Supabase.

| Página | ¿Compila? | Fuente de contenido | Fallback | page= / secciones | Revalidación |
|---|---|---|---|---|---|
| `/` | Sí | Supabase | Sí (schemas) | `home` (hero, stats, metodo, bio, cta_final, servicios, contact) + `servicios` (servicio_01/02/03 para la vidriera) | `revalidate = 60` |
| `/servicios` | Sí | Supabase | Sí | `servicios` (todas las secciones de `SERVICIOS_SECTIONS`) | `revalidate = 60` |
| `/mis-valores` | Sí | Supabase | Sí | `mis_valores` (`MIS_VALORES_SECTIONS`) | `revalidate = 60` |
| `/casos-de-exito` | Sí | Supabase | Sí | `casos_de_exito` (`CASOS_SECTIONS`) + `getClientsWithClippings()` (tablas `clients`/`clippings`, fallback `data/clippings.ts`) | `revalidate = 60` |
| `/campanas` | Sí | Supabase | Sí (`data/campaigns-fallback.ts`) | tabla `campaigns` + `campaign_images` (`getPublicCampaigns`) | `revalidate = 60` |
| `/campanas/[slug]` | Sí | Supabase | Sí (fallback por slug) | `getCampaignBySlug` | `dynamic = "force-dynamic"` |
| `/sobre-marian` | **No existe como página** | — | — | redirige (308) a `/mis-valores` vía `next.config.ts` | — |
| `/contacto` | Sí | Supabase | Sí | `contacto` (hero, info, faq) | `revalidate = 60` |
| `/privacidad`, `/terminos` | Sí | **Hardcoded** (texto legal en el archivo) | n/a | no editables desde admin | estático, `robots: noindex` |
| `/gracias` | Sí (fuera de `(site)`) | — | — | página de agradecimiento | — |

**Componentes que integran cada página**
- **Home** (`app/(site)/page.tsx`): `hero`, `stats`, `ideas`, `clientes`, `home-servicios`, `bio`, `en-medios`, `cta-final`.
- **Servicios**: `servicios-page-sections` (→ `servicios/servicio-principal`, `servicios/servicios-secundarios`, `servicios/alianzas-section`, `ui/isotipo-infinito`, `ui/split-words`, `ui/drawn-line`, `ui/texture-overlay`) + `ui/mobile-cta-bar`.
- **Mis valores**: `mis-valores-sections`.
- **Casos de éxito**: `casos-de-exito/casos-client` + `ui/scroll-progress` + `destacadas-rotativo` (carrusel curado).
- **Campañas**: `campanas-content` + `ui/mobile-cta-bar`; detalle: `campana-detail` + `campaign-slideshow`.
- **Contacto**: `contacto-content` + `contact-form`.

**Bugs / cosas sospechosas en páginas**
- `data/campaigns-fallback.ts` referencia imágenes locales (`/images/1.jpg`…`/images/9.jpeg`, `NAC_*.jpg`): **todas existen** en `public/images/`. El fallback se ve bien.
- `/campanas/[slug]` y `/campanas` definen OpenGraph **sin `images`** → no hay imagen OG site-wide (ver §7).
- `/privacidad` y `/terminos` tienen el texto legal **hardcoded** y mencionan `contacto@sanchezmarian.com` (no `prensa@`).
- Sub-servicios con `cursor-pointer` que no son links; afordancias solo-hover inertes en touch (ya documentado en `AUDITORIA_MOBILE_2026-06.md`).

---

## 2. COMPONENTES GLOBALES (nav, footer, layout)

> Estructura **cambiada** respecto a la auditoría mobile: Nav y Footer ahora viven en `components/layout/` (antes `components/nav.tsx` / `components/footer.tsx`).

### Navbar — `components/layout/Navbar.tsx`
- **Client component** (`"use client"`).
- **Lee de Supabase**: sí, vía prop `content` = `global.nav` (cargado en `app/(site)/layout.tsx` con `getGlobalContent()`).
- **page= / section**: `global` / `nav`. Campos editables: `link_servicios`, `link_valores`, `link_casos`, `link_campanas` (solo el **texto** de cada link; los `href` son estructurales y vienen de `lib/constants.ts → NAV_ITEMS`).
- **Hardcoded** (no editable): CTA "Conversemos", textos del menú mobile ("Conversemos por WhatsApp", "Escribime por email", "Mendoza, Argentina"), número de WhatsApp (de `constants.ts`).
- ✅ El **menú mobile ya está corregido**: `motion.div` con `absolute top-full inset-x-0` (la auditoría mobile lo reportaba como bug alto; ya no aplica). Botón hamburguesa con `min-h-11 min-w-11` (≥44px), Esc cierra, backdrop, scroll-lock.

### Footer — `components/layout/Footer.tsx`
- **Server component** (sin `"use client"`).
- **Lee de Supabase**: sí. `const c = { ...globalFallbacksFor("footer"), ...content }` con `content` = `global.footer`; navegación con texto de `global.nav`.
- **page= / section**: `global` / `footer`. Campos editables: `tagline`, `email`, `cta_text`, `instagram_url`, `linkedin_url`, `copyright_name`, `signature`.
- **Hardcoded en el JSX** (NO editables desde admin): el **teléfono `+54 261 543-3882`**, la línea `"Mendoza, Argentina · Trabajo remoto en LATAM"`, el link de WhatsApp (de `constants.ts`), los iconos sociales y los links `/privacidad` y `/terminos`.

> ✅ **El Footer NO está desconectado**: tiene editores en `/admin/edit/global` y el componente público efectivamente lee esos campos. La única salvedad es que **teléfono y ubicación del footer son hardcoded** y no tienen editor (deuda menor, no bug crítico).

### Layout — `app/(site)/layout.tsx`
- **Server component** async. Llama `getGlobalContent()` una sola vez y pasa `nav`/`footer` por props. Incluye skip-link de accesibilidad, `<main id="main-content">` y `<WhatsAppFloat>` global.
- `components/whatsapp-float.tsx`: botón flotante global (href de `constants.ts`, hardcoded).

---

## 3. PANEL ADMIN

Auth y guardado en `app/admin/actions.ts`. `saveContentSection` usa **`createAdminClient()` con `SUPABASE_SERVICE_ROLE_KEY`** para escribir (con backup de versión previa en `content_versions`). Lectura de sesión con cliente cookies (`lib/supabase/server.ts`). Todas las rutas admin son `dynamic = "force-dynamic"`.

### Editores de contenido (`/admin/edit/*`) — todos vía `components/admin/edit-page.tsx` → `content-editor.tsx`
| Ruta | Archivo | Campos / esquema | Tabla | Cliente | Guardado |
|---|---|---|---|---|---|
| `/admin/edit/home` | `edit/home/page.tsx` | `HOME_SECTIONS` | `content_blocks` | service_role (`saveContentSection`) | OK |
| `/admin/edit/servicios` | `edit/servicios/page.tsx` | `SERVICIOS_SECTIONS` | `content_blocks` | service_role | OK |
| `/admin/edit/mis-valores` | `edit/mis-valores/page.tsx` | `MIS_VALORES_SECTIONS` | `content_blocks` | service_role | OK |
| `/admin/edit/casos-de-exito` | `edit/casos-de-exito/page.tsx` | `CASOS_SECTIONS` | `content_blocks` | service_role | OK |
| `/admin/edit/contacto` | `edit/contacto/page.tsx` | `CONTACTO_SECTIONS` | `content_blocks` | service_role | OK |
| `/admin/edit/global` | `edit/global/page.tsx` | `GLOBAL_SECTIONS` (nav + footer) | `content_blocks` | service_role | OK |
| `/admin/edit/seo` | `edit/seo/page.tsx` | `SEO_SECTIONS` | `content_blocks` (page=`seo`) | service_role | OK |

### Editores de datos
| Ruta | Archivo | Acción | Tabla | Cliente |
|---|---|---|---|---|
| `/admin/clippings` | `clippings/page.tsx` + `SortableClientsList.tsx` | listar + **reordenar (drag&drop)** | `clients` (+ count `clippings`) | service_role (`reorderClients`) |
| `/admin/clippings/[clientId]` | `[clientId]/page.tsx` + `clippings-manager.tsx` | alta/edición/baja de clippings, auto-completar desde URL | `clippings` | service_role (`actions.ts`) |
| `/admin/campanas` | `campanas/page.tsx` + `campaigns-list.tsx` | listar/filtrar/eliminar | `campaigns` | service_role |
| `/admin/campanas/nueva`, `/[slug]/editar` | `campaign-form.tsx` + `PhotoManager.tsx` | CRUD + fotos (Storage `campaign-images`) | `campaigns`, `campaign_images` | service_role |
| `/admin/dashboard` | `dashboard/page.tsx` | tarjetas (cuenta campañas activas/borradores) | `campaigns` (read) | service_role |

**Bugs potenciales en server actions (sin probar)**
- `saveContentSection`: correcto. `redirect()` fuera del try/catch (bien). Revalidación condicionada por `page` (global → `revalidatePath("/", "layout")`, seo → ruta de la sección, resto → `PAGE_PATHS`).
- `clippings/actions.ts`: hay comentario explícito (línea 220) advirtiendo **no re-exportar tipos desde `"use server"`** (causaba HTTP 500 en prod con Turbopack); ya resuelto importando `UrlMetadata` desde `lib/extract-metadata`. `createClipping`/`updateClipping`/`reorderClients`/`deleteClipping` lucen correctos, con logs de error.
- `reorderClients`: hace N updates en paralelo (uno por cliente). Aceptable con <50 clientes. (El comentario menciona "upsert en batch" en otra parte, pero acá son updates individuales — funciona igual.)

**Sidebar "Próximamente"**: **no hay ninguno**. Los 9 items del sidebar (`(panel)/layout.tsx`) están `enabled: true`. La rama de "PRÓXIMAMENTE" existe en el JSX pero no se usa hoy.

**No existe `/admin/suscriptores`** ni ningún editor de newsletter.

---

## 4. CONEXIÓN ADMIN ↔ PRODUCCIÓN (verificación crítica)

| Campo editable (admin) | ¿Componente público lo lee de Supabase? | revalidatePath en la action | Página con revalidate/dynamic |
|---|---|---|---|
| `home/*` | ✅ sí (`getContentBatch`) | ✅ `/` | `revalidate=60` |
| `servicios/*` | ✅ sí | ✅ `/servicios` | `revalidate=60` |
| `mis_valores/*` | ✅ sí | ✅ `/mis-valores` | `revalidate=60` |
| `casos_de_exito/*` | ✅ sí | ✅ `/casos-de-exito` | `revalidate=60` |
| `contacto/*` | ✅ sí (merge fallback+content, `contacto-content.tsx:109-111`) | ✅ `/contacto` | `revalidate=60` |
| `global/nav` + `global/footer` | ✅ sí (Navbar/Footer) | ✅ `revalidatePath("/", "layout")` | layout en todas |
| `seo/*` (por página) | ✅ sí (`buildMetadata`) | ✅ ruta de la sección | `generateMetadata` |
| clippings (clients/clippings) | ✅ sí (`getClientsWithClippings`) | ✅ `/casos-de-exito` | `revalidate=60` |
| campañas | ✅ sí | ✅ (`/campanas` + detalle) | `revalidate=60` / `force-dynamic` |

**Resultado: NO se detectaron desconexiones admin↔producción.** Todos los editores escriben en `content_blocks`/tablas y los componentes públicos leen de ahí, con `revalidatePath` correspondiente.

**Salvedades (no son desconexión, sino campos NO editables):**
- Footer: **teléfono** y **"Mendoza, Argentina · Trabajo remoto en LATAM"** son hardcoded (no hay editor).
- Páginas legales `/privacidad` y `/terminos`: 100% hardcoded, sin editor.
- Navbar mobile: CTAs y "Mendoza, Argentina" hardcoded.

---

## 5. BASE DE DATOS (inferida del código)

**Tablas en uso:**
- `content_blocks` (contenido editable; unique page+section+field) — seed: `scripts/seed-content.ts` (páginas: home, servicios, mis_valores, casos_de_exito, contacto, global, seo).
- `content_versions` (backup de versiones en cada guardado).
- `clients`, `clippings` — migración `supabase/migrations/20260610_clients_clippings.sql`; seeds: `seed-clippings.ts`, `seed-clippings-mosto.ts`; mantenimiento: `normalize-client-order.ts`, `inspect-client-order.ts`, `fix-duplicate-bolsa.ts`.
- `campaigns`, `campaign_images` (+ bucket Storage `campaign-images`) — migración `20260611_campaigns_status.sql`; seed: `seed-campaigns.ts`; auditoría: `audit-campaign-images.ts`.
- `seed-servicios.ts` siembra `content_blocks` (page=servicios).

**`newsletter_subscribers`: NO existe** (ni tabla, ni migración, ni seed, ni lectura/escritura en código).

**Seeds ejecutados históricamente:** no es determinable solo desde el repo. Por `CONTEXTO_PROYECTO.md` y commits, las migraciones de clippings y campañas estaban **pendientes de correr a mano** en el SQL Editor en su momento; el admin de clippings funciona hoy en código (no muestra el aviso de "tablas no existen" salvo error), lo que sugiere que **clientes/clippings ya están migrados y seedeados en la base de PROD** — pero esto no se puede confirmar sin conectarse a Supabase. **Incertidumbre.**

---

## 6. ENV VARS

**Usadas en código (app):**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — lectura pública (`lib/supabase.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `proxy.ts`).
- `SUPABASE_SERVICE_ROLE_KEY` — escritura admin (`createAdminClient`).
- `NEXT_PUBLIC_FORMSPREE_ID` — envío del formulario de contacto (`contact-form.tsx`, `cta-final.tsx`).

**`.env.local`** (local): tiene las 4 variables con valor. El hostname de `next.config.ts` (`ncokwdodsvrmkoimvdwg.supabase.co`) **coincide** con `NEXT_PUBLIC_SUPABASE_URL` → `next/Image` de Supabase Storage funciona.

**`vercel env ls` (solo nombres):**
```
SUPABASE_SERVICE_ROLE_KEY            Production, Preview   ✅
NEXT_PUBLIC_FORMSPREE_ID             Preview, Production   ✅
NEXT_PUBLIC_SUPABASE_URL             Production, Preview   ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY        Production
NEXT_PUBLIC_SUPABASE_ANON_KE…        Production, Preview   (¿duplicado/truncado?)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY Production
SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY / SUPABASE_JWT_SECRET / POSTGRES_* (de la integración Supabase, 11d)
```
- ✅ **`SUPABASE_SERVICE_ROLE_KEY` SÍ está en Production** (y Preview). No es bug crítico.
- ✅ Las 4 variables que usa el código están en Production.
- ⚠️ **Posible duplicado/typo**: aparecen dos entradas para la anon key — `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production) y `NEXT_PUBLIC_SUPABASE_ANON_KE…` (Production, Preview). Puede ser solo truncado de columna del CLI, pero conviene **verificar que no haya una variable mal nombrada sin la `Y` final**. Severidad baja (el código lee la versión correcta y existe).
- ℹ️ La integración de Supabase agregó un set de claves nuevo formato (`SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `POSTGRES_*`) que **el código no usa** (sigue con las legacy `eyJhbGci...`). Ruido, no rompe nada.

---

## 7. BUGS CONOCIDOS Y SOSPECHADOS

| # | Descripción | Archivo:línea | Severidad | Workaround |
|---|---|---|---|---|
| 1 | **Formulario de contacto sin Formspree configurado en runtime cae a `YOUR_FORM_ID`** → POST a `formspree.io/f/YOUR_FORM_ID` falla. En Vercel la var existe; localmente está seteada (`xvg…`). Riesgo si la var no se propaga a un entorno. | `contact-form.tsx:10`, `cta-final.tsx:12` | Medio | Var existe en Vercel Prod/Preview |
| 2 | **OpenGraph sin imagen** en todo el sitio (no se define `openGraph.images`); `/campanas/[slug]` arma title/desc/url pero no imagen. | `lib/seo.ts:18`, `campanas/[slug]/page.tsx:24-30`, `campanas/page.tsx` | Medio | — |
| 3 | **Touch targets <44px** en carruseles/paginación (dots 8px, flechas 36px, chips ~32px). | `destacadas-rotativo.tsx`, `campaign-slideshow.tsx`, `casos-client.tsx` | Medio | — (ver auditoría mobile) |
| 4 | **Hero con `<img>` crudo** (sin `next/Image`): LCP/CLS/payload mobile. | `hero.tsx:35`, `mis-valores-sections.tsx`, `contacto-content.tsx:41` | Medio | — |
| 5 | **Tipografías fijas en px** desbordan en 360px (stats 4rem, pilares 40px, stat "última campaña"). | `stats.tsx:50`, `mis-valores-sections.tsx:175`, `campanas-content.tsx` | Medio | — |
| 6 | Email del sitio es **`contacto@sanchezmarian.com`**, NO `prensa@` (el checklist preguntaba por `prensa@`). | `lib/constants.ts:8` | Bajo (decisión) | — |
| 7 | **Componentes huérfanos** (0 imports): ver §8. | — | Bajo | — |
| 8 | Posible **duplicado/typo de env var** anon key en Vercel. | Vercel env | Bajo | — |
| 9 | Footer: teléfono y ubicación hardcoded (no editables). | `Footer.tsx:83,88` | Bajo | — |

**Bugs que YA sabíamos — verificación:**
- **Imágenes rotas en /campanas (galerías mostraban alt text)**: en código **no se reproduce** — `remotePatterns` cubre el host de Supabase y las imágenes del fallback existen en `public/images/`. Si persiste en prod, sería por filas `campaign_images` apuntando a archivos inexistentes en Storage (no verificable sin conectarse a Supabase). **Probable resuelto en código.**
- **Logo Fuerza Silenciosa con fondo blanco**: `logo-fuerza-silenciosa.jpg` (único `.jpg` entre logos `.png`); se muestra siempre sobre **tarjetas blancas** (`clientes.tsx` bg `#FFFFFF`, casos con wrapper `background:"white"`), así que el fondo blanco del JPG **se mimetiza**. No genera caja visible hoy. **No se reproduce.**
- **/casos-de-exito logos transparentes que necesitan wrapper blanco**: **resuelto** — `casos-client.tsx:378-389` envuelve cada logo en un contenedor `background:"white"`.
- **Seeds pendientes de ejecutar**: las migraciones SQL de clippings y campañas eran pasos manuales; el código sigue trayendo los avisos de setup como salvaguarda. Estado real en PROD: **incierto** (ver §5).

---

## 8. ARQUITECTURA — OBSERVACIONES

**a) Componentes huérfanos / sin usar (0 imports, candidatos a borrar):**
- `components/page-hero.tsx`
- `components/marquee-band.tsx`
- `components/timeline-relaciones-publicas.tsx`
- `components/sobre-marian-sections.tsx` (la página `/sobre-marian` ahora redirige; su contenido no se renderiza)
- `components/servicios.tsx` (versión vieja; la página usa `servicios-page-sections.tsx`)
- `components/ui/shift-card.tsx`
- `components/ui/gold-border-card.tsx`
- `components/ui/popover-form.tsx`

(En uso, para que no se borren por error: `ui/texture-card` 1×, `ui/drawn-line` 3×, `ui/split-words` 3×, `ui/isotipo-infinito` 1×, `ui/texture-overlay`, `ui/mobile-cta-bar`, `ui/scroll-progress`, `ui/motion-link`, `ui/animated-number`, `ui/icon-whatsapp`, `ui/RichText`.)

**b) Archivos duplicados:** `components/servicios.tsx` (viejo) coexiste con la carpeta `components/servicios/` (nueva). El viejo está huérfano.

**c) Schemas TS vs Supabase:** la fuente de verdad son los `lib/*-schema.ts`; el seed y la lectura usan los mismos esquemas, por lo que están sincronizados *por construcción*. No verificable contra el estado real de la base sin conectarse.

**d) Naming inconsistente:** mezcla de `PascalCase` (`Navbar.tsx`, `Footer.tsx`, `Logo.tsx`, `PhotoManager.tsx`, `RichTextEditor.tsx`, `SortableClientsList.tsx`, `RichText.tsx`) y `kebab-case` (todo el resto de `components/`). Además, la paleta legacy (`marino`/`terracota`/`gris-tx`) convive con la nueva (bordo/hueso/dorado) en `/contacto` (aliaseada en `globals.css`, no rompe).

---

## 9. CHECKLIST DE TRABAJO PENDIENTE

| Item | Estado | Evidencia |
|---|---|---|
| `/admin/clippings` refactor a lista vertical drag&drop | ✅ Hecho | `SortableClientsList.tsx` (dnd-kit, auto-save, optimistic) |
| `/admin/clippings`: guardar clipping funciona | ✅ En código OK | `clippings-manager.tsx` + `actions.ts` (create/update con validación) |
| Newsletter subscribers (captura mails) | ❌ No implementado | sin tabla ni captura; el form usa Formspree |
| Tabla `newsletter_subscribers` | ❌ No existe | sin migración ni seed |
| `/admin/suscriptores` | ❌ No existe | no hay ruta |
| Auditoría mobile ejecutada | ✅ Existe | `AUDITORIA_MOBILE_2026-06.md` (2026-06-19) |
| Auditoría CMS ejecutada | ❌ No existe `AUDITORIA_CMS_*.md` | no hay archivo |
| Footer público lee de Supabase | ✅ Sí | `Footer.tsx:34` |
| Nav público lee de Supabase | ✅ Sí | `Navbar.tsx:16` |
| Editor `/admin/edit/global` existe y funciona | ✅ Sí | `edit/global/page.tsx` + `GLOBAL_SECTIONS` |
| Editor `/admin/edit/contacto` existe | ✅ Sí | `edit/contacto/page.tsx` |
| `/servicios` con isotipo del infinito | ✅ Con isotipo | `servicios-page-sections.tsx:96,136,185` (`IsotipoInfinito`) |
| Sección Alianzas en `/servicios` | ✅ Presente | `servicios/alianzas-section.tsx`, render en `servicios-page-sections.tsx:267` (eyebrow + title + items) |
| OG metadata correcto en `/campanas/[slug]` | ⚠️ Parcial | title/desc/url sí; **sin imagen OG** |
| Mail `prensa@sanchezmarian.com` configurado | ❌ No | el sitio usa `contacto@sanchezmarian.com` (`constants.ts:8`) |

---

## 10. RESUMEN EJECUTIVO

**Funciona y está OK:**
1. Las 6 páginas públicas compilan y **leen su contenido de Supabase con fallback hardcoded resiliente** (el sitio nunca rompe por Supabase).
2. **No hay desconexión admin↔producción**: cada editor escribe y cada componente público lee, con `revalidatePath` correcto. Nav y Footer incluidos.
3. El **menú mobile ya está arreglado** (posición absoluta) — era el bug alto de la auditoría mobile.
4. **Clippings** refactorizado a lista vertical con drag&drop y CRUD funcional; **campañas** con CRUD + fotos completo.
5. `SUPABASE_SERVICE_ROLE_KEY` y las demás env vars del código **están en Vercel Production**.
6. Bugs viejos de logos resueltos: casos-de-exito con wrapper blanco; Fuerza Silenciosa se mimetiza en tarjetas blancas.

**Implementado pero con bugs/deuda:**
7. **Touch targets <44px** y **hero con `<img>` crudo** y **tipografías fijas que desbordan en 360px** (documentado en la auditoría mobile, sin aplicar).
8. **OpenGraph sin imagen** en todo el sitio (compartir un link no muestra preview visual).
9. Formulario depende de `NEXT_PUBLIC_FORMSPREE_ID` (presente en Vercel; cae a `YOUR_FORM_ID` si faltara).

**No implementado:**
10. **Newsletter completo**: no hay tabla `newsletter_subscribers`, ni captura de mails, ni `/admin/suscriptores`.
11. No existe auditoría CMS (`AUDITORIA_CMS_*.md`).
12. Mail `prensa@` (el sitio usa `contacto@`).

**Deuda técnica:**
13. **8 componentes huérfanos** (incluido el viejo `components/servicios.tsx` y `sobre-marian-sections.tsx`) — limpieza segura pendiente.
14. **Posible env var duplicada/typo** de la anon key en Vercel (verificar).
15. Naming mixto PascalCase/kebab-case y paleta legacy en `/contacto` (cosmético).
16. **Incertidumbre sobre el estado real de la base PROD** (qué seeds/migraciones corrieron): no verificable sin conectarse a Supabase.

> Documento de solo lectura. No se modificó código de la aplicación.
