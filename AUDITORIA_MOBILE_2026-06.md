# Auditoría Mobile — Sitio Público
> Fecha: 2026-06-19
> Alcance: páginas públicas (`/`, `/servicios`, `/mis-valores`, `/casos-de-exito`, `/campanas`, `/campanas/[slug]`, `/sobre-marian`, `/contacto`).
> Viewports objetivo: 360px, 375px, 390px, 768px.
> Metodología: lectura de código fuente (page.tsx + componentes). NO se modificó código.

---

## Resumen ejecutivo

- 🔴 **Alta prioridad: 3 problemas**
- 🟡 **Media prioridad: 9 problemas**
- 🟢 **Baja prioridad: 6 problemas**
- ℹ️ Notas informativas: 2

**Páginas con más problemas:** la **navegación global** (afecta a TODAS las páginas) y el **Home**. Las páginas mejor resueltas en mobile son `/servicios`, `/campanas` (listado) y `/contacto`, que ya usan `clamp()` y layouts mobile/desktop separados.

**Hallazgo más importante:** el menú hamburguesa (`components/nav.tsx`) no está posicionado de forma absoluta y es un hermano flex del `<nav>` dentro de un header de altura fija — es muy probable que el desplegable mobile se renderice mal. Como la nav está en todas las páginas, esto explicaría el reporte de Marian sobre problemas en mobile. **Verificar en dispositivo real cuanto antes.**

---

## Hallazgos por página

### / (home) + Navegación global

#### 🔴 ALTA PRIORIDAD

- **Menú mobile mal posicionado (afecta a TODAS las páginas)**
  - Archivo: `components/nav.tsx:24-99`
  - El `<header>` es `sticky top-0 h-[72px] flex items-center` (fila flex, altura fija). El `<nav>` tiene `w-full` y el desplegable (`motion.div`, línea 73) es un **hermano flex del nav**, SIN posicionamiento absoluto. En una fila flex, el panel queda comprimido al costado derecho del nav (no debajo) y, por el `items-center` + `h-[72px]`, se desborda verticalmente centrado. Resultado: el menú no aparece como dropdown debajo de la barra.
  - Fix sugerido: dar al `motion.div` del menú `position: absolute; top: 100%; left: 0; right: 0;` (o sacarlo del flujo flex del header). Ej.: `className="md:hidden absolute top-full inset-x-0 border-t ..."`. Verificar en 360/390px que se despliega como panel completo bajo la barra.

- **Números de Stats demasiado grandes para 2 columnas en mobile**
  - Archivo: `components/stats.tsx:50`
  - `text-[4rem]` (64px) con `grid-cols-2` (`stats.tsx:71`). En 360–375px cada celda tiene ~108px útiles (tras `px-6` del item); un número como “100+” a 64px mide ~150px → desborda la celda, se solapa con la columna vecina o genera scroll horizontal.
  - Fix sugerido: usar `clamp()` o reducir el tamaño base, p. ej. `text-[2.5rem] sm:text-[3.5rem] lg:text-[5rem]`, o mantener 1 columna en <400px.

#### 🟡 MEDIA PRIORIDAD

- **Hero usa `<img>` crudo en vez de `next/Image` (LCP + payload mobile + CLS)**
  - Archivo: `components/hero.tsx:35-46`
  - Es la imagen LCP y se sirve a resolución completa también a pantallas de 360px (sin `srcset`/`sizes`). Además no tiene `width`/`height` ni `aspect-ratio` explícito → riesgo de CLS al cargar. Mismo patrón en `components/mis-valores-sections.tsx:29-41`.
  - Fix sugerido: migrar a `next/Image` con `sizes="100vw"` y `priority`, o al menos definir dimensiones para reservar el espacio. (Nota: revisar guía de la versión de Next en `node_modules/next/dist/docs/` antes de tocar.)

- **Fila de medios con scroll horizontal sin indicador visible**
  - Archivo: `components/en-medios.tsx:162-182`
  - Las filas (“Local” tiene 7 medios) usan `overflow-x-auto` + `.no-scrollbar` (oculta la barra). En mobile el usuario no tiene pista de que hay más contenido a la derecha.
  - Fix sugerido: agregar una pista visual (gradiente de fade al borde derecho, o permitir wrap en mobile). Padding lateral hardcodeado `paddingLeft/Right: 40` (`en-medios.tsx:133`) podría además bajarse en mobile.

#### 🟢 BAJA PRIORIDAD

- **Card del formulario con padding fijo `p-10` (40px) en mobile**
  - Archivo: `components/cta-final.tsx:133`
  - En 360px deja ~232px de ancho útil para los inputs. Funciona pero aprieta.
  - Fix sugerido: `p-6 sm:p-10`.

---

### /servicios

> Página muy bien resuelta para mobile: `clamp()` en todos los headings y paddings, grids que colapsan con `lg:grid-cols-*`, `useReducedMotion` respetado. Pocos hallazgos.

