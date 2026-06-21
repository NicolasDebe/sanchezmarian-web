import Image from "next/image"
import Link from "next/link"

/**
 * Logo de marca. Reemplaza el texto "Marian." / "Marian Sánchez" por la imagen
 * oficial. `variant="negative"` = logo claro para fondos oscuros (nav/footer);
 * `variant="positive"` = logo oscuro para fondos claros.
 */
export function Logo({
  variant = "negative",
  height = 44,
  priority = false,
  href = "/" as string | null,
  className,
}: {
  variant?: "negative" | "positive"
  height?: number
  priority?: boolean
  href?: string | null
  className?: string
}) {
  const src =
    variant === "negative"
      ? "/images/logo-marian-negativo.png"
      : "/images/logo-marian-positivo.png"

  const img = (
    <Image
      src={src}
      alt="Marian Sánchez"
      width={220}
      height={55}
      preload={priority}
      className={`object-contain ${className ?? ""}`}
      style={{ width: "auto", height: `${height}px` }}
    />
  )

  if (href === null) return img

  return (
    <Link href={href} aria-label="Marian Sánchez — inicio" className="hover:opacity-80 transition-opacity w-fit">
      {img}
    </Link>
  )
}
