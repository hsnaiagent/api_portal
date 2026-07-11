import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header, type Crumb } from './header';
import type { PortalNavSection } from '@/lib/build-nav-sections';

export function PortalShell({
  breadcrumbs,
  sections,
  children,
}: {
  breadcrumbs: Crumb[];
  sections?: PortalNavSection[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <a
        href="#main-content"
        className="sr-only z-[200] rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <aside
        className={cn(
          'sticky top-0 hidden h-svh shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block',
          collapsed ? 'w-[4.5rem]' : 'w-64',
        )}
      >
        <Sidebar sections={sections} collapsed={collapsed} />
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            'absolute inset-0 bg-foreground/40 backdrop-blur-[2px] transition-opacity duration-200',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            'absolute inset-y-0 left-0 w-72 border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="absolute right-3 top-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <X className="size-5" />
          </button>
          <Sidebar sections={sections} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          breadcrumbs={breadcrumbs}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