#### 🟢 BAJA PRIORIDAD

- **Sub-servicios con `cursor-pointer` pero no son clickeables**
  - Archivo: `components/servicios/servicio-principal.tsx:140` y `servicios/servicios-secundarios.tsx:91`
  - Los bloques de sub-servicio tienen `cursor-pointer` y subrayado animado en `group-hover`, pero solo el CTA navega. En desktop sugiere falsamente que la fila es un link; en touch el `group-hover` nunca se dispara (efecto inerte).
  - Fix sugerido: quitar `cursor-pointer` de los que no son links, o convertir la fila en `<Link>`.

---

### /mis-valores

#### 🟡 MEDIA PRIORIDAD

- **Heading de Pilares con tamaño fijo en px (sin `clamp`)**
  - Archivo: `components/mis-valores-sections.tsx:175`
  - `text-[40px]` fijo para el H2 (`{title_pre} {title_accent}`). En 360px es grande y no escala fluido como el resto del sitio.
  - Fix sugerido: `text-[clamp(28px,7vw,40px)]` o breakpoints `text-[28px] sm:text-[36px] lg:text-[40px]`.

- **Números de pilar quedan permanentemente tenues en touch**
  - Archivo: `components/mis-valores-sections.tsx:198`
  - El número (`01`…`05`) está a `opacity-30` y solo llega a `opacity-100` con `group-hover` (desktop). En mobile nunca se realza → quedan casi ilegibles.
  - Fix sugerido: subir la opacidad base en mobile (p. ej. `opacity-60`) o no depender del hover.

---

### /casos-de-exito

> El layout mobile está cuidado: stats con grid mobile dedicado (`casos-client.tsx:672-692`) y timeline vertical en `<640px` (`casos-client.tsx:182-219`). Los problemas son de touch targets.

#### 🟡 MEDIA PRIORIDAD

- **Dots del carrusel “Coberturas destacadas” de 8×8px**
  - Archivo: `components/destacadas-rotativo.tsx:163-184`
  - Botones de 8×8px con `padding: 0` → área táctil muy por debajo de 44px. Difíciles de tocar.
  - Fix sugerido: envolver el dot en un botón de ≥44×44px con el punto centrado (padding transparente alrededor).

- **Botones de índice de clientes y “Expandir todo” con altura <44px**
  - Archivo: `components/casos-client.tsx:484-501` (IndexButton) y `casos-client.tsx:516-535` (ToggleAll)
  - `padding: "8px 16px"` con texto de 12px → altura ~32px. Hay ~11 botones de índice juntos (`flex-wrap gap-2`), separación y altura por debajo del mínimo recomendado.
  - Fix sugerido: subir a `padding: "11px 16px"` (≥44px) y `gap-3` entre chips.

#### 🟢 BAJA PRIORIDAD

- **Padding superior del hero fijo en 160px**
  - Archivo: `components/casos-client.tsx:596` (`paddingTop: 160`)
  - Mucho espacio vacío arriba en mobile.
  - Fix sugerido: `paddingTop: "clamp(120px, 18vh, 160px)"`.

---

### /campanas (listado)

> Implementación ejemplar: layouts mobile (`<768px`, thumbnail 96px) y desktop (grid 40/60) separados, `next/Image` con `sizes`, card como link de área completa. Un solo problema.

#### 🟡 MEDIA PRIORIDAD

- **El stat “última campaña” renderiza una fecha de texto largo a tamaño de número gigante**
  - Archivo: `components/campanas-content.tsx:88-90` y `116-118`
  - `lastDate = campaigns[0]?.date` es un string tipo “Junio 2026”, y se muestra con `fontSize: clamp(36px, 4vw, 48px)` dentro de `grid-cols-2` en mobile (`campanas-content.tsx:101`). A 36px+ “Junio 2026” desborda/parte fea la celda de ~140px.
  - Fix sugerido: para ese stat usar un tamaño menor (es texto, no número), o abreviar (“Jun ’26”) y limitar a un tamaño tipográfico de cuerpo en mobile.

---

### /campanas/[slug] (detalle)

#### 🟡 MEDIA PRIORIDAD

- **Controles del slideshow chicos en mobile y sin swipe**
  - Archivo: `components/campaign-slideshow.tsx:104-109` (flechas 36×36 en `<768px`) y `289-305` (dots de 6px de alto)
  - Flechas a 36px (<44px) y dots de 6px de alto → difíciles de tocar. No hay gesto de swipe; en mobile el único control fino son esos botones.
  - Fix sugerido: flechas ≥44px también en mobile, dots con área táctil ≥24px de alto (punto visual chico dentro de un botón más grande), y/o soporte de swipe (drag) con la API de motion.

---

### /sobre-marian

#### ℹ️ Nota

