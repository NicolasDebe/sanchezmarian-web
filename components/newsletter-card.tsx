"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import { ArrowRight, Lock, AlertCircle } from "lucide-react"
import { createLead } from "@/app/actions/leads"

export type NewsletterCopy = {
  eyebrow: string
  title_pre: string
  title_accent: string
  subtitle: string
  name_label: string
  email_label: string
  button_label: string
  success_title: string
  success_message: string
  privacy_note: string
}

type Status = "idle" | "loading" | "success" | "error"

const EASE = [0.16, 1, 0.3, 1] as const

export function NewsletterCard({ copy }: { copy: NewsletterCopy }) {
  const reduced = useReducedMotion()
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // El tooltip de error se autodescarta a los 4s.
  useEffect(() => {
    if (status !== "error") return
    errorTimer.current = setTimeout(() => setStatus("idle"), 4000)
    return () => {
      if (errorTimer.current) clearTimeout(errorTimer.current)
    }
  }, [status])

  function clearErrorOnType() {
    if (status === "error") setStatus("idle")
  }

  async function handleSubmit() {
    if (status === "loading") return
    // Validación rápida en cliente (el server vuelve a validar igual).
    if (!nombre.trim()) {
      setErrorMsg("Ingresá tu nombre")
      setStatus("error")
      return
    }
    if (!email.trim()) {
      setErrorMsg("Ingresá tu email")
      setStatus("error")
      return
    }
    setStatus("loading")
    const result = await createLead(nombre, email)
    if (result.success) {
      setNombre("")
      setEmail("")
      setStatus("success")
    } else {
      setErrorMsg(result.error)
      setStatus("error")
    }
  }

  // Stagger de entrada al viewport (once).
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.1,
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  }
  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  }

  const loading = status === "loading"

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="relative mx-auto"
      style={{
        maxWidth: 680,
        background: "var(--color-arena)",
        borderRadius: 24,
        padding: "clamp(40px, 5vw, 64px)",
        boxShadow: "0 8px 32px rgba(102,0,31,0.06)",
      }}
    >
      {/* Asterisco decorativo, esquina superior derecha */}
      <Asterisk
        aria-hidden
        style={{
          position: "absolute",
          top: "clamp(20px, 3vw, 32px)",
          right: "clamp(20px, 3vw, 32px)",
          width: "clamp(24px, 3vw, 40px)",
          height: "clamp(24px, 3vw, 40px)",
          color: "var(--color-dorado)",
          opacity: 0.3,
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <SuccessState
            key="success"
            title={copy.success_title}
            message={copy.success_message}
            reduced={!!reduced}
          />
        ) : (
          <motion.div
            key="form"
            variants={container}
            initial="hidden"
            animate="visible"
            exit={{
              opacity: 0,
              scale: reduced ? 1 : 0.98,
              y: reduced ? 0 : -8,
              transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            {/* Eyebrow */}
            <motion.p
              variants={item}
              className="font-mono uppercase"
              style={{
                fontSize: "var(--fs-eyebrow)",
                letterSpacing: "0.16em",
                color: "var(--color-bordo)",
                opacity: 0.7,
                marginBottom: 20,
              }}
            >
              {copy.eyebrow}
            </motion.p>

            {/* Línea dorada (scaleX origin-left) */}
            <motion.div
              variants={{
                hidden: { scaleX: reduced ? 1 : 0 },
                visible: {
                  scaleX: 1,
                  transition: { duration: 0.25, ease: EASE },
                },
              }}
              style={{
                width: 40,
                height: 1.5,
                background: "var(--color-dorado)",
                transformOrigin: "left",
                marginBottom: 28,
              }}
            />

            {/* Título (pre + accent) */}
            <motion.h2
              variants={item}
              className="font-playfair"
              style={{
                fontSize: "var(--fs-h2)",
                lineHeight: "var(--lh-tight)",
                color: "var(--color-negro-bordo)",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              {copy.title_pre}{" "}
              <em style={{ fontStyle: "italic", color: "var(--color-bordo)" }}>
                {copy.title_accent}
              </em>
            </motion.h2>

            {/* Subtítulo (solo si tiene contenido) */}
            {copy.subtitle?.trim() ? (
              <motion.p
                variants={item}
                className="font-sans"
                style={{
                  fontSize: "var(--fs-body)",
                  lineHeight: "var(--lh-relaxed)",
                  color: "var(--color-gris-bordo)",
                  maxWidth: 480,
                  marginBottom: 36,
                }}
              >
                {copy.subtitle}
              </motion.p>
            ) : null}

            {/* Form (sin <form>, submit por botón / Enter) */}
            <motion.div variants={item} style={{ position: "relative" }}>
              {/* Tooltip de error sobre el primer input */}
              <AnimatePresence>
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    role="alert"
                    className="font-sans"
                    style={{
                      position: "absolute",
                      top: -12,
                      left: 0,
                      transform: "translateY(-100%)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--color-bordo)",
                      color: "var(--color-hueso)",
                      fontSize: 13,
                      padding: "10px 14px",
                      borderRadius: 8,
                      zIndex: 2,
                      boxShadow: "0 8px 20px -10px rgba(102,0,31,0.5)",
                    }}
                  >
                    <AlertCircle size={14} strokeWidth={2} />
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Campo nombre */}
              <input
                type="text"
                autoComplete="name"
                value={nombre}
                disabled={loading}
                placeholder={copy.name_label}
                aria-label={copy.name_label}
                onChange={(e) => {
                  setNombre(e.target.value)
                  clearErrorOnType()
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                }}
                className="newsletter-input font-sans"
                style={inputStyle}
              />

              {/* Campo email */}
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                disabled={loading}
                placeholder={copy.email_label}
                aria-label={copy.email_label}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearErrorOnType()
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit()
                }}
                className="newsletter-input font-sans"
                style={{ ...inputStyle, marginTop: 14, marginBottom: 24 }}
              />

              {/* Botón principal */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="newsletter-btn font-sans"
                style={{
                  background: "var(--color-bordo)",
                  color: "var(--color-hueso)",
                  borderRadius: 999,
                  padding: "16px 32px",
                  fontSize: "var(--fs-body)",
                  fontWeight: 600,
                  border: "none",
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  width: "100%",
                  minWidth: 200,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background 0.2s ease, transform 0.2s ease",
                }}
              >
                {loading ? (
                  <>
                    <Spinner /> Enviando…
                  </>
                ) : (
                  <>
                    {copy.button_label}
                    <ArrowRight className="nl-arrow" size={16} strokeWidth={2} />
                  </>
                )}
              </button>

              {/* Nota de privacidad */}
              <p
                className="font-mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "var(--fs-micro)",
                  color: "var(--color-gris-bordo)",
                  opacity: 0.7,
                  marginTop: 14,
                }}
              >
                <Lock size={12} strokeWidth={2} />
                {copy.privacy_note}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  background: "var(--color-hueso)",
  border: "1.5px solid rgba(102,0,31,0.2)",
  borderRadius: 12,
  padding: "14px 18px",
  fontSize: "var(--fs-body)",
  color: "var(--color-negro-bordo)",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
}

function SuccessState({
  title,
  message,
  reduced,
}: {
  title: string
  message: string
  reduced: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: reduced ? 1 : 0.95, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
      className="flex flex-col items-center text-center"
      style={{ paddingTop: 8, paddingBottom: 8 }}
    >
      <AnimatedCheck reduced={reduced} />

      <motion.p
        className="font-playfair"
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: reduced ? 0 : 0.4 }}
        style={{
          fontSize: "calc(32px * var(--text-scale))",
          fontWeight: 700,
          color: "var(--color-negro-bordo)",
          marginTop: 24,
        }}
      >
        {title}
      </motion.p>

      <motion.p
        className="font-sans"
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: reduced ? 0 : 0.6 }}
        style={{
          fontSize: "var(--fs-body)",
          color: "var(--color-gris-bordo)",
          marginTop: 12,
          maxWidth: 360,
          lineHeight: "var(--lh-base)",
        }}
      >
        {message}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : 0.8 }}
        style={{ marginTop: 32 }}
      >
        <Asterisk
          aria-hidden
          className="nl-asterisk"
          style={{
            width: 24,
            height: 24,
            color: "var(--color-dorado)",
            animation: reduced ? "none" : "newsletter-spin 30s linear infinite",
          }}
        />
      </motion.div>
    </motion.div>
  )
}

function AnimatedCheck({ reduced }: { reduced: boolean }) {
  return (
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: "rgba(102,0,31,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          stroke="var(--color-bordo)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: [0.65, 0, 0.35, 1] }}
          style={{ opacity: 0.5 }}
        />
        <motion.path
          d="M20 33 L29 42 L45 23"
          stroke="var(--color-bordo)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reduced ? 0 : 0.6,
            ease: [0.65, 0, 0.35, 1],
            delay: reduced ? 0 : 0.2,
          }}
        />
      </svg>
    </div>
  )
}

function Asterisk({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
  "aria-hidden"?: boolean
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2 L13.4 9 L19.5 5.2 L14.8 10.4 L22 12 L14.8 13.6 L19.5 18.8 L13.4 15 L12 22 L10.6 15 L4.5 18.8 L9.2 13.6 L2 12 L9.2 10.4 L4.5 5.2 L10.6 9 Z" />
    </svg>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 14,
        height: 14,
        border: "2px solid rgba(254,252,239,0.4)",
        borderTopColor: "var(--color-hueso)",
        borderRadius: "50%",
        display: "inline-block",
        animation: "newsletter-spin 0.7s linear infinite",
      }}
    />
  )
}
