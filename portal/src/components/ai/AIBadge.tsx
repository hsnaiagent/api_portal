import { Sparkles } from 'lucide-react';

export function AIBadge({ label = 'AI' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-xs font-medium">
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}
