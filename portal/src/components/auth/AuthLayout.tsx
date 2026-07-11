import type { ReactNode } from 'react';

import { BRAND } from '@/config/brand';
import { cn } from '@/lib/utils';

type AuthLayoutProps = {
  children: ReactNode;
  /** Optional hero panel content; defaults to brand marketing copy. */
  hero?: ReactNode;
  className?: string;
};

function DefaultHero() {
  return (
    <>
      <img
        src={BRAND.greenLogoPath}
        alt={BRAND.name}
        className="mb-6 h-16 w-auto max-w-full object-contain drop-shadow-sm"
      />
      <h1 className="text-4xl font-bold tracking-tight">{BRAND.name}</h1>
      <p className="mt-4 text-xl opacity-90">{BRAND.tagline}</p>
      <p className="mt-8 max-w-md opacity-80">
        Discover, govern, and connect enterprise APIs across HR, Finance, Operations, Procurement,
        Sales, and AI Platform — with intelligent assistance at every step.
      </p>
    </>
  );
}

function AuthLayout({ children, hero, className }: AuthLayoutProps) {
  return (
    <div className={cn('flex min-h-screen', className)}>
      <div className="hidden flex-col justify-center bg-gradient-to-br from-brand-green via-brand-green to-brand-blue-dark p-12 text-brand-white lg:flex lg:w-1/2">
        {hero ?? <DefaultHero />}
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="mb-6 text-center lg:hidden">
            <img
              src={BRAND.greenLogoPath}
              alt={BRAND.name}
              className="mx-auto h-12 w-auto max-w-full object-contain drop-shadow-sm"
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              {BRAND.name}
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export { AuthLayout }
