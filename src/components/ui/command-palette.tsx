// MANDATORY COMPONENT CONTRACT: src/components/ui/command-palette.tsx
"use client";

import React, { useEffect } from "react";
import { Command as CommandPrimitive } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, CornerDownLeft } from "lucide-react";
import { Kbd } from "@/components/ui/badge-avatar";
import { cn } from "@/lib/utils";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  children?: React.ReactNode | any;
}

export function CommandPalette({
  open,
  onOpenChange,
  placeholder = "Type a command or search workspace...",
  children,
}: CommandPaletteProps) {
  /* Global Cmd+K / Ctrl+K Hotkey Listener */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="glass-backdrop fixed inset-0 z-50 backdrop-blur-xl bg-ink/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />
        <DialogPrimitive.Content
          aria-label="Command Palette"
          data-slot="command-palette"
          className={cn(
            "glass-deck fixed left-1/2 top-[16vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl p-0 text-ink backdrop-blur-xl border border-hairline shadow-ambient-lg",
            "duration-150 ease-[var(--ease-expo-out)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "focus:outline-none"
          )}
        >
          <CommandPrimitive
            loop
            className="flex h-full w-full flex-col overflow-hidden bg-transparent"
          >
            {/* Top Search Bar with ESC Trigger */}
            <div className="flex h-12 items-center gap-2.5 border-b border-hairline-subtle px-4">
              <Search className="size-4 shrink-0 text-ink-tertiary" />
              <CommandPrimitive.Input
                placeholder={placeholder}
                className="flex h-full w-full bg-transparent type-body text-ink placeholder:text-ink-disabled focus:outline-none"
              />
              <Kbd keys={["ESC"]} />
            </div>

            {/* Scrollable Results Viewport */}
            <CommandPrimitive.List className="max-h-[360px] overflow-y-auto overscroll-contain p-1.5">
              <CommandPrimitive.Empty className="py-10 text-center type-body-sm text-ink-tertiary">
                No matching commands or records found.
              </CommandPrimitive.Empty>
              {children}
            </CommandPrimitive.List>

            {/* Recessed Bottom Telemetry & Shortcut Legend Bar */}
            <div className="flex h-8 items-center justify-between border-t border-hairline-subtle bg-canvas-subtle/70 px-3.5 type-micro text-ink-tertiary">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Kbd keys={["⌘K"]} /> Search
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd keys={["↑", "↓"]} /> Navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd keys={["↵"]} /> Select
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd keys={["ESC"]} /> Close
                </span>
              </div>
              <span className="font-mono uppercase tracking-wider opacity-75">
                ARGON OS
              </span>
            </div>
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function CommandGroup({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & {
  children?: React.ReactNode | any;
}) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-ink [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:type-micro [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-ink-tertiary",
        className
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Group>
  );
}

export function CommandItem({
  className,
  icon,
  shortcut,
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, "icon"> & {
  icon?: React.ReactNode | any;
  shortcut?: string[];
  children?: React.ReactNode | any;
}) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default select-none items-center justify-between gap-3 rounded-md px-2.5 py-2 type-body-sm text-ink outline-none",
        "transition-colors duration-75",
        "data-[selected=true]:bg-surface-active data-[selected=true]:text-ink-pure",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon && (
          <span className="flex size-5 shrink-0 items-center justify-center text-ink-tertiary [&_svg]:size-4">
            {icon}
          </span>
        )}
        <span className="truncate">{children}</span>
      </div>
      {shortcut && <Kbd keys={shortcut} />}
    </CommandPrimitive.Item>
  );
}
