import React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        {
          'border-warm-gold/35 bg-warm-gold-soft text-primary': variant === 'gold',
          'border-status-success/25 bg-status-success-bg text-status-success': variant === 'success',
          'border-status-warning/25 bg-status-warning-bg text-status-warning': variant === 'warning',
          'border-status-danger/25 bg-status-danger-bg text-status-danger': variant === 'danger',
          'border-status-info/25 bg-status-info-bg text-status-info': variant === 'info',
          'border-border bg-muted text-text-secondary': variant === 'neutral',
        },
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'
