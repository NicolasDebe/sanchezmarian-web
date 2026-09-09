/**
 * Validación de las reseñas (tabla `testimonials`).
 *
 * Es la fuente ÚNICA de verdad de los límites: la usa el formulario público
 * (cliente) y el route handler (servidor). Los mensajes están escritos para que
 * Marian o quien reseñe los lea tal cual, en castellano rioplatense.
 *
 * Los límites de caracteres van alineados con lo que entra en la tarjeta: si
 * algún día se agranda el `body`, hay que revisar el diseño, no solo este
 * archivo.
 */
import { z } from "zod"

// ─── Límites (exportados para contadores de caracteres en la UI) ──────────────

export const TESTIMONIAL_LIMITS = {
  author_name: { min: 3, max: 80 },
  author_role: { min: 3, max: 80 },
  author_brand: { min: 2, max: 80 },
  body: { min: 80, max: 1200 },
  rating: { min: 1, max: 5 },
} as const

export const REVIEWER_TYPES = ["marca", "periodista"] as const
export type ReviewerType = (typeof REVIEWER_TYPES)[number]

export const REVIEWER_TYPE_LABELS: Record<ReviewerType, string> = {
  marca: "Marca / cliente",
  periodista: "Periodista",
}

// ─── Esquema ─────────────────────────────────────────────────────────────────

export const testimonialInputSchema = z.object({
  reviewer_type: z.enum(REVIEWER_TYPES, {
    error: "Contanos si escribís como marca o como periodista.",
  }),

  author_name: z
    .string({ error: "Escribí tu nombre." })
    .trim()
    .min(TESTIMONIAL_LIMITS.author_name.min, {
      error: "Escribí tu nombre completo (al menos 3 caracteres).",
    })
    .max(TESTIMONIAL_LIMITS.author_name.max, {
      error: "El nombre no puede tener más de 80 caracteres.",
    }),

  author_role: z
    .string({ error: "Escribí tu rol." })
    .trim()
    .min(TESTIMONIAL_LIMITS.author_role.min, {
      error: "Escribí tu rol o cargo (al menos 3 caracteres).",
    })
    .max(TESTIMONIAL_LIMITS.author_role.max, {
      error: "El rol no puede tener más de 80 caracteres.",
    }),

  author_brand: z
    .string({ error: "Escribí tu marca o el medio en el que trabajás." })
    .trim()
    .min(TESTIMONIAL_LIMITS.author_brand.min, {
      error: "Escribí tu marca, organización o medio (al menos 2 caracteres).",
    })
    .max(TESTIMONIAL_LIMITS.author_brand.max, {
      error: "La marca o el medio no puede tener más de 80 caracteres.",
    }),

  // El trim va ANTES del formato (con .pipe): la gente pega enlaces y mails con
  // espacios al final y no tiene por qué ver un error por eso.
  // `protocol` deja afuera cosas como javascript: o data:, que se colarían con
  // una validación de URL a secas y terminarían en un href del sitio público.
  author_url: z
    .string({ error: "Pegá el enlace a tu LinkedIn, tu web o tu perfil en el medio." })
    .trim()
    .pipe(
      z
        .url({
          protocol: /^https?$/,
          error:
            "Pegá un enlace válido que empiece con https:// (tu LinkedIn, tu web o tu perfil en el medio).",
        })
        .max(500, { error: "El enlace es demasiado largo." }),
    ),

  rating: z.coerce
    .number({ error: "Elegí una puntuación de 1 a 5 estrellas." })
    .int({ error: "La puntuación tiene que ser un número entero de 1 a 5." })
    .min(TESTIMONIAL_LIMITS.rating.min, {
      error: "Elegí una puntuación de 1 a 5 estrellas.",
    })
    .max(TESTIMONIAL_LIMITS.rating.max, {
      error: "La puntuación máxima es 5 estrellas.",
    }),

  body: z
    .string({ error: "Escribí tu reseña." })
    .trim()
    .min(TESTIMONIAL_LIMITS.body.min, {
      error: "Contanos un poco más: la reseña necesita al menos 80 caracteres.",
    })
    .max(TESTIMONIAL_LIMITS.body.max, {
      error: "La reseña no puede tener más de 1200 caracteres.",
    }),

  // No se muestra nunca en público: sirve para verificar que la reseña es real.
  author_email: z
    .string({ error: "Escribí tu email." })
    .trim()
    .toLowerCase()
    .pipe(
      z
        .email({ error: "Revisá el email, parece que tiene algún error." })
        .max(254, { error: "El email es demasiado largo." }),
    ),
})

/** Datos ya validados y normalizados (trim + email en minúsculas). */
export type TestimonialInput = z.infer<typeof testimonialInputSchema>

/** Lo que manda el formulario, antes de validar. */
export type TestimonialInputRaw = z.input<typeof testimonialInputSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Errores por campo, listos para pintar debajo de cada input. */
export type TestimonialFieldErrors = Partial<
  Record<keyof TestimonialInput, string>
>

/**
 * Aplana los issues de zod a `{ campo: "mensaje" }`, quedándose con el primer
 * mensaje de cada campo (que es el más específico para quien está escribiendo).
 */
export function toFieldErrors(error: z.ZodError): TestimonialFieldErrors {
  const out: TestimonialFieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof TestimonialInput | undefined
    if (key && !out[key]) out[key] = issue.message
  }
  return out
}
