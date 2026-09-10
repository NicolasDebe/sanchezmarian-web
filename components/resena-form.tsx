"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowRight, Check } from "lucide-react"
import { StarInput } from "@/components/star-input"
import { SITE_EMAIL } from "@/lib/constants"
import { fadeUp, fadeUpStagger, springSnappy, tapScale } from "@/lib/animations"
import {
  testimonialInputSchema,
  toFieldErrors,
  TESTIMONIAL_LIMITS,
  type ReviewerType,
  type TestimonialFieldErrors,
} from "@/lib/testimonials-schema"
import type { ResenaApiResponse } from "@/app/api/resenas/route"

/**
 * Formulario público de carga de reseñas.
 *
 * El primer campo es SIEMPRE "¿desde dónde escribís?": la respuesta cambia las
 * etiquetas de los tres campos que siguen, así que hasta que no está elegida el
 * resto del formulario está deshabilitado de verdad (un <fieldset disabled>, no
 * solo atenuado con CSS).
 *
 * Valida con el MISMO esquema zod que el servidor: los mensajes que ve la
 * persona son idénticos de los dos lados.
 */

const LABEL =
  "font-mono text-[length:var(--fs-micro)] uppercase tracking-[0.15em] text-gris-bordo"
const HELP = "font-sans text-gris-bordo/70 leading-relaxed"
// text-base (16px) evita el zoom automático de iOS al enfocar un input.
const INPUT_BASE =
  "bg-hueso border rounded-xl px-4 py-3 font-sans text-base text-negro-bordo placeholder:text-gris-bordo/35 focus:outline-none transition-colors w-full"
const INPUT_OK = "border-gris-bordo/20 focus:border-bordo/60"
const INPUT_ERR = "border-bordo focus:border-bordo"

/** Etiquetas y textos que cambian según quién escribe. */
const COPY: Record<
  ReviewerType,
  { role: string; rolePlaceholder: string; brand: string; brandPlaceholder: string; url: string }
> = {
  marca: {
    role: "Tu cargo",
    rolePlaceholder: "Fundadora, gerente de marketing…",
    brand: "Marca u organización",
    brandPlaceholder: "El nombre de tu marca",
    url: "LinkedIn personal o web de la marca",
  },
  periodista: {
    role: "Tu rol",
    rolePlaceholder: "Redactor, editor, productor…",
    brand: "Medio en el que trabajás",
    brandPlaceholder: "El nombre del medio",
    url: "LinkedIn, tu perfil en el medio, o una nota tuya",
  },
}

const TYPE_OPTIONS: { value: ReviewerType; label: string; hint: string }[] = [
  { value: "marca", label: "Trabajé con Marian", hint: "Soy cliente o trabajé con ella" },
  { value: "periodista", label: "Soy periodista", hint: "La trato desde una redacción" },
]

type FormState = {
  author_name: string
  author_role: string
  author_brand: string
  author_url: string
  body: string
  author_email: string
}

const EMPTY: FormState = {
  author_name: "",
  author_role: "",
  author_brand: "",
  author_url: "",
  body: "",
  author_email: "",
}

