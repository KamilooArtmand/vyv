// MANDATORY COMPONENT CONTRACT: src/components/ui/select.tsx
"use client";

import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "md" | "lg";
  isInvalid?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function SelectTrigger({
  className,
  size = "md",
  isInvalid = false,
  children,
  ref,
  ...props
}: SelectTriggerProps) {
  const sizeClasses = {
    sm: "h-7 px-2.5 rounded-sm type-caption",
    md: "h-8 px-3 rounded-md type-body-sm",
    lg: "h-9 px-3.5 rounded-md type-body",
  }[size];

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-invalid={isInvalid ? "true" : undefined}
      className={cn(
        "group/select inline-flex w-full items-center justify-between gap-2 bg-surface text-ink select-none",
        "border border-hairline shadow-ambient-xs",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-optical-out)]",
        "hover:bg-surface-hover hover:border-hairline-strong",
        "argon-focus-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[placeholder]:text-ink-tertiary",
        "data-[invalid=true]:border-status-danger-dot",
        sizeClasses,
        className
      )}
      {...props}
    >
      <span className="truncate text-start">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-3.5 shrink-0 text-ink-tertiary transition-transform duration-150 group-data-[state=open]/select:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ref,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "glass-deck z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-[10px] p-1 text-ink",
          "origin-[--radix-select-content-transform-origin]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "w-[var(--radix-select-trigger-width)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1 text-ink-tertiary">
          <ChevronUp className="size-3.5" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-0.5">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1 text-ink-tertiary">
          <ChevronDown className="size-3.5" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  ref?: React.Ref<HTMLDivElement>;
}

export function SelectItem({
  className,
  children,
  ref,
  ...props
}: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center justify-between rounded-[6px] py-1.5 ps-2.5 pe-7 type-body-sm text-ink outline-none",
        "transition-colors duration-75",
        "data-[highlighted]:bg-surface-active data-[highlighted]:text-ink-pure",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute end-2 flex size-3.5 items-center justify-center text-ink">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5 stroke-[2]" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
