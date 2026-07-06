/**
 * Utilidades de imagen para clippings — compartidas por cliente y servidor.
 *
 * Módulo de data pura (sin imports de servidor ni React) para poder importarse
 * desde el form admin (client) y las server actions. OJO: NO poner estas
 * constantes en un archivo "use server" (solo exporta funciones async; un const
 * rompe el build con Turbopack).
 */

/** 5 MB (ya comprimida en el cliente antes de subir). */
export const IMAGE_MAX_SIZE = 5_242_880

/** MIME types aceptados. */
export const IMAGE_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

/** Extensiones aceptadas. */
export const IMAGE_ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"] as const

export const IMAGE_ACCEPT_ATTR = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"

/** Bucket público de imágenes de clippings. */
export const IMAGE_BUCKET = "clipping-images"

function extOf(name: string): string {
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i).toLowerCase() : ""
}

/** ¿El archivo es una imagen aceptada (por MIME o por extensión)? */
export function isAllowedImage(name: string, type: string): boolean {
  if (type && (IMAGE_ALLOWED_MIME as readonly string[]).includes(type)) return true
  return (IMAGE_ALLOWED_EXT as readonly string[]).includes(extOf(name))
}

/**
 * Valida un archivo de imagen. Devuelve un mensaje de error o null si es válido.
 * Misma lógica en cliente (antes de subir) y servidor (defensa final).
 */
export function imageFileError(file: { name: string; type: string; size: number }): string | null {
  if (!isAllowedImage(file.name, file.type)) {
    return `Formato no soportado${file.type ? `: ${file.type}` : ""}. Usá JPG, PNG o WebP.`
  }
  if (file.size > IMAGE_MAX_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return `La imagen pesa ${mb} MB. Máximo: 5 MB.`
  }
  return null
}

/** Nombre de archivo "seguro" para el path de Storage. */
export function safeImageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-60)
}

/**
 * Extrae el path dentro del bucket desde una URL pública propia (Supabase).
 * Formato: https://<proj>.supabase.co/storage/v1/object/public/clipping-images/<path>
 * Devuelve null si la URL no es de nuestro bucket (ej. una imagen OG remota).
 */
export function imagePathFromPublicUrl(url: string): string | null {
  const match = url.match(/\/clipping-images\/(.+)$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

/** ¿La URL apunta a nuestro Storage (imagen propia) o es remota (OG del medio)? */
export function isOwnImage(url: string): boolean {
  return imagePathFromPublicUrl(url) !== null
}