export function ResenaForm() {
  const [type, setType] = useState<ReviewerType | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [rating, setRating] = useState<number | null>(null)
  const [website, setWebsite] = useState("") // honeypot
  const [errors, setErrors] = useState<TestimonialFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState("")

  const copy = COPY[type ?? "marca"]
  const locked = type === null

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Limpia el error del campo apenas lo tocan: sostener un error mientras
    // alguien está corrigiendo es ruido.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  /** Valida un campo suelto con la misma regla del esquema. */
  const blur = (key: keyof FormState) => () => {
    const field = testimonialInputSchema.shape[key]
    const result = field.safeParse(form[key])
    setErrors((prev) => ({
      ...prev,
      [key]: result.success ? undefined : result.error.issues[0]?.message,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError("")

    const payload = { ...form, reviewer_type: type, rating }
    const parsed = testimonialInputSchema.safeParse(payload)

    if (!parsed.success) {
      const fieldErrors = toFieldErrors(parsed.error)
      setErrors(fieldErrors)
      // Lleva el foco al primer campo con problema en vez de dejar a la persona
      // buscando qué falló en un formulario largo.
      const first = Object.keys(fieldErrors)[0]
      document
        .querySelector<HTMLElement>(`[name="${first}"]`)
        ?.focus({ preventScroll: false })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website }),
      })
      const data: ResenaApiResponse = await res.json()

      if (data.ok) {
        setDone(true)
        return
      }

      if (data.fieldErrors) setErrors(data.fieldErrors)
      setServerError(data.error ?? "No pudimos guardar tu reseña. Probá de nuevo.")
    } catch {
      setServerError(
        `No pudimos conectar con el servidor. Probá de nuevo o escribinos a ${SITE_EMAIL}.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Confirmación ──────────────────────────────────────────────────────────

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-2xl border border-dorado/40 bg-hueso-oscuro px-6 py-10 text-center sm:px-10"
        role="status"
      >
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-bordo">
          <Check size={22} strokeWidth={2.5} className="text-hueso" />
        </span>

        <h2
          className="font-playfair text-negro-bordo"
          style={{ fontSize: "var(--fs-h3)" }}
        >
          Recibimos tu reseña.
        </h2>

        {/* Solo agradecimiento, a pedido de Marian (2026-09-10). Antes acá se
            aclaraba que la reseña se modera y que podía tardar días en salir;
            se sacó a propósito, junto con el mail de contacto para correcciones.
            No volver a agregarlos sin preguntar. */}
        <p
          className={`mx-auto mt-3 max-w-md ${HELP}`}
          style={{ fontSize: "var(--fs-body)" }}
        >
          Gracias por tomarte unos minutos para dejar tu opinión y por
          recomendar mi trabajo a otras personas. Significa mucho.
        </p>
      </motion.div>
    )
  }

  // ─── Formulario ────────────────────────────────────────────────────────────

  const bodyLen = form.body.trim().length
  const bodyShort = bodyLen > 0 && bodyLen < TESTIMONIAL_LIMITS.body.min

  return (
    <motion.form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
      variants={fadeUpStagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-7"
    >
      {/* ── 1. Desde dónde escribís (define todo lo demás) ── */}
      <motion.fieldset variants={fadeUp} className="border-0 p-0 m-0 min-w-0">
        <legend className={`${LABEL} mb-3 p-0`}>¿Desde dónde escribís?</legend>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TYPE_OPTIONS.map((opt) => {
            const selected = type === opt.value
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                aria-pressed={selected}
                whileTap={{ scale: tapScale }}
                transition={springSnappy}
                className={`rounded-2xl border-2 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordo ${
                  selected
                    ? "border-bordo bg-bordo text-hueso"
                    : "border-gris-bordo/20 bg-hueso text-negro-bordo hover:border-bordo/50"
                }`}
              >
                <span
                  className="block font-sans font-semibold"
                  style={{ fontSize: "var(--fs-body-lg)" }}
                >
                  {opt.label}
                </span>
                <span
                  className={`mt-0.5 block font-sans ${
                    selected ? "text-hueso/75" : "text-gris-bordo/70"
                  }`}
                  style={{ fontSize: "var(--fs-caption)" }}
                >
                  {opt.hint}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.fieldset>

      {/* ── 2. Resto del formulario: bloqueado hasta que elija ── */}
      <fieldset
        disabled={locked}
        className={`flex flex-col gap-6 border-0 p-0 m-0 min-w-0 transition-opacity duration-300 ${
          locked ? "opacity-40" : "opacity-100"
        }`}
      >
        <legend className="sr-only">Tu reseña</legend>

        {locked && (
          <p className={HELP} style={{ fontSize: "var(--fs-caption)" }}>
            Elegí una de las dos opciones de arriba para seguir.
          </p>
        )}

        {/* Nombre */}
        <Field
          id="rf-name"
          name="author_name"
          label="Nombre y apellido"
          value={form.author_name}
          onChange={set("author_name")}
          onBlur={blur("author_name")}
          error={errors.author_name}
          autoComplete="name"
          maxLength={TESTIMONIAL_LIMITS.author_name.max}
          placeholder="Como querés que aparezca firmado"
        />

        {/* Cargo / rol */}
        <Field
          id="rf-role"
          name="author_role"
          label={copy.role}
          value={form.author_role}
          onChange={set("author_role")}
          onBlur={blur("author_role")}
          error={errors.author_role}
          autoComplete="organization-title"
          maxLength={TESTIMONIAL_LIMITS.author_role.max}
          placeholder={copy.rolePlaceholder}
        />

        {/* Marca / medio — los dos guardan en author_brand */}
        <Field
          id="rf-brand"
          name="author_brand"
          label={copy.brand}
          value={form.author_brand}
          onChange={set("author_brand")}
          onBlur={blur("author_brand")}
          error={errors.author_brand}
          autoComplete="organization"
          maxLength={TESTIMONIAL_LIMITS.author_brand.max}
          placeholder={copy.brandPlaceholder}
        />

        {/* Link público */}
        <Field
          id="rf-url"
          name="author_url"
          type="url"
          inputMode="url"
          label={copy.url}
          value={form.author_url}
          onChange={set("author_url")}
          onBlur={blur("author_url")}
          error={errors.author_url}
          autoComplete="url"
          maxLength={500}
          placeholder="https://…"
          help="Sirve para que cualquiera pueda verificar quién sos. Se muestra en la web."
        />

        {/* Puntaje */}
        <StarInput
          value={rating}
          onChange={(n) => {
            setRating(n)
            setErrors((prev) => ({ ...prev, rating: undefined }))
          }}
          error={errors.rating}
          disabled={locked}
        />

        {/* Reseña */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rf-body" className={LABEL}>
            Tu reseña
          </label>
          <textarea
            id="rf-body"
            name="body"
            rows={7}
            value={form.body}
            onChange={(e) => set("body")(e.target.value)}
            onBlur={blur("body")}
            maxLength={TESTIMONIAL_LIMITS.body.max}
            aria-describedby="rf-body-count"
            aria-invalid={errors.body ? true : undefined}
            placeholder="Contá cómo fue trabajar con ella: qué necesitabas, qué hizo, qué cambió."
            className={`${INPUT_BASE} ${errors.body ? INPUT_ERR : INPUT_OK} resize-y min-h-[9rem]`}
          />
          <div className="flex items-start justify-between gap-3">
            {errors.body ? (
              <p className="font-mono text-[10px] text-bordo">{errors.body}</p>
            ) : (
              <span />
            )}
            <p
              id="rf-body-count"
              // aria-live off: leer el contador en cada tecla es insoportable
              // con lector de pantalla. El mensaje de error sí se anuncia.
              className={`shrink-0 font-mono text-[10px] tabular-nums ${
                bodyShort ? "text-bordo" : "text-gris-bordo/60"
              }`}
            >
              {bodyShort
                ? `Faltan ${TESTIMONIAL_LIMITS.body.min - bodyLen} caracteres`
                : `${bodyLen} / ${TESTIMONIAL_LIMITS.body.max}`}
            </p>
          </div>
        </div>

        {/* Email */}
        <Field
          id="rf-email"
          name="author_email"
          type="email"
          inputMode="email"
          label="Email"
          value={form.author_email}
          onChange={set("author_email")}
          onBlur={blur("author_email")}
          error={errors.author_email}
          autoComplete="email"
          maxLength={254}
          placeholder="tu@email.com"
          help="No se publica. Es por si necesitamos escribirte por algo de tu reseña."
        />

        {/* Honeypot. Oculto con CSS (no type=hidden ni display:none) para que un
            bot que llena todo lo complete y se delate. tabIndex -1 y
            aria-hidden lo sacan del camino de teclado y lectores de pantalla. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <label htmlFor="rf-website">No completes este campo</label>
          <input
            id="rf-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-3">
          <motion.button
            type="submit"
            disabled={submitting || locked}
            aria-busy={submitting}
            whileTap={submitting || locked ? undefined : { scale: tapScale }}
            transition={springSnappy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bordo px-6 py-4 font-sans font-semibold text-hueso transition-colors hover:bg-bordo-oscuro disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontSize: "var(--fs-body)" }}
          >
            {submitting ? "Enviando…" : "Enviar mi reseña"}
            {!submitting && <ArrowRight size={16} strokeWidth={2.5} />}
          </motion.button>

          {serverError && (
            <p
              role="alert"
              className="text-center font-sans text-bordo"
              style={{ fontSize: "var(--fs-caption)" }}
            >
              {serverError}
            </p>
          )}

          <p
            className="text-center font-sans text-gris-bordo/75 leading-relaxed"
            style={{ fontSize: "var(--fs-caption)" }}
          >
            Tu reseña se publica con tu nombre y sin editar el texto.
            <br className="hidden sm:block" /> Antes de salir pasa por una
            revisión del equipo.
          </p>
        </div>
      </fieldset>
    </motion.form>
  )
}

// ─── Campo de texto reusable ─────────────────────────────────────────────────

function Field({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  help,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  placeholder,
}: {
  id: string
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  help?: string
  type?: string
  inputMode?: "url" | "email" | "text"
  autoComplete?: string
  maxLength?: number
  placeholder?: string
}) {
  const helpId = help ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${INPUT_BASE} ${error ? INPUT_ERR : INPUT_OK}`}
      />
      {help && (
        <p id={helpId} className={HELP} style={{ fontSize: "var(--fs-caption)" }}>
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="font-mono text-[10px] text-bordo">
          {error}
        </p>
      )}
    </div>
  )
}
