import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

interface NotFoundProps {
  title?: string;
  message?: string;
  to: string;
  actionLabel: string;
}

export function NotFound({
  title = 'Not found',
  message = 'The item you are looking for does not exist or is no longer available.',
  to,
  actionLabel,
}: NotFoundProps) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-brand-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <SearchX className="h-6 w-6 text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      <Link
        to={to}
        className="mt-4 inline-block rounded-lg bg-brand-green px-4 py-2 text-sm font-medium text-brand-white hover:bg-brand-green-dark"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
