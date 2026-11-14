// MANDATORY COMPONENT CONTRACT: src/components/ui/tooltip-dropdown.tsx
"use client";

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Kbd } from "@/components/ui/badge-avatar";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. ZERO-LATENCY WARMUP TOOLTIP SYSTEM
   ========================================================================== */
export function TooltipProvider({
  delayDuration = 260,
  skipDelayDuration = 400,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent
      {...props}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  shortcut,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
  /** Optional keyboard shortcut keys rendered inline inside the tooltip */
  shortcut?: string[];
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex items-center gap-2 overflow-hidden rounded-sm bg-surface-inverted px-2.5 py-1 type-caption text-ink-inverted shadow-ambient-md select-none",
          "origin-[--radix-tooltip-content-transform-origin]",
          "animate-in fade-in-0 zoom-in-95 duration-100 ease-[var(--ease-expo-out)]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-75",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {shortcut && shortcut.length > 0 && (
          <span className="inline-flex items-center gap-0.5 opacity-80">
            {shortcut.map((key, idx) => (
              <kbd
                key={idx}
                className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] bg-white/15 px-1 font-sans type-micro text-ink-inverted dark:bg-black/15"
              >
                {key}
              </kbd>
            ))}
          </span>
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

/* ==========================================================================
   2. PRECISION DROPDOWN & CONTEXT MENU
   ========================================================================== */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 5,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-slot="dropdown-content"
        sideOffset={sideOffset}
        className={cn(
          "glass-deck z-50 min-w-[12rem] overflow-hidden rounded-[10px] p-1 text-ink",
          "origin-[--radix-dropdown-menu-content-transform-origin]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-150 ease-[var(--ease-expo-out)]",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  intent = "default",
  icon,
  shortcut,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  intent?: "default" | "danger";
  icon?: React.ReactNode;
  shortcut?: string[];
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-item"
      className={cn(
        "relative flex cursor-default select-none items-center justify-between gap-4 rounded-[6px] px-2.5 py-1.5 type-body-sm outline-none transition-colors duration-75",
        intent === "default" && [
          "text-ink data-[highlighted]:bg-surface-active data-[highlighted]:text-ink-pure",
        ],
        intent === "danger" && [
          "text-status-danger-ink data-[highlighted]:bg-status-danger-bg data-[highlighted]:text-status-danger-ink",
        ],
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 truncate">
        {icon && (
          <span className="inline-flex shrink-0 text-ink-tertiary group-data-[highlighted]:text-current [&_svg]:size-3.5">
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
      </span>
      {shortcut && <Kbd keys={shortcut} />}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-hairline-subtle", className)}
      {...props}
    />
  );
}
