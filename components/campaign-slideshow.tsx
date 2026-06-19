"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"

interface SlideImage {
  src: string
  alt: string
}

interface CampaignSlideshowProps {
  images: SlideImage[]
  campaignName: string
}

function ProgressBar({ duration, isPaused }: { duration: number; isPaused: boolean }) {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!isPaused) {
      const id = requestAnimationFrame(() => setStarted(true))
      return () => cancelAnimationFrame(id)
    } else {
      setStarted(false)
    }
  }, [isPaused])

  return (
    <div
      style={{
        height:     "100%",
        background: "var(--color-hueso)",
        width:      started ? "100%" : "0%",
        transition: started ? `width ${duration}ms linear` : "none",
      }}
    />
  )
}

export function CampaignSlideshow({ images, campaignName }: CampaignSlideshowProps) {
  const [currentIndex, setCurrentIndex]     = useState(0)
  const [isPaused, setIsPaused]             = useState(false)
  const [loadedSlides, setLoadedSlides]     = useState<Set<number>>(new Set())
  const [slideshowReady, setSlideshowReady] = useState(false)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const resumeRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX  = useRef<number | null>(null)

  const isLoaded = loadedSlides.has(currentIndex)

  function handleImageLoad(index: number) {
    setLoadedSlides(prev => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
    // El slideshow arranca solo después de que la primera imagen cargó
    if (index === 0) setSlideshowReady(true)
  }

  function handleInteract() {
    setIsPaused(true)
    if (resumeRef.current) clearTimeout(resumeRef.current)
    resumeRef.current = setTimeout(() => setIsPaused(false), 5000)
  }

  function goTo(index: number) {
    setCurrentIndex(index)
    handleInteract()
  }

  function goPrev() {
    setCurrentIndex(i => (i - 1 + images.length) % images.length)
    handleInteract()
  }

  function goNext() {
    setCurrentIndex(i => (i + 1) % images.length)
    handleInteract()
  }

  // Swipe táctil en mobile: gesto horizontal >40px cambia de slide.
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 40) goPrev()
    else if (delta < -40) goNext()
    touchStartX.current = null
  }

  // El intervalo no arranca hasta que slideshowReady sea true
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!isPaused && slideshowReady) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(i => (i + 1) % images.length)
      }, 4000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPaused, images.length, slideshowReady])

  useEffect(() => {
    return () => { if (resumeRef.current) clearTimeout(resumeRef.current) }
  }, [])

  return (
    <>
      <style>{`
        .cs-container { aspect-ratio: 16/10; }
        .cs-btn       { width: 44px; height: 44px; }
        .cs-btn-prev  { left: 20px; }
        .cs-btn-next  { right: 20px; }
        @media (max-width: 767px) {
          .cs-container { aspect-ratio: 4/3; }
          .cs-btn       { width: 44px !important; height: 44px !important; }
          .cs-btn-prev  { left: 10px !important; }
          .cs-btn-next  { right: 10px !important; }
        }
      `}</style>

      <div style={{ marginTop: 56 }}>

        {/* Label */}
        <p
          className="font-mono uppercase"
          style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--color-bordo)", marginBottom: 16 }}
        >
          Galería — {campaignName}
        </p>

        {/* Contenedor principal */}
        <div
          className="cs-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position:     "relative",
            width:        "100%",
            borderRadius: 16,
            overflow:     "hidden",
            background:   "var(--color-arena)",
            touchAction:  "pan-y",
          }}
        >
          {/* Barra de progreso: espera a que slideshowReady sea true */}
          <div
            key={currentIndex}
            style={{
              position:   "absolute",
              top:        0,
              left:       0,
              right:      0,
              height:     2,
              zIndex:     10,
              background: "rgba(254,252,239,0.2)",
            }}
          >
            <ProgressBar duration={4000} isPaused={isPaused || !slideshowReady} />
          </div>

          {/* Imagen activa — fade-in solo después del onLoad */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0 }}
            >
              <Image
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                priority={currentIndex === 0}
                loading={currentIndex > 0 && currentIndex < 3 ? "eager" : undefined}
                onLoad={() => handleImageLoad(currentIndex)}
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Overlay gradiente */}
          <div
            style={{
              position:      "absolute",
              bottom:        0,
              left:          0,
              right:         0,
              height:        80,
              background:    "linear-gradient(transparent, rgba(0,0,0,0.3))",
              pointerEvents: "none",
              zIndex:        5,
            }}
          />

          {/* Counter */}
          <div
            className="font-mono"
            style={{
              position:       "absolute",
              top:            16,
              right:          16,
              fontSize:       11,
              color:          "rgba(255,255,255,0.6)",
              background:     "rgba(0,0,0,0.25)",
              backdropFilter: "blur(6px)",
              borderRadius:   100,
              padding:        "4px 12px",
              zIndex:         10,
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>

          {/* Botón anterior */}
          <button
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="cs-btn cs-btn-prev"
            style={{
              position:       "absolute",
              top:            "50%",
              transform:      "translateY(-50%)",
              zIndex:         10,
              borderRadius:   "50%",
              background:     "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
              border:         "1px solid rgba(255,255,255,0.15)",
              color:          "#fff",
              display:        "grid",
              placeItems:     "center",
              cursor:         "pointer",
              transition:     "background 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)"
              e.currentTarget.style.transform  = "translateY(-50%) scale(1.05)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)"
              e.currentTarget.style.transform  = "translateY(-50%) scale(1)"
            }}
            onMouseDown={e => { e.currentTarget.style.transform = "translateY(-50%) scale(0.95)" }}
            onMouseUp={e =>   { e.currentTarget.style.transform = "translateY(-50%) scale(1.05)" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          {/* Botón siguiente */}
          <button
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="cs-btn cs-btn-next"
            style={{
              position:       "absolute",
              top:            "50%",
              transform:      "translateY(-50%)",
              zIndex:         10,
              borderRadius:   "50%",
              background:     "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
              border:         "1px solid rgba(255,255,255,0.15)",
              color:          "#fff",
              display:        "grid",
              placeItems:     "center",
              cursor:         "pointer",
              transition:     "background 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(0,0,0,0.55)"
              e.currentTarget.style.transform  = "translateY(-50%) scale(1.05)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(0,0,0,0.35)"
              e.currentTarget.style.transform  = "translateY(-50%) scale(1)"
            }}
            onMouseDown={e => { e.currentTarget.style.transform = "translateY(-50%) scale(0.95)" }}
            onMouseUp={e =>   { e.currentTarget.style.transform = "translateY(-50%) scale(1.05)" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          {/* Dots */}
          <div
            style={{
              position:  "absolute",
              bottom:    16,
              left:      "50%",
              transform: "translateX(-50%)",
              display:   "flex",
              gap:       6,
              zIndex:    10,
            }}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                style={{
                  display:     "grid",
                  placeItems:  "center",
                  height:      28,
                  padding:     "0 4px",
                  background:  "transparent",
                  border:      "none",
                  cursor:      "pointer",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display:      "block",
                    width:        i === currentIndex ? 20 : 6,
                    height:       6,
                    borderRadius: 100,
                    background:   i === currentIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                    transition:   "all 0.3s ease",
                  }}
                />
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
