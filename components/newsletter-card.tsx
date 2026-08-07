"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import { ArrowRight, Lock, AlertCircle } from "lucide-react"
import { createLead } from "@/app/actions/leads"
import { fsStyle, type FieldScale, type FieldScaleMap } from "@/lib/text-size"

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
  whatsapp_channel_url: string
}

type Status = "idle" | "loading" | "success" | "error"

const EASE = [0.16, 1, 0.3, 1] as const

export function NewsletterCard({
  copy,
  scales,
}: {
  copy: NewsletterCopy
  /** Tamaños/fuentes de page="global" (sección newsletter). */
  scales?: FieldScaleMap
}) {
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
  // El CTA secundario (divisor + WhatsApp) entra 0.15s después del botón de email.
  const secondaryItem = {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: EASE, delay: reduced ? 0 : 0.15 },
    },
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
            titleScale={scales?.["newsletter.success_title"]}
            messageScale={scales?.["newsletter.success_message"]}
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
              {...fsStyle(scales?.["newsletter.eyebrow"], {
                fontSize: "var(--fs-eyebrow)",
                letterSpacing: "0.16em",
                color: "var(--color-bordo)",
                opacity: 0.7,
                marginBottom: 20,
              }, "newsletter.eyebrow")}
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
              {...fsStyle(scales?.["newsletter.title_pre"], {
                fontSize: "var(--fs-h2)",
                lineHeight: "var(--lh-tight)",
                color: "var(--color-negro-bordo)",
                fontWeight: 700,
                marginBottom: 16,
              }, "newsletter.title_pre")}
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
                {...fsStyle(scales?.["newsletter.subtitle"], {
                  fontSize: "var(--fs-body)",
                  lineHeight: "var(--lh-relaxed)",
                  color: "var(--color-gris-bordo)",
                  maxWidth: 480,
                  marginBottom: 36,
                }, "newsletter.subtitle")}
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
                {...fsStyle(scales?.["newsletter.name_label"], inputStyle, "newsletter.name_label")}
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
                {...fsStyle(
                  scales?.["newsletter.email_label"],
                  { ...inputStyle, marginTop: 14, marginBottom: 24 },
                  "newsletter.email_label",
                )}
              />

              {/* Botón principal */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="newsletter-btn font-sans"
                {...fsStyle(scales?.["newsletter.button_label"], {
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
                }, "newsletter.button_label")}
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

              {/* CTA secundario: sumarse al canal de WhatsApp. El email sigue
                  siendo la conversión primaria; esto es una alternativa liviana. */}
              <motion.div variants={secondaryItem}>
                {/* Divisor con «o» */}
                <div className="nl-or-divider" aria-hidden>
                  <span className="nl-or-line" />
                  <span className="nl-or-word font-mono">o</span>
                  <span className="nl-or-line" />
                </div>

                {/* Botón outlined de WhatsApp */}
                <a
                  href={copy.whatsapp_channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Sumate al canal de WhatsApp de Marian Sánchez (se abre en nueva pestaña)"
                  className="newsletter-wa-btn font-sans"
                >
                  <WhatsAppIcon />
                  Sumate al canal de WhatsApp
                </a>
              </motion.div>

              {/* Nota de privacidad */}
              <p
                className="font-mono"
                {...fsStyle(scales?.["newsletter.privacy_note"], {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "var(--fs-micro)",
                  color: "var(--color-gris-bordo)",
                  opacity: 0.7,
                  marginTop: 14,
                }, "newsletter.privacy_note")}
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
  titleScale,
  messageScale,
  reduced,
}: {
  title: string
  message: string
  titleScale?: FieldScale
  messageScale?: FieldScale
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
        {...fsStyle(titleScale, {
          fontSize: "calc(32px * var(--text-scale))",
          fontWeight: 700,
          color: "var(--color-negro-bordo)",
          marginTop: 24,
        }, "newsletter.success_title")}
      >
        {title}
      </motion.p>

      <motion.p
        className="font-sans"
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: reduced ? 0 : 0.6 }}
        {...fsStyle(messageScale, {
          fontSize: "var(--fs-body)",
          color: "var(--color-gris-bordo)",
          marginTop: 12,
          maxWidth: 360,
          lineHeight: "var(--lh-base)",
        }, "newsletter.success_message")}
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

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
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
