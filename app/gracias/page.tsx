import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Gracias — Marian Sánchez",
  robots: { index: false, follow: false },
}

export default function GraciasPage() {
  return (
    <main className="min-h-dvh bg-arena flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center gap-8 max-w-md">

        {/* Ícono */}
        <div className="w-16 h-16 rounded-full border border-dorado/40 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-bordo"
          >
            <path
              d="M4 12.5L9 17.5L20 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Logo */}
        <Image
          src="/images/logo-marian-positivo.png"
          alt="Marian Sánchez"
          width={120}
          height={38}
          className="object-contain"
        />

        {/* Mensaje */}
        <div className="flex flex-col gap-3">
          <h1 className="font-playfair font-bold text-negro-bordo text-[2rem] leading-[1.15]">
            Gracias por escribirme.
          </h1>
          <p className="font-sans text-gris-bordo text-base leading-[1.7]">
            Te contacto pronto.
          </p>
        </div>

        {/* Separador */}
        <div className="w-10 h-px bg-dorado/50" />

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-bordo text-hueso px-8 py-3.5 rounded-full font-sans text-sm font-semibold hover:bg-bordo/90 active:scale-[0.98] transition-all"
        >
          Volver al inicio
          <ArrowRight size={14} strokeWidth={2} />
        </Link>

      </div>
    </main>
  )
}
