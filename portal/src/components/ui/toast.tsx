import * as React from 'react'
import { Toast as ToastPrimitive } from '@base-ui/react/toast'
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; accent: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 />,
    accent: 'before:bg-status-active',
    iconColor: 'text-status-active',
  },
  error: {
    icon: <XCircle />,
    accent: 'before:bg-destructive',
    iconColor: 'text-destructive',
  },
  warning: {
    icon: <AlertTriangle />,
    accent: 'before:bg-status-pending',
    iconColor: 'text-status-pending',
  },
  info: {
    icon: <Info />,
    accent: 'before:bg-link',
    iconColor: 'text-link',
  },
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider>
      {children}
      <ToastViewport />
    </ToastPrimitive.Provider>
  )
}

function ToastViewport() {
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 sm:bottom-4 sm:right-4">
        <ToastList />
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toast) => {
    const variant = (toast.type as ToastVariant) || 'info'
    const config = variantConfig[variant] ?? variantConfig.info

    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        swipeDirection="right"
        className={cn(
          'group relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-border bg-popover py-3.5 pl-4 pr-10 text-popover-foreground shadow-lg',
          "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
          config.accent,
          'transition-all data-[starting-style]:translate-x-full data-[starting-style]:opacity-0',
          'data-[ending-style]:translate-x-full data-[ending-style]:opacity-0',
          'data-[swipe-direction=right]:data-[ending-style]:translate-x-full',
        )}
      >
        <span
          className={cn('mt-0.5 shrink-0 [&_svg]:size-5', config.iconColor)}
          aria-hidden="true"
        >
          {config.icon}
        </span>
        <div className="flex-1">
          <ToastPrimitive.Title className="text-sm font-semibold leading-tight text-foreground" />
          <ToastPrimitive.Description className="mt-1 text-[0.8125rem] leading-snug text-muted-foreground" />
        </div>
        <ToastPrimitive.Close
          aria-label="Dismiss notification"
          className="absolute right-2.5 top-2.5 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <X className="size-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    )
  })
}

/**
 * Hook to trigger toasts. Usage:
 *   const toast = useToast()
 *   toast.success('Saved', 'Your changes are live.')
 */
function useToast() {
  const manager = ToastPrimitive.useToastManager()

  const make =
    (type: ToastVariant) =>
    (title: string, description?: string, timeout = 5000) =>
      manager.add({ title, description, type, timeout })

  return React.useMemo(
    () => ({
      success: make('success'),
      error: make('error'),
      warning: make('warning'),
      info: make('info'),
      add: manager.add,
      close: manager.close,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manager],
  )
}

export { ToastProvider, useToast }
export type { ToastVariant }
