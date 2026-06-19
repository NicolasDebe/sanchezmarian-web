"use client"

import Link from "next/link"
import { motion } from "motion/react"

/**
 * `next/link` envuelto con motion para poder usar `whileHover` / `whileTap`
 * (feedback de press con spring) sin perder la navegación client-side.
 * Usar con los helpers `pressableCta` / `pressableFlat` de lib/animations.
 */
export const MotionLink = motion.create(Link)
