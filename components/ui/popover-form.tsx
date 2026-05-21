"use client"

import { ReactNode, RefObject, useEffect, useRef } from "react"
import { Loader } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

type PopoverFormProps = {
  open: boolean
  setOpen: (open: boolean) => void
  openChild?: ReactNode
  successChild?: ReactNode
  showSuccess: boolean
  width?: string
  height?: string
  title: string
}

export function PopoverForm({
  open,
  setOpen,
  openChild,
  showSuccess,
  successChild,
  width = "380px",
  height = "auto",
  title = "Consultar",
}: PopoverFormProps) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  return (
    <div key={title} className="flex min-h-[200px] w-full items-center justify-center">
      <motion.button
        layoutId={`${title}-wrapper`}
        onClick={() => setOpen(true)}
        style={{ borderRadius: 100 }}
        className="flex h-12 items-center gap-2 bg-hueso border border-bordo/20 px-7 font-playfair font-bold text-bordo text-base italic hover:bg-hueso-oscuro transition-colors outline-none"
      >
        <motion.span layoutId={`${title}-title`}>{title}</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            layoutId={`${title}-wrapper`}
            className="absolute p-2 overflow-hidden bg-hueso border border-bordo/15 shadow-[0_8px_40px_-8px_rgba(102,0,31,0.18)] outline-none z-50"
            ref={ref}
            style={{ borderRadius: 16, width, minHeight: height }}
          >
            <motion.span
              aria-hidden
              className="absolute left-5 top-[18px] font-playfair font-bold italic text-bordo text-base data-[success]:text-transparent"
              layoutId={`${title}-title`}
              data-success={showSuccess}
            >
              {title}
            </motion.span>

            <AnimatePresence mode="popLayout">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ y: -32, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                  className="flex h-full flex-col items-center justify-center py-12"
                >
                  {successChild || <PopoverFormSuccess />}
                </motion.div>
              ) : (
                <motion.div
                  exit={{ y: 8, opacity: 0, filter: "blur(4px)" }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                  key="open-child"
                  style={{ borderRadius: 12 }}
                  className="mt-8 bg-hueso-oscuro border border-bordo/8 z-20"
                >
                  {openChild}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PopoverFormButton({
  loading,
  text = "Enviar",
}: {
  loading: boolean
  text?: string
}) {
  return (
    <button
      type="submit"
      className="flex h-9 w-full items-center justify-center overflow-hidden rounded-full bg-hueso border border-bordo/20 px-6 font-sans text-sm font-semibold text-bordo hover:bg-arena transition-colors"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${loading}`}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="flex w-full items-center justify-center gap-2"
        >
          {loading ? <Loader className="animate-spin size-3" /> : <span>{text}</span>}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  handleOnClickOutside: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handleOnClickOutside(event)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handleOnClickOutside])
}

export function PopoverFormSuccess({
  title = "¡Mensaje enviado!",
  description = "Gracias por escribirme. Te contacto pronto.",
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full border border-dorado/40 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4 4 8-8" stroke="#C9A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-playfair font-bold text-negro-bordo text-lg">{title}</h3>
      <p className="font-sans text-gris-bordo text-sm max-w-[240px] leading-relaxed">{description}</p>
    </div>
  )
}

export default PopoverForm
