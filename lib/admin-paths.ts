/**
 * Ruta pública asociada a cada `page` de content_blocks.
 *
 * Vive en su propio módulo (no en app/admin/actions.ts) porque ese archivo es
 * "use server" y solo puede exportar funciones async: un objeto plano rompería
 * el build. Se usa para revalidar el sitio tras guardar y para el link
 * "Ver en el sitio →" del admin.
 */
export const PAGE_PATHS: Record<string, string> = {
  home: "/",
  servicios: "/servicios",
  mis_valores: "/mis-valores",
  casos_de_exito: "/casos-de-exito",
  contacto: "/contacto",
  global: "/",
  seo: "/",
}
