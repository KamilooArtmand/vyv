// MANDATORY COMPONENT CONTRACT: src/components/ui/dialog-drawer.tsx
"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. PRECISION DESKTOP MODAL DIALOG
   ========================================================================== */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className={cn(
          "glass-backdrop fixed inset-0 z-50",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
        )}
      />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          "glass-deck fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl p-6 text-ink",
          "duration-200 ease-[var(--ease-expo-out)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            aria-label="Close modal"
            className={cn(
              "absolute end-4 top-4 inline-flex size-7 items-center justify-center rounded-sm text-ink-tertiary",
              "hover:bg-surface-hover hover:text-ink transition-colors argon-focus-ring touch-target-expand"
            )}
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 text-start", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  ref?: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("type-h2 text-ink", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
  ref?: React.Ref<HTMLParagraphElement>;
}) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("type-body-sm text-ink-secondary", className)}
      {...props}
    />
  );
}

/* ==========================================================================
   2. VAUL PHYSICS BOTTOM SHEET (VELOCITY SNAP & BACKGROUND RECESSION)
   ========================================================================== */
export function BottomSheet({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Root>) {
  return (
    <VaulDrawer.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  );
}

export const BottomSheetTrigger = VaulDrawer.Trigger;
export const BottomSheetClose = VaulDrawer.Close;

export function BottomSheetContent({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof VaulDrawer.Content> & {
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <VaulDrawer.Portal>
      <VaulDrawer.Overlay className="glass-backdrop fixed inset-0 z-50" />
      <VaulDrawer.Content
        ref={ref}
        data-slot="bottom-sheet-content"
        className={cn(
          "glass-deck fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-hairline text-ink focus:outline-none",
          "pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
          className
        )}
        {...props}
      >
        {/* Tactile Drag Affordance Handle (36x4px) */}
        <div className="mx-auto mt-3 mb-2 h-1 w-9 shrink-0 rounded-pill bg-ink-disabled/60" />
        <div className="flex-1 overflow-y-auto px-5 pt-2">{children}</div>
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}
