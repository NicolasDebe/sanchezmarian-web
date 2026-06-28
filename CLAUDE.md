@AGENTS.md

## REGLAS CRÍTICAS

### Edición de contenido (CMS)
- FieldDef admite maxChars (límite duro) y help (guía humana).
  Validación obligatoria en cliente Y servidor.
- Si agregás un campo nuevo, DEFINÍ maxChars según su rol visual.
  Sin maxChars = riesgo de rotura.
- El hero del home es full-bleed: foto de Marian a pantalla completa
  con overlay degradé y texto (clase .rich-inline) encima, alineado
  abajo-izquierda en mobile y centrado-vertical en desktop. El
  subtitle admite varios párrafos hasta ~1500 chars; el alto mínimo
  (680px) y el overlay reforzado están calibrados para ese texto.
