import React from 'react'
import { Label } from './label'
import { cn } from '../../lib/utils'

export interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  const helper = error || hint

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-status-danger">*</span> : null}
      </Label>
      {children}
      {helper ? (
        <p className={cn('text-sm', error ? 'text-status-danger' : 'text-text-secondary')}>
          {helper}
        </p>
      ) : null}
    </div>
  )
}
