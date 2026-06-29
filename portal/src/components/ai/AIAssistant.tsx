import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAIResponse } from '@/mocks/AIAdapter';
import { AIThinkingOverlay } from './AIThinkingOverlay';
import { AIBadge } from './AIBadge';

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState<string>();
  const [links, setLinks] = useState<{ label: string; path: string }[]>([]);
  const navigate = useNavigate();

  const ask = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponseText(undefined);
    setLinks([]);
    const res = await getAIResponse('AI_14_PortalAssistant', { query: input });
    setLoading(false);
    setResponseText(res?.text);
    setLinks(res?.links ?? []);
    setInput('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-brand-white shadow-lg hover:bg-brand-green-dark transition-colors"
        aria-label="AI Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-full max-w-md rounded-xl border border-slate-200 bg-brand-white shadow-2xl flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <AIBadge label="Portal Assistant" />
              <span className="font-semibold text-sm">AI-14</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-slate-50 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-sm text-slate-600">Ask about APIs, subscriptions, or workflows. Try: &quot;How do I subscribe?&quot; or &quot;Find salary APIs&quot;</p>
            <AIThinkingOverlay loading={loading} text={!loading ? responseText : undefined} />
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <button
                    key={l.path}
                    type="button"
                    onClick={() => { navigate(l.path); setOpen(false); }}
                    className="text-xs rounded-full bg-brand-green-light text-brand-green px-3 py-1 hover:bg-brand-green/20"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
              placeholder="Ask the portal assistant..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
            <button type="button" onClick={ask} className="rounded-lg bg-brand-green text-brand-white p-2 hover:bg-brand-green-dark">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
