import type { Variants } from "motion/react"

const EASE = [0.16, 1, 0.3, 1] as const

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    rotate: -1.5,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.55,
      ease: EASE,
    },
  },
}

export const fadeUpStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32, rotate: 1 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.55, ease: EASE },
  },
}

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32, rotate: -1 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.55, ease: EASE },
  },
}

export const revealCard: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotate: -2,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASE,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE },
  },
}

export const viewportOnce = { once: true, margin: "-80px" } as const
