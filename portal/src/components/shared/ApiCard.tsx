import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { API } from '@/types';
import { ClassificationBadge } from './ClassificationBadge';
import { LifecycleBadge } from './LifecycleBadge';
import { domains } from '@/data/domains';
import { AIBadge } from '@/components/ai/AIBadge';

export function ApiCard({ api, score, reason, selectable, selected, onSelect }: {
  api: API;
  score?: number;
  reason?: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const domain = domains.find((d) => d.domain_id === api.domain_id);
  const content = (
    <div className="rounded-xl border border-slate-200 bg-brand-white p-4 hover:border-brand-green/40 hover:shadow-sm transition-all h-full flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-800">{api.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{domain?.name}</p>
        </div>
        {score != null && (
          <AIBadge label={`${score}%`} />
        )}
      </div>
      <p className="text-sm text-slate-600 mt-2 flex-1 line-clamp-2">{api.description}</p>
      {reason && <p className="text-xs text-brand-blue mt-2 italic">{reason}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        <ClassificationBadge classification={api.classification} />
        <LifecycleBadge status={api.lifecycle_status} />
      </div>
      {selectable && (
        <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={selected} onChange={() => onSelect?.(api.api_id)} className="rounded border-slate-300" />
          Select for bundle
        </label>
      )}
    </div>
  );

  if (selectable) return content;
  return <Link to={ROUTES.consumer.apiDetail(api.api_id)}>{content}</Link>;
}
