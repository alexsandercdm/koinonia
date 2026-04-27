import { cn } from '../../lib/utils'

export interface FilterTabOption {
  value: string
  label: string
  count?: number
}

export interface FilterTabsProps {
  options: FilterTabOption[]
  value: string
  onValueChange: (value: string) => void
  ariaLabel: string
  className?: string
}

export function FilterTabs({
  options,
  value,
  onValueChange,
  ariaLabel,
  className,
}: FilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-[8px] border border-border bg-surface p-[3px]', className)}
    >
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-2 rounded-[6px] px-3 text-[12.5px] font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-gold-light',
              active
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-text-secondary hover:bg-card hover:text-foreground'
            )}
            onClick={() => onValueChange(option.value)}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' ? (
              <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-primary-foreground/15' : 'bg-card')}>
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
