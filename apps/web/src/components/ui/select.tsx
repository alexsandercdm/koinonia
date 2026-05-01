import React from 'react'
import { cn } from '../../lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-[38px] w-full rounded-control border border-input bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:border-warm-gold-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-warm-gold-light focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)

Select.displayName = 'Select'
