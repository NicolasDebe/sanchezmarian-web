"use client"

import React, { useCallback, useEffect, useMemo, useState, type SVGProps } from "react"
import { AnimatePresence, motion, useInView } from "motion/react"
import { useRef } from "react"

const EASE = [0.22, 1, 0.36, 1] as const

/* ── Logos de medios argentinos (text-based SVGs) ── */

function LaNacionLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="34" fontFamily="Georgia, 'Times New Roman', serif" fontSize="22" fontWeight="700" fontStyle="italic" fill="currentColor" letterSpacing="1">La Nación</text>
    </svg>
  )
}

function InfobaeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="32" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="700" fill="currentColor" letterSpacing="-0.5">infobae</text>
    </svg>
  )
}

function LosAndesLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="32" fontFamily="Georgia, serif" fontSize="20" fontWeight="700" fill="currentColor" letterSpacing="2">LOS ANDES</text>
    </svg>
  )
}

function MdzOnlineLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="30" fontFamily="'Courier New', monospace" fontSize="20" fontWeight="700" fill="currentColor">MDZ</text>
      <text x="8" y="46" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="400" fill="currentColor" letterSpacing="2">ONLINE</text>
    </svg>
  )
}

function ClarinLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 140 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="34" fontFamily="Georgia, serif" fontSize="24" fontWeight="800" fontStyle="italic" fill="currentColor">Clarín</text>
    </svg>
  )
}

function DiarioUnoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 150 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="30" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fontWeight="400" fill="currentColor" letterSpacing="3">DIARIO</text>
      <text x="8" y="46" fontFamily="Arial, Helvetica, sans-serif" fontSize="16" fontWeight="700" fill="currentColor" letterSpacing="4">UNO</text>
    </svg>
  )
}

function RadioNihuil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="28" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="400" fill="currentColor" letterSpacing="2">RADIO</text>
      <text x="8" y="45" fontFamily="Georgia, serif" fontSize="18" fontWeight="700" fill="currentColor">Nihuil</text>
    </svg>
  )
}

function ElCronista(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <text x="8" y="26" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="400" fill="currentColor" letterSpacing="2">EL</text>
      <text x="8" y="44" fontFamily="Georgia, serif" fontSize="19" fontWeight="700" fill="currentColor" letterSpacing="1">Cronista</text>
    </svg>
  )
}

/* ── Logo Carousel ── */

interface Logo {
  name: string
  id: number
  img: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  const shuffled = shuffleArray(allLogos)
  const columns: Logo[][] = Array.from({ length: columnCount }, () => [])
  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })
  const maxLength = Math.max(...columns.map((col) => col.length))
  columns.forEach((col) => {
    while (col.length < maxLength) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })
  return columns
}

interface LogoColumnProps {
  logos: Logo[]
  index: number
  currentTime: number
}

const LogoColumn: React.FC<LogoColumnProps> = React.memo(({ logos, index, currentTime }) => {
  const cycleInterval = 2400
  const columnDelay = index * 250
  const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
  const currentIndex = Math.floor(adjustedTime / cycleInterval)

  const CurrentLogo = useMemo(() => logos[currentIndex].img, [logos, currentIndex])

  return (
    <motion.div
      className="h-12 w-28 sm:h-14 sm:w-40 md:h-16 md:w-44 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${logos[currentIndex].id}-${currentIndex}`}
          className="absolute inset-0 flex items-center justify-start pl-2"
          initial={{ y: "10%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 280, damping: 22, mass: 1, duration: 0.5 } }}
          exit={{ y: "-15%", opacity: 0, filter: "blur(4px)", transition: { type: "tween", ease: "easeIn", duration: 0.28 } }}
        >
          <CurrentLogo
            className="w-24 h-10 sm:w-36 sm:h-12 md:w-40 md:h-14 max-w-full max-h-full object-contain"
            style={{ filter: "grayscale(1)", opacity: 0.45 }}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
})
LogoColumn.displayName = "LogoColumn"

function MediaLogoCarousel({ columnCount = 4 }: { columnCount?: number }) {
  const [logoSets, setLogoSets] = useState<Logo[][]>([])
  const [currentTime, setCurrentTime] = useState(0)

  const allLogos: Logo[] = useMemo(() => [
    { name: "La Nación", id: 1, img: LaNacionLogo },
    { name: "Infobae", id: 2, img: InfobaeLogo },
    { name: "Los Andes", id: 3, img: LosAndesLogo },
    { name: "MDZ Online", id: 4, img: MdzOnlineLogo },
    { name: "Clarín", id: 5, img: ClarinLogo },
    { name: "Diario UNO", id: 6, img: DiarioUnoLogo },
    { name: "Radio Nihuil", id: 7, img: RadioNihuil },
    { name: "El Cronista", id: 8, img: ElCronista },
  ], [])

  useEffect(() => {
    setLogoSets(distributeLogos(allLogos, columnCount))
  }, [allLogos, columnCount])

  const updateTime = useCallback(() => {
    setCurrentTime((prev) => prev + 100)
  }, [])

  useEffect(() => {
    const id = setInterval(updateTime, 100)
    return () => clearInterval(id)
  }, [updateTime])

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center sm:justify-start">
      {logoSets.map((logos, index) => (
        <LogoColumn key={index} logos={logos} index={index} currentTime={currentTime} />
      ))}
    </div>
  )
}

/* ── Section ── */

export function Clientes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="bg-hueso py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16 mb-14">
          <div className="flex flex-col gap-3">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-bordo-claro/70"
            >
              Clientes & medios
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="w-10 h-px bg-dorado"
            />

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
              className="font-playfair font-bold text-negro-bordo text-[1.75rem] sm:text-[2.25rem] leading-[1.15]"
            >
              Marcas que <em className="italic text-bordo-claro">confiaron</em> en Marian.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-sans text-gris-bordo/60 text-sm leading-relaxed max-w-[300px] pb-1"
          >
            50+ apariciones en medios nacionales y provinciales.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
        >
          <MediaLogoCarousel columnCount={4} />
        </motion.div>

      </div>
    </section>
  )
}
