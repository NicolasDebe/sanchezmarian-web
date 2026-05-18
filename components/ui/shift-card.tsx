"use client"

import * as React from "react"
import { AnimatePresence, motion, MotionProps } from "motion/react"
import { cn } from "@/lib/utils"

interface ShiftCardProps
  extends Omit<MotionProps, "onAnimationStart" | "onAnimationComplete"> {
  className?: string
  topContent?: React.ReactNode
  middleContent?: React.ReactNode
  topAnimateContent?: React.ReactNode
  bottomContent?: React.ReactNode
  expandedHeight?: number
}

const ShiftCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
))
ShiftCardHeader.displayName = "ShiftCardHeader"

interface ShiftCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isHovered: boolean
  expandedHeight?: number
}

const ShiftCardContent = React.forwardRef<HTMLDivElement, ShiftCardContentProps>(
  ({ isHovered, expandedHeight = 194, children, ...divProps }, ref) => {
    const motionProps: MotionProps = {
      initial: { opacity: 0, height: 0 },
      animate: isHovered
        ? { opacity: 1, height: expandedHeight }
        : { opacity: 1, height: 38 },
      transition: { duration: 0.3, delay: 0.1, ease: "circIn" },
    }

    return (
      <motion.div
        key="shift-card-content"
        ref={ref}
        {...motionProps}
        className={divProps.className}
      >
        {children}
      </motion.div>
    )
  }
)
ShiftCardContent.displayName = "ShiftCardContent"

const ShiftCard = React.forwardRef<HTMLDivElement, ShiftCardProps>(
  ({ className, topContent, topAnimateContent, middleContent, bottomContent, expandedHeight, ...props }, ref) => {
    const [isHovered, setHovered] = React.useState(false)

    return (
      <motion.div
        ref={ref}
        className={cn(
          "min-h-[300px] w-full",
          "group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl p-4 text-sm",
          "hover:cursor-pointer bg-hueso",
          "border border-bordo/8 hover:border-bordo/20 transition-colors",
          className
        )}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.01 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setHovered((v) => !v)}
        onTap={() => setHovered(false)}
        {...props}
      >
        {/* Left bordo accent bar */}
        <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-bordo rounded-full" />

        <ShiftCardHeader className="flex h-[46px] w-full flex-col relative pl-3">
          <div className="w-full">
            {topContent}
            <AnimatePresence>
              {isHovered ? <>{topAnimateContent}</> : null}
            </AnimatePresence>
          </div>
        </ShiftCardHeader>

        <div className="pb-12 flex-1 flex items-center pl-3">
          <AnimatePresence>
            {!isHovered ? <>{middleContent}</> : null}
          </AnimatePresence>
        </div>

        <ShiftCardContent
          isHovered={isHovered}
          expandedHeight={expandedHeight}
          className="absolute -bottom-1.5 left-0 right-0 flex flex-col gap-4 rounded-2xl"
        >
          <motion.div className="flex w-full flex-col gap-1">
            {bottomContent}
          </motion.div>
        </ShiftCardContent>
      </motion.div>
    )
  }
)

ShiftCard.displayName = "ShiftCard"

export { ShiftCard, ShiftCardHeader, ShiftCardContent }
export default ShiftCard
