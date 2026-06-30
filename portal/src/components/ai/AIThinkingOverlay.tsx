import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { AI_CONFIG } from '@/config/ai';

export function AIThinkingOverlay({
  loading,
  text,
  onComplete,
}: {
  loading: boolean;
  text?: string;
  onComplete?: () => void;
}) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (!text) return;
    setDisplay('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, AI_CONFIG.typewriterSpeedMs);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
        <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
        <div>
          <p className="text-sm font-medium text-purple-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> AI analyzing...
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Matching against catalog and governance rules
          </p>
        </div>
      </div>
    );
  }

  if (!text) return null;

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
      <p className="text-sm text-purple-900 whitespace-pre-wrap">{display}</p>
    </div>
  );
}
