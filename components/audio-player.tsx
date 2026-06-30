"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Play, Pause, Loader2, AlertCircle, Headphones } from "lucide-react"
import { formatTime } from "@/lib/audio"

interface AudioPlayerProps {
  src: string
  /** Título opcional (ej. "Conexión Agro · Nihuil"). Solo se muestra en 'full'. */
  title?: string
  /** Duración inicial (segundos) para mostrar sin cargar el archivo. */
  duration?: number | null
  variant?: "full" | "compact"
}

/**
 * Reproductor de audio custom, coherente con la estética del sitio.
 *
 * - 'full': en las cards públicas de /casos-de-exito.
 * - 'compact': en el form admin.
 *
 * Carga diferida: el <audio> solo se monta cuando el player entra al viewport
 * (IntersectionObserver) y con preload="metadata" (no baja el archivo hasta el
 * play). Seeking por click y drag. Accesible por teclado.
 */
export function AudioPlayer({ src, title, duration, variant = "full" }: AudioPlayerProps) {
  const compact = variant === "compact"

  const audioRef = useRef<HTMLAudioElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const [visible, setVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration ?? 0)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [hoverBtn, setHoverBtn] = useState(false)

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

  // ── Lazy mount: observar visibilidad ──
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { rootMargin: "200px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Cleanup al desmontar ──
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [])

  // ── Seek helpers ──
  const timeFromClientX = useCallback(
    (clientX: number): number => {
      const bar = barRef.current
      if (!bar || totalDuration <= 0) return 0
      const rect = bar.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      return ratio * totalDuration
    },
    [totalDuration],
  )

  const commitSeek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = time
    setCurrentTime(time)
  }, [])

  // ── Drag (pointer) ──
  function onPointerDown(e: React.PointerEvent) {
    if (totalDuration <= 0) return
    setIsDragging(true)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setCurrentTime(timeFromClientX(e.clientX))
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    setCurrentTime(timeFromClientX(e.clientX))
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!isDragging) return
    setIsDragging(false)
    commitSeek(timeFromClientX(e.clientX))
  }

  // ── Play / pause ──
  async function handlePlayPause() {
    const audio = audioRef.current
    if (!audio || hasError) return
    if (isPlaying) {
      audio.pause()
      return
    }
    try {
      await audio.play()
    } catch {
      // Algunos browsers requieren gesto del usuario / o el archivo falló.
      setHasError(true)
    }
  }

  // ── Teclado en la barra ──
  function onSliderKeyDown(e: React.KeyboardEvent) {
    if (totalDuration <= 0) return
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      commitSeek(Math.max(0, currentTime - 5))
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      commitSeek(Math.min(totalDuration, currentTime + 5))
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      void handlePlayPause()
    } else if (e.key === "Home") {
      e.preventDefault()
      commitSeek(0)
    } else if (e.key === "End") {
      e.preventDefault()
      commitSeek(totalDuration)
    }
  }

  const pct = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0

  // ── Sizing por variante ──
  const btnSize = compact ? 36 : 44
  const barH = compact ? 6 : 8
  const timeFs = compact ? 11 : "var(--fs-eyebrow)"
  const padding = compact ? "12px 16px" : "16px 20px"

  // ── Error ──
  if (hasError) {
    return (
      <div
        ref={rootRef}
        className="flex items-center gap-3"
        style={{
          background: "var(--color-hueso-oscuro)",
          borderRadius: 12,
          padding: 16,
          border: "1px solid rgba(201,168,130,0.2)",
          marginTop: compact ? 0 : 12,
        }}
      >
        <AlertCircle size={18} style={{ color: "var(--color-gris-bordo)", flexShrink: 0 }} />
        <span className="font-sans" style={{ fontSize: 13, color: "var(--color-gris-bordo)" }}>
          No se pudo cargar el audio.
        </span>
      </div>
    )
  }

  const timeLabel =
    totalDuration > 0
      ? `${formatTime(currentTime)} / ${formatTime(totalDuration)}`
      : "--:-- / --:--"

  return (
    <div
      ref={rootRef}
      style={{
        background: "var(--color-hueso-oscuro)",
        borderRadius: 12,
        padding,
        border: "1px solid rgba(201,168,130,0.2)",
        marginTop: compact ? 0 : 12,
      }}
    >
      {visible && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration
            if (Number.isFinite(d) && d > 0) setTotalDuration(d)
            setIsLoading(false)
          }}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={(e) => {
            if (!isDragging) setCurrentTime(e.currentTarget.currentTime)
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false)
            setCurrentTime(0)
          }}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
        />
      )}

      {!compact && title && (
        <div
          className="flex items-center gap-1.5"
          style={{ marginBottom: 8 }}
        >
          <Headphones size={12} style={{ color: "var(--color-bordo)", opacity: 0.6 }} />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: "var(--fs-eyebrow)",
              letterSpacing: "0.1em",
              color: "var(--color-bordo)",
              opacity: 0.6,
            }}
          >
            {title}
          </span>
        </div>
      )}

      <div className="flex items-center">
        {/* Play / pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          disabled={isLoading}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          style={{
            flexShrink: 0,
            width: btnSize,
            height: btnSize,
            borderRadius: "50%",
            background: hoverBtn ? "var(--color-bordo-oscuro)" : "var(--color-bordo)",
            color: "var(--color-hueso)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: isLoading ? "default" : "pointer",
            transform: reduceMotion ? "none" : hoverBtn ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.15s ease, background 0.15s ease",
          }}
          onMouseDown={(e) => {
            if (!reduceMotion) (e.currentTarget.style.transform = "scale(0.95)")
          }}
          onMouseUp={(e) => {
            if (!reduceMotion) (e.currentTarget.style.transform = "scale(1.05)")
          }}
        >
          {isLoading ? (
            <Loader2 size={compact ? 14 : 16} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={compact ? 14 : 16} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play size={compact ? 14 : 16} fill="currentColor" strokeWidth={0} style={{ marginLeft: 1 }} />
          )}
        </button>

        {/* Barra de progreso */}
        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label="Progreso del audio"
          aria-valuemin={0}
          aria-valuemax={Math.round(totalDuration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={timeLabel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onSliderKeyDown}
          style={{
            position: "relative",
            flexGrow: 1,
            margin: "0 16px",
            height: barH,
            background: "rgba(201,168,130,0.2)",
            borderRadius: 999,
            cursor: totalDuration > 0 ? "pointer" : "default",
            touchAction: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${pct}%`,
              background: "var(--color-bordo)",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${pct}%`,
              top: "50%",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "var(--color-bordo)",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 1px 3px rgba(26,0,8,0.3)",
              opacity: totalDuration > 0 ? 1 : 0,
            }}
          />
        </div>

        {/* Tiempo */}
        <span
          className="font-mono tabular-nums"
          style={{
            flexShrink: 0,
            fontSize: timeFs,
            color: "var(--color-bordo)",
            opacity: 0.8,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {timeLabel}
        </span>
      </div>
    </div>
  )
}
