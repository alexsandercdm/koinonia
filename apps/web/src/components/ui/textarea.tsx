import React from 'react'
import { cn } from '../../lib/utils'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[112px] w-full rounded-control border border-input bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-text-tertiary focus-visible:border-warm-gold-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-warm-gold-light focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)

TextArea.displayName = 'TextArea'
