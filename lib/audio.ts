/**
 * Utilidades de audio para clippings — compartidas por cliente y servidor.
 *
 * Módulo de data pura (sin imports de servidor ni React) para poder importarse
 * desde el form admin (client), el player (client) y las server actions. OJO:
 * NO poner estas constantes en un archivo "use server" (solo exporta funciones
 * async; un const rompe el build con Turbopack).
 */

/** 30 MB. */
export const AUDIO_MAX_SIZE = 31_457_280

/** MIME types aceptados (mp3, m4a, wav, ogg con sus variantes). */
export const AUDIO_ALLOWED_MIME = [
  "audio/mpeg", // mp3
  "audio/mp4", // m4a
  "audio/x-m4a", // m4a alt
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
] as const

/** Extensiones aceptadas (fallback: algunos browsers no setean MIME en m4a). */
export const AUDIO_ALLOWED_EXT = [".mp3", ".m4a", ".wav", ".ogg"] as const

export const AUDIO_ACCEPT_ATTR = "audio/*,.mp3,.m4a,.wav,.ogg"

function extOf(name: string): string {
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i).toLowerCase() : ""
}

/** ¿El archivo es un audio aceptado (por MIME o por extensión)? */
export function isAllowedAudio(name: string, type: string): boolean {
  if (type && (AUDIO_ALLOWED_MIME as readonly string[]).includes(type)) return true
  return (AUDIO_ALLOWED_EXT as readonly string[]).includes(extOf(name))
}

/**
 * Valida un archivo de audio. Devuelve un mensaje de error o null si es válido.
 * Misma lógica en cliente (antes de subir) y servidor (defensa final).
 */
export function audioFileError(file: { name: string; type: string; size: number }): string | null {
  if (!isAllowedAudio(file.name, file.type)) {
    return `Formato no soportado${file.type ? `: ${file.type}` : ""}. Usá mp3, m4a, wav u ogg.`
  }
  if (file.size > AUDIO_MAX_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return `El archivo pesa ${mb} MB. Máximo: 30 MB.`
  }
  return null
}

/** Nombre de archivo "seguro" para el path de Storage. */
export function safeAudioName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-60)
}

/**
 * Extrae el path dentro del bucket desde una URL pública.
 * Formato: https://<proj>.supabase.co/storage/v1/object/public/clipping-audios/<path>
 */
export function audioPathFromPublicUrl(url: string): string | null {
  const match = url.match(/\/clipping-audios\/(.+)$/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

/** Nombre legible del archivo a partir de la URL/path (para el admin). */
export function audioFileLabel(url: string): string {
  const path = audioPathFromPublicUrl(url) ?? url
  const base = path.split("/").pop() ?? path
  // Saca el prefijo timestamp- que agregamos al subir.
  return base.replace(/^\d{10,}-/, "")
}

/** Segundos → "MM:SS" (o "H:MM:SS" si supera la hora). */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--"
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, "0")
  const ss = String(s).padStart(2, "0")
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
