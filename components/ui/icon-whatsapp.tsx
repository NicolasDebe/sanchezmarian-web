/**
 * Glifo oficial de WhatsApp como SVG inline (currentColor). Fuente única para
 * el botón flotante, el navbar, el footer y las cards de contacto, así el ícono
 * es idéntico en todo el sitio. Lucide no incluye la marca WhatsApp.
 */
export function IconWhatsApp({
  size = 24,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.79L2 22l5.41-1.36c1.35.74 2.9 1.16 4.63 1.16 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.52 14.08c-.23.65-1.35 1.25-1.85 1.32-.49.07-1.08.1-1.73-.11-.4-.13-.9-.3-1.55-.59-2.73-1.18-4.5-3.92-4.64-4.1-.13-.18-1.09-1.45-1.09-2.77 0-1.31.69-1.96.93-2.22.24-.26.53-.32.7-.32.18 0 .35.01.5.02.17.01.39-.06.61.47.23.55.77 1.88.84 2.02.07.14.12.3.02.48-.1.18-.15.29-.3.45-.14.16-.3.35-.42.47-.14.14-.29.29-.12.57.17.28.75 1.24 1.6 2.01 1.1 1 2.02 1.31 2.3 1.45.29.14.45.12.62-.07.17-.19.72-.84.91-1.13.19-.28.39-.24.65-.14.26.1 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.66-.16 1.3z" />
    </svg>
  )
}
