@AGENTS.md

## REGLAS CRÍTICAS

### Edición de contenido (CMS)
- FieldDef admite maxChars (límite duro) y help (guía humana).
  Validación obligatoria en cliente Y servidor.
- Si agregás un campo nuevo, DEFINÍ maxChars según su rol visual.
  Sin maxChars = riesgo de rotura.
- El hero del home tiene DOS variantes responsive en components/hero.tsx
  (HeroMobile / HeroDesktop), con el contenido (c) calculado una sola vez.
  · DESKTOP (hidden md:block): full-bleed, foto de Marian a pantalla
    completa con overlay degradé horizontal y texto (clase .rich-inline)
    encima, centrado-vertical a la izquierda. Piso clamp(640px,80vh,720px).
  · MOBILE (md:hidden): layout dedicado, foto COMPLETA sin crop (aspect
    3:2, objectFit cover) con el H1 superpuesto sobre la zona blanca de
    las cortinas (izquierda, sin overlay oscuro); debajo, en flujo normal
    sobre fondo hueso, van pill + eyebrow + subtitle + CTAs. El subtitle
    mobile es color gris-bordo (NO hueso, que era para overlay oscuro).
  El subtitle admite varios párrafos hasta ~1500 chars.
