"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { fadeUp, fadeUpStagger, viewportOnce, springSnappy, tapScale } from "@/lib/animations"
import { MotionLink } from "@/components/ui/motion-link"
import { CampaignSlideshow } from "@/components/campaign-slideshow"
import { RichText } from "@/components/ui/RichText"
import { STATUS_LABELS, type Campaign } from "@/lib/types/campaign"

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const styles: Record<Campaign["status"], React.CSSProperties> = {
    draft: { background: "var(--color-arena)", color: "var(--color-gris-bordo)" },
    active: { background: "var(--color-bordo)", color: "var(--color-hueso)" },
    finished: { background: "var(--color-bordo-oscuro)", color: "var(--color-hueso)" },
  }
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: "var(--fs-micro)",
        letterSpacing: "0.1em",
        borderRadius: 100,
        padding: "3px 12px",
        ...styles[status],
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

/** Página detalle de una campaña: header editorial + contenido HTML + slideshow. */
export function CampanaDetail({ campaign }: { campaign: Campaign }) {
  const images = (campaign.images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ src: img.url, alt: img.alt || campaign.title }))

  const initial = campaign.brand.trim()[0]?.toUpperCase() ?? "?"

  return (
    <section
      className="bg-hueso"
      style={{ paddingTop: "clamp(110px, 14vh, 150px)" }}
    >
      <div
        className="max-w-7xl mx-auto"
        style={{ padding: "0 clamp(20px, 5vw, 64px) clamp(60px, 10vh, 120px)" }}
      >
        <motion.div variants={fadeUpStagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Link
              href="/campanas"
              className="font-sans inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ fontSize: "var(--fs-caption)", color: "var(--color-gris-bordo)", textDecoration: "none", marginBottom: 40 }}
            >
              <ArrowLeft size={13} strokeWidth={2} />
              Todas las campañas
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-start sm:items-center"
            style={{ gap: "clamp(16px, 3vw, 40px)", marginBottom: 40 }}
          >
            <div
              className="font-playfair"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--color-bordo)",
                color: "var(--color-hueso)",
                display: "grid",
                placeItems: "center",
                fontSize: "calc(24px * var(--text-scale))",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>

            <div>
              <p
                className="font-mono uppercase"
                style={{ fontSize: "var(--fs-eyebrow)", letterSpacing: "0.12em", color: "var(--color-bordo)" }}
              >
                {campaign.brand}
              </p>
              <h1
                className="font-playfair"
                style={{
                  fontSize: "var(--fs-h3)",
                  fontWeight: 600,
                  color: "var(--color-negro-bordo)",
                  lineHeight: "var(--lh-snug)",
                  marginTop: 8,
                  maxWidth: 700,
                }}
              >
                {campaign.title}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                <span
                  className="font-mono"
                  style={{ fontSize: "var(--fs-eyebrow)", color: "var(--color-gris-bordo)", opacity: 0.5 }}
                >
                  {campaign.date}
                </span>
                <StatusBadge status={campaign.status} />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ width: 60, height: 1, background: "var(--color-dorado)", marginBottom: 40 }}
          />

          {/* Contenido HTML */}
          <motion.div variants={fadeUp} style={{ maxWidth: 720 }}>
            <RichText html={campaign.content} className="rich-content" />
          </motion.div>
        </motion.div>

        {images.length > 0 && (
          <CampaignSlideshow campaignName={campaign.brand} images={images} />
        )}
      </div>

      {/* CTA final */}
      <div
        className="relative"
        style={{
          background:
            "radial-gradient(ellipse at 25% 40%, rgba(140,26,53,0.35) 0%, transparent 65%), var(--color-bordo)",
          padding: "80px 0",
        }}
      >
        <motion.div
          variants={fadeUpStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-7xl mx-auto text-center"
          style={{ padding: "0 clamp(20px, 5vw, 64px)" }}
        >
          <motion.h2
            variants={fadeUp}
            className="font-playfair"
            style={{
              fontSize: "var(--fs-h3)",
              color: "var(--color-hueso)",
              fontStyle: "italic",
              lineHeight: "var(--lh-snug)",
              margin: 0,
            }}
          >
            ¿Tenés una historia para contar?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-sans"
            style={{ fontSize: "var(--fs-body)", color: "var(--color-hueso)", opacity: 0.6, marginTop: 12 }}
          >
            Hablemos de cómo llevarla a los medios.
          </motion.p>
          <motion.div variants={fadeUp}>
            <MotionLink
              href="/#contacto"
              whileHover={{ y: -2 }}
              whileTap={{ scale: tapScale }}
              transition={springSnappy}
              className="font-sans inline-flex items-center gap-2"
              style={{
                marginTop: 32,
                background: "var(--color-hueso)",
                color: "var(--color-bordo)",
                borderRadius: 100,
                padding: "14px 36px",
                fontSize: "var(--fs-caption)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Conversemos
              <ArrowRight size={14} strokeWidth={2.5} />
            </MotionLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
