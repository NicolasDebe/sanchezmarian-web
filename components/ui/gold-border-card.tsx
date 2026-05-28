import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GoldBorderCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function GoldBorderCard({ children, className, style, ...rest }: GoldBorderCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl p-0',
        className
      )}
      style={{
        background: 'linear-gradient(var(--color-hueso), var(--color-hueso)) padding-box, linear-gradient(180deg, var(--color-dorado) 0%, transparent 100%) border-box',
        border: '1px solid transparent',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
