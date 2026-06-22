/**
 * Íconos sociales estilo lucide (line icons genéricos, NO los logos oficiales
 * de marca). lucide-react 1.16 retiró los glifos `Instagram`/`Linkedin` por
 * brand guidelines; los recreamos localmente con la misma API (size /
 * strokeWidth / className) para usarlos en nav, bio, CTA y footer.
 */

type SocialIconProps = {
  size?: number
  strokeWidth?: number
  className?: string
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
})

export function Instagram({ size = 18, strokeWidth = 2, className }: SocialIconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function Linkedin({ size = 18, strokeWidth = 2, className }: SocialIconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}
