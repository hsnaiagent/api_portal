import { Sparkles } from 'lucide-react'

export function AiSummary({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-brand/30 bg-brand-subtle/60 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground"
        aria-hidden="true"
      >
        <Sparkles className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-accent-foreground">
          AI Smart Search
        </p>
        <p className="text-sm leading-relaxed text-foreground text-pretty">
          {text}
        </p>
      </div>
    </div>
  )
}
