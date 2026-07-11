import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ConfirmVariant = 'primary' | 'destructive'

export type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  /** Shown on the confirm button while pending. Defaults to `confirmLabel`. */
  pendingLabel?: string
  cancelLabel?: string
  confirmVariant?: ConfirmVariant
  /**
   * Optional external pending state. When omitted, pending is managed automatically
   * while `onConfirm` resolves.
   */
  pending?: boolean
  /**
   * Block backdrop, escape, and close-button dismissal while pending.
   * Defaults to `true` whenever the dialog is pending.
   */
  blockDismiss?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  pendingLabel,
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  pending: pendingProp,
  blockDismiss,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [internalPending, setInternalPending] = React.useState(false)
  const confirmLockRef = React.useRef(false)
  const pending = pendingProp ?? internalPending
  const dismissBlocked = blockDismiss ?? pending
  const confirmText = pending ? (pendingLabel ?? confirmLabel) : confirmLabel

  React.useEffect(() => {
    if (!open) {
      setInternalPending(false)
      confirmLockRef.current = false
    }
  }, [open])

  const handleOpenChange = (next: boolean) => {
    if (!next && dismissBlocked) return
    onOpenChange(next)
    if (!next) onCancel?.()
  }

  const handleCancel = () => {
    if (pending) return
    handleOpenChange(false)
  }

  const handleConfirm = async () => {
    if (pending || confirmLockRef.current) return

    confirmLockRef.current = true
    const managesPending = pendingProp === undefined
    if (managesPending) setInternalPending(true)

    try {
      await onConfirm()
      if (managesPending) setInternalPending(false)
      onOpenChange(false)
    } catch {
      if (managesPending) setInternalPending(false)
    } finally {
      confirmLockRef.current = false
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={!dismissBlocked}
        aria-busy={pending || undefined}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={() => void handleConfirm()}
            loading={pending}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export type ConfirmDialogRequest = {
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  pendingLabel?: string
  cancelLabel?: string
  confirmVariant?: ConfirmVariant
  onConfirm: () => void | Promise<void>
}

/**
 * Imperative confirmation helper for replacing `window.confirm`.
 * Render `<ConfirmDialogHost />` once near the root of the page/component.
 */
function useConfirmDialog() {
  const [request, setRequest] = React.useState<ConfirmDialogRequest | null>(null)
  const [open, setOpen] = React.useState(false)
  const resolveRef = React.useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = React.useCallback((options: ConfirmDialogRequest) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setRequest(options)
      setOpen(true)
    })
  }, [])

  const settle = React.useCallback((confirmed: boolean) => {
    setOpen(false)
    resolveRef.current?.(confirmed)
    resolveRef.current = null
    window.setTimeout(() => setRequest(null), 200)
  }, [])

  const ConfirmDialogHost = React.useCallback(() => {
    if (!request) return null

    return (
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) settle(false)
        }}
        title={request.title}
        description={request.description}
        confirmLabel={request.confirmLabel}
        pendingLabel={request.pendingLabel}
        cancelLabel={request.cancelLabel}
        confirmVariant={request.confirmVariant}
        onCancel={() => settle(false)}
        onConfirm={async () => {
          await request.onConfirm()
          settle(true)
        }}
      />
    )
  }, [open, request, settle])

  return { confirm, ConfirmDialogHost }
}

export { ConfirmDialog, useConfirmDialog }
