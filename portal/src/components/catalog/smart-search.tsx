import * as React from 'react'
import { Loader2, Search, Sparkles, X } from 'lucide-react'

import { cn } from '@/lib/utils'

type SmartSearchProps = {
  value: string
  onChange: (value: string) => void
  aiEnabled: boolean
  onToggleAi: (enabled: boolean) => void
  searching?: boolean
  resultCount?: number
}

export function SmartSearch({
  value,
  onChange,
  aiEnabled,
  onToggleAi,
  searching = false,
}: SmartSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [focused, setFocused] = React.useState(false)

  return (
    <div className="relative">
      {/* Subtle glow behind the field, intensified on focus */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -inset-px rounded-2xl bg-brand/10 blur-md transition-opacity duration-300',
          focused ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        className={cn(
          'relative flex items-center gap-2 rounded-2xl border bg-card px-3 shadow-sm transition-all duration-200 sm:px-4',
          focused
            ? 'border-brand ring-4 ring-brand/15'
            : 'border-border hover:border-border-strong',
        )}
      >
        <span className="flex shrink-0 items-center text-muted-foreground">
          {searching ? (
            <Loader2 className="size-5 animate-spin text-brand" aria-hidden="true" />
          ) : (
            <Search className="size-5" aria-hidden="true" />
          )}
        </span>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search APIs by name, domain, or capability…"
          aria-label="Search APIs"
          className={cn(
            'h-14 w-full bg-transparent text-base text-foreground outline-none',
            'placeholder:text-muted-foreground',
            '[&::-webkit-search-cancel-button]:appearance-none',
          )}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <X className="size-4" />
          </button>
        )}

        <span
          className="hidden h-6 w-px shrink-0 bg-border sm:block"
          aria-hidden="true"
        />

        <button
          type="button"
          role="switch"
          aria-checked={aiEnabled}
          onClick={() => onToggleAi(!aiEnabled)}
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
            aiEnabled
              ? 'border-transparent bg-brand text-brand-foreground shadow-sm'
              : 'border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground',
          )}
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">AI Smart Search</span>
          <span className="sm:hidden">AI</span>
        </button>
      </div>
    </div>
  )
}
