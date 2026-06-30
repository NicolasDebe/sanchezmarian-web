# Auditoría y blindaje del CMS — resultados

Estado al 2026-06-30. Este documento registra qué quedó verificado y qué
falta. El sitio se ve **idéntico** al anterior: esta tanda solo blinda.

## Resumen por bloque

| Bloque | Tema | Estado |
|--------|------|--------|
| A | maxChars + help en schemas | maxChars ✅ completo · help parcial |
| B | Validación server-side | ✅ contenido, clippings, campañas, fotos |
| C | Validación cliente en editor | ✅ |
| D | Fallbacks en componentes públicos | ✅ (ya existían vía `fallbacksFor`) |
| E | Edge cases de contenido | ⏳ pendiente QA manual |
| F | Edge cases de viewport | ⏳ pendiente QA manual |
| G | Mobile específico | ⏳ pendiente QA manual |
| H | TypeScript + build | ✅ `tsc --noEmit` y `next build` limpios |
| I | SEO y metadatos | ✅ (de tandas previas) |
| J | Accesibilidad básica | ✅ parcial (ConfirmDialog con foco/aria) |
| K | Undo + confirmaciones | ✅ |

## Lo que se implementó en esta tanda

### Bloque K — tranquilidad para editar
- **`components/admin/ConfirmDialog.tsx`**: modal de confirmación reusable.
  Foco automático en el botón primario al abrir, Escape para cerrar, click
  fuera para cancelar, `role="dialog"` + `aria-modal` + `aria-labelledby`.
  Botón primario bordó (destructivo) o dorado (`tone="primary"`), "Cancelar"
  en outline.
- **Confirmaciones destructivas** con copy unificado
  «¿Eliminar «{nombre}»? No se puede deshacer.»:
  - Eliminar clipping (antes `window.confirm`).
  - Eliminar audio de un clipping (antes `window.confirm`).
  - Eliminar foto del portfolio (antes **sin** confirmación).
  - Eliminar campaña (antes modal inline ad-hoc → ahora usa el reusable).
- **Deshacer último cambio** por sección en `/admin/edit/*`:
  - Botón "Deshacer último cambio" en el header de cada sección abierta.
  - `getLastVersionDate(page, section)` y `restoreLastVersion(page, section)`
    en `app/admin/actions.ts`. El restore respalda el valor actual antes de
    pisarlo (el undo es a su vez deshacible) y revalida la página pública.
  - Modal: «¿Deshacer el último cambio en esta sección? Vas a volver al
    estado del {fecha}.» con "Sí, deshacer" / "Cancelar".
- "Ver en el sitio →" ya abría en pestaña nueva (`target="_blank"`,
  `rel="noopener"`) en `edit-page.tsx`.

### Bloque B — límites en clippings
- `CLIPPING_LIMITS` (medium 80, title 220, url 500) en `lib/clippings.ts`,
  alineados al render público (título recortado a 2 líneas, medio mono corto).
- Validados en el server action (`validateInput`) y replicados en el form
  cliente (`validate()`).

## Verificaciones automáticas

```
npx tsc --noEmit        → sin errores
npx eslint <touched>    → sin warnings
npx next build          → OK (12/12 páginas, sin warnings críticos)
```

## Lo que ya estaba blindado (tandas previas)

- maxChars en **todos** los FieldDef de los 7 schemas (home, servicios,
  mis-valores, casos, contacto, global, seo). Verificado: 0 campos sin tope.
- Validación server-side de maxChars en `saveContentSection` (mide texto
  plano en rich con `htmlToPlainText`).
- Validación cliente en `content-editor.tsx`: `maxFor()` prioriza `maxChars`,
  resaltado bordó al pasarse, botón "Ajustá los campos en rojo" deshabilitado,
  `handleSave` aborta si hay campos over.
- Backup en `content_versions` antes de cada save de contenido.
- Fallbacks hardcodeados vía `fallbacksFor()` en componentes públicos.

## Pendiente — QA manual (bloques E, F, G)

Requiere navegador; no se puede cerrar por código:
- [ ] Probar cada campo en su límite exacto, vacío y con caracteres
      especiales (acentos, ñ, comillas curvas, emojis).
- [ ] Probar listas con 0 / 1 / 50+ items.
- [ ] Viewports 360 / 414 / 768 / 1024 / 1440: sin overflow horizontal,
      sin texto cortado, nav fijo no tapa el hero, float de WhatsApp no
      tapa CTAs ni campos del form.
- [ ] Touch targets ≥ 44×44px; body ≥ 14px en 360px.

## Pendiente — bloque A (help text)
- `maxChars` está al 100%. Falta sumar `help` a los campos de texto público
  que todavía no lo tienen (es cosmético/guía; no afecta el blindaje).
