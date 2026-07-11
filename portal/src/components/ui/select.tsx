import * as React from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value
const SelectGroup = SelectPrimitive.Group

function SelectTrigger({
  className,
  children,
  size = 'default',
  ...props
}: SelectPrimitive.Trigger.Props & { size?: 'sm' | 'default' }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'inline-flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background text-sm text-foreground shadow-sm transition-colors',
        'hover:border-border-strong',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 outline-none',
        'data-[popup-open]:border-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&>span]:truncate',
        size === 'sm' ? 'h-8 px-2.5' : 'h-9 px-3',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-muted-foreground">
        <ChevronsUpDown className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="z-50 outline-none"
        sideOffset={6}
        alignItemWithTrigger={false}
      >
        <SelectPrimitive.Popup
          className={cn(
            'max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none',
            'transition-all data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95',
            className,
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-default items-center justify-between gap-2 rounded-md py-1.5 pl-2.5 pr-2 text-sm outline-none select-none',
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="text-brand">
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectGroupLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      className={cn(
        'px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
}
