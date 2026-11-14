// MANDATORY COMPONENT CONTRACT: src/components/ui/button.tsx
"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center select-none whitespace-nowrap font-medium",
    "transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 ease-[var(--ease-optical-out)]",
    "argon-focus-ring touch-target-expand",
    "active:scale-[0.975] disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** High-contrast monochrome primary CTA (#09090B Light / #F4F4F6 Dark) */
        primary: [
          "bg-surface-inverted text-ink-inverted border border-transparent",
          "shadow-ambient-xs hover:bg-surface-inverted-hover",
        ],
        /** Alias for legacy backward compatibility */
        default: [
          "bg-surface-inverted text-ink-inverted border border-transparent",
          "shadow-ambient-xs hover:bg-surface-inverted-hover",
        ],
        /** Structural elevated surface button (#FFFFFF Light / #111215 Dark) */
        secondary: [
          "bg-surface text-ink border border-hairline",
          "shadow-ambient-xs hover:bg-surface-hover hover:border-hairline-strong active:bg-surface-active",
        ],
        /** Subtle recessed canvas button */
        subtle: [
          "bg-canvas-subtle text-ink-secondary border border-hairline-subtle",
          "hover:bg-surface-active hover:text-ink hover:border-hairline",
        ],
        /** Transparent structural wireframe button */
        outline: [
          "bg-transparent text-ink border border-hairline",
          "hover:bg-surface-hover hover:border-hairline-strong",
        ],
        /** Zero-chrome invisible button; reveals surface strictly on hover/focus */
        ghost: [
          "bg-transparent text-ink-secondary border border-transparent",
          "hover:bg-surface-hover hover:text-ink active:bg-surface-active",
        ],
        /** Liquid glass translucent pill button for floating decks & media overlays */
        glass: [
          "glass-pill text-ink",
          "hover:bg-glass-elevated hover:border-hairline-strong",
        ],
        /** Calibrated crimson destructive button */
        danger: [
          "bg-status-danger-bg text-status-danger-ink border border-status-danger-border",
          "hover:bg-[oklch(0.55_0.19_25)] hover:text-white hover:border-transparent",
          "dark:hover:bg-[oklch(0.58_0.19_25)] dark:hover:text-white",
        ],
      },
      size: {
        xs: "h-6 gap-1 px-2 rounded-sm type-micro [&_svg]:size-3",
        sm: "h-7 gap-1.5 px-2.5 rounded-sm type-caption [&_svg]:size-3.5",
        md: "h-8 gap-1.5 px-3 rounded-md type-body-sm [&_svg]:size-[15px]",
        lg: "h-9 gap-2 px-3.5 rounded-md type-body [&_svg]:size-4",
        xl: "h-10 gap-2 px-4.5 rounded-[10px] type-body [&_svg]:size-4",
        "icon-xs": "size-6 rounded-sm [&_svg]:size-3",
        "icon-sm": "size-7 rounded-sm [&_svg]:size-3.5",
        "icon-md": "size-8 rounded-md [&_svg]:size-[15px]",
        "icon-lg": "size-9 rounded-md [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element via Radix Slot */
  asChild?: boolean;
  appName?: string;
  /** Activates zero-layout-shift loading state and disables pointer events */
  isLoading?: boolean;
  /** Optional leading icon element */
  leadingIcon?: React.ReactNode;
  /** Optional trailing icon or KBD shortcut badge */
  trailingSlot?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  disabled,
  leadingIcon,
  trailingSlot,
  children,
  ref,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  const isDisabled = disabled || isLoading;

  if (asChild) {
    return (
      <Slot
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <Component
      ref={ref}
      type={props.type ?? "button"}
      data-slot="button"
      data-loading={isLoading ? "true" : undefined}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Content Wrapper: Hidden optically during loading while preserving exact button width */}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-[inherit] transition-opacity duration-150",
          isLoading && "opacity-0"
        )}
      >
        {leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>}
        {children}
        {trailingSlot && <span className="inline-flex shrink-0">{trailingSlot}</span>}
      </span>

      {/* Centered 120fps Hardware-Accelerated SVG Spinner */}
      {isLoading && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <svg
            className="animate-spin"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="1.75"
            />
            <path
              d="M14 8a6 6 0 0 0-6-6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
    </Component>
  );
}

export { buttonVariants };
