import * as React from "react"
import { cn } from "@/lib/utils"

const TextureCardStyled = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[24px] border border-dorado/20",
      "bg-gradient-to-b from-arena to-hueso-oscuro",
      className
    )}
    {...props}
  >
    <div className="rounded-[23px] border border-dorado/10">
      <div className="rounded-[22px] border border-hueso-oscuro/80">
        <div className="rounded-[21px] border border-dorado/8">
          <div className="w-full border border-hueso/50 rounded-[20px] text-gris-bordo">
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
))
TextureCardStyled.displayName = "TextureCardStyled"

export { TextureCardStyled }
export default TextureCardStyled
