// MANDATORY COMPONENT CONTRACT: src/components/ui/badge-avatar.tsx
"use client";

import React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ==========================================================================
   1. SEMANTIC STATUS BADGE & TAG
   ========================================================================== */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 whitespace-nowrap select-none font-medium tabular-data",
    "border transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        default: "bg-canvas-subtle text-ink-secondary border-hairline",
        outline: "bg-transparent text-ink-secondary border-hairline",
        surface: "bg-surface text-ink border-hairline shadow-ambient-xs",
        inverted: "bg-surface-inverted text-ink-inverted border-transparent",
        success: "bg-status-success-bg text-status-success-ink border-status-success-border",
        warning: "bg-status-warning-bg text-status-warning-ink border-status-warning-border",
        danger: "bg-status-danger-bg text-status-danger-ink border-status-danger-border",
        info: "bg-status-info-bg text-status-info-ink border-status-info-border",
      },
      size: {
        sm: "h-5 px-1.5 rounded-xs type-micro",
        md: "h-6 px-2 rounded-sm type-caption",
        pill: "h-6 px-2.5 rounded-pill type-caption",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional semantic status override for dot color (e.g. when using variant="outline") */
  status?: "success" | "warning" | "danger" | "info" | "default";
  /** Renders a 6px status indicator dot matching the semantic variant */
  dot?: boolean;
  /** Pulses the status dot for live/streaming telemetry states */
  pulseDot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  status,
  size,
  dot = false,
  pulseDot = false,
  children,
  ...props
}: BadgeProps) {
  const effectiveStatus = status ?? (variant === "outline" ? "default" : variant) ?? "default";
  const dotColorClass = {
    default: "bg-ink-tertiary",
    outline: "bg-ink-tertiary",
    surface: "bg-ink",
    inverted: "bg-ink-inverted",
    success: "bg-status-success-dot",
    warning: "bg-status-warning-dot",
    danger: "bg-status-danger-dot",
    info: "bg-status-info-dot",
  }[effectiveStatus] ?? "bg-ink-tertiary";

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span className="relative flex size-1.5 shrink-0">
          {pulseDot && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-pill opacity-75",
                dotColorClass
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-1.5 rounded-pill",
              dotColorClass
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}

/* ==========================================================================
   2. TACTILE KEYBOARD SHORTCUT CAP (<Kbd>)
   ========================================================================== */
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  keys?: string[];
}

export function Kbd({ className, keys, children, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-0.5 rounded-xs px-1.5",
        "bg-canvas-subtle font-sans type-micro text-ink-tertiary",
        "border border-hairline shadow-[0_1px_0_0_var(--border-default)]",
        className
      )}
      {...props}
    >
      {keys
        ? keys.map((k, i) => (
            <React.Fragment key={i}>
              <span>{k}</span>
            </React.Fragment>
          ))
        : children}
    </kbd>
  );
}

/* ==========================================================================
   3. OPTICAL AVATAR WITH INNER CONTRAST RING
   ========================================================================== */
export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "squircle";
  status?: "online" | "busy" | "offline";
  ref?: React.Ref<HTMLSpanElement>;
}

export function Avatar({
  className,
  src,
  alt = "",
  fallback,
  size = "md",
  shape = "circle",
  status,
  ref,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    xs: "size-5 type-micro",
    sm: "size-6 type-micro",
    md: "size-8 type-caption",
    lg: "size-10 type-body-sm",
    xl: "size-12 type-body",
  }[size];

  const statusColor = {
    online: "bg-status-success-dot",
    busy: "bg-status-danger-dot",
    offline: "bg-ink-tertiary",
  };

  return (
    <div className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden bg-canvas-recessed select-none",
          "ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.10]",
          shape === "circle" ? "rounded-pill" : "rounded-md",
          sizeClasses,
          className
        )}
        {...props}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          delayMs={src ? 200 : 0}
          className="flex h-full w-full items-center justify-center bg-canvas-subtle font-medium text-ink-secondary uppercase"
        >
          {fallback.slice(0, 2)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={cn(
            "absolute bottom-0 end-0 block size-2.5 rounded-pill ring-2 ring-surface",
            statusColor[status]
          )}
        />
      )}
    </div>
  );
}