- `app/sobre-marian/page.tsx:4` hace `redirect("/mis-valores")`. La ruta no tiene contenido propio. El componente `components/sobre-marian-sections.tsx` (con su Hero, Manifiesto, Trayectoria, etc.) **no se renderiza en ninguna ruta pública** → código muerto. Si en algún momento se quiere publicar, ya tiene versión mobile vertical de la trayectoria (`sobre-marian-sections.tsx:257-288`); si no, conviene eliminarlo para reducir confusión.

---

### /contacto

> Bien resuelto en mobile: hero `flex-col`, form con inputs/select de altura táctil adecuada (`py-3`), FAQ que colapsa a 1 columna.

#### 🟢 BAJA PRIORIDAD

- **Mezcla de paleta legacy (`marino`/`terracota`/`gris-tx`) en este componente**
  - Archivo: `components/contacto-content.tsx` (varias líneas, p. ej. 143-149, 161-201) y `components/contact-form.tsx:19-22`
  - No es un bug visual: esas clases están aliasadas en `app/globals.css:15-20` y resuelven a la paleta bordó. Pero es deuda de consistencia frente al resto del sitio (bordo/hueso/dorado).
  - Fix sugerido: unificar a la paleta nueva cuando se haga limpieza (cosmético, no urgente).

---

## Patrones recurrentes

1. **Touch targets por debajo de 44px en todos los controles de carrusel/paginación.**
   Aparece en: `destacadas-rotativo.tsx` (dots 8px), `campaign-slideshow.tsx` (flechas 36px, dots 6px), `casos-client.tsx` (chips ~32px). Conviene definir un mínimo de 44×44px de área táctil como regla del proyecto.

2. **Afordancias solo-hover que no funcionan en touch.**
   `group-hover`/`whileHover`/`onMouseEnter` para subrayados, opacidad de números y elevación de cards (`servicio-principal.tsx`, `mis-valores-sections.tsx`, `home-servicios.tsx`, `destacadas-rotativo.tsx`). En mobile son inertes; en un par de casos esconden información (números de pilar tenues). Mayormente decorativo, pero revisar dónde oculta contenido.

3. **Imágenes hero con `<img>` crudo en vez de `next/Image`.**
   `hero.tsx` y `mis-valores-sections.tsx`: sin `srcset`/`sizes` (payload pesado en mobile) ni dimensiones (CLS). El resto del sitio (campañas, bio, slideshow, logos) sí usa `next/Image` correctamente con `sizes` → unificar.

4. **Estrategia de tamaño de headings inconsistente.**
   Conviven `clamp()` (servicios, campañas, casos — bien) con tamaños fijos en px (`stats.tsx` 4rem, `mis-valores-sections.tsx` 40px, `sobre-marian-sections.tsx` 48px). Los fijos son los que generan los desbordes en 360px. Estandarizar a `clamp()` para titulares.

5. **Texto micro <14px y bajo contraste en el footer.**
   `components/footer.tsx`: links de nav a `text-hueso/35` (35% de opacidad sobre fondo casi negro → contraste pobre, `footer.tsx:85`), email/legales a `text-[10px]` (`footer.tsx:72,122,133`). Legible-límite en mobile al sol. Subir opacidad de los links a ~/60 y los textos legales a 11–12px.

---

## Recomendaciones de orden de fix

1. **PRIMERO — Menú mobile (`nav.tsx`).** Es el bloqueante de mayor impacto, está en todas las páginas y es muy probable que sea lo que reportó Marian. Verificar en dispositivo real y aplicar el posicionamiento absoluto. Desbloquea la navegación completa.

2. **Desbordes de tipografía en mobile (overflow horizontal).** `stats.tsx` (Home) y el stat “última campaña” de `campanas-content.tsx`. Son defectos visibles que rompen el layout en 360–375px. Fix rápido (cambiar a `clamp()`/tamaño menor).

3. **Touch targets de carruseles (patrón #1).** Aplicar la regla de 44px de una sola pasada a `destacadas-rotativo.tsx`, `campaign-slideshow.tsx` y los chips de `casos-client.tsx`. Mejora medible de usabilidad mobile con bajo riesgo.

4. **Imágenes hero → `next/Image` (patrón #3).** Mejora LCP/payload/CLS en mobile. Hacerlo junto con la revisión de la guía de Next.

5. **Pulidos de legibilidad y consistencia.** Contraste/microtexto del footer, heading de Pilares y opacidad de los números, padding fijos (cta-final, hero de casos). Agruparlos como una tanda de “polish”.

6. **Limpieza (sin impacto de usuario).** Eliminar componentes muertos (`sobre-marian-sections.tsx`, `page-hero.tsx`, `marquee-band.tsx`, `servicios.tsx`, `timeline-relaciones-publicas.tsx` si confirmás que no se usan) y unificar la paleta legacy de `/contacto`.

---

> Recordatorio: este documento solo identifica problemas. No se modificó código de la aplicación.
