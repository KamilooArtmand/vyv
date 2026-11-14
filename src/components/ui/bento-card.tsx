// MANDATORY COMPONENT CONTRACT: src/components/ui/bento-card.tsx
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { SpecularSurface } from "@/components/primitives/specular-surface";
import { cn } from "@/lib/utils";

const bentoCardVariants = cva(
  [
    "group/bento relative flex flex-col justify-between overflow-hidden",
    "rounded-2xl bg-surface text-ink border border-hairline shadow-ambient-xs",
    "transition-[border-color,box-shadow,transform] duration-200 ease-[var(--ease-optical-out)]",
  ],
  {
    variants: {
      variant: {
        /** Standard structural surface card */
        default: "bg-surface border-hairline",
        /** Recessed secondary canvas card for passive telemetry */
        recessed: "bg-canvas-subtle border-hairline-subtle shadow-none",
        /** Translucent liquid glass card for floating workspace panels */
        glass: "glass-deck border-hairline",
        /** High-contrast inverted monochrome card */
        inverted: "bg-surface-inverted text-ink-inverted border-transparent shadow-ambient-md",
      },
      interactive: {
        true: "cursor-pointer hover:border-hairline-strong hover:shadow-ambient-sm active:scale-[0.994]",
        false: "",
      },
      padding: {
        none: "p-0",
        /** Concentric frame padding (20px outer radius - 8px padding = 12px inner well radius) */
        framed: "p-2",
        compact: "p-4",
        default: "p-5",
        spacious: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      padding: "default",
    },
  }
);

export interface BentoCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoCardVariants> {
  /** Enables cursor-reactive 1px monochrome specular border physics */
  specular?: boolean;
  /** Responsive 12-column span classes (e.g., "col-span-12 md:col-span-6 lg:col-span-4") */
  spanClassName?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export function BentoCard({
  className,
  spanClassName,
  variant = "default",
  interactive = false,
  padding = "default",
  specular = true,
  children,
  ref,
  ...props
}: BentoCardProps) {
  if (specular && variant === "default") {
    return (
      <SpecularSurface
        ref={ref}
        data-slot="bento-card"
        className={cn(
          bentoCardVariants({ variant, interactive, padding }),
          spanClassName,
          className
        )}
        {...props}
      >
        {children}
      </SpecularSurface>
    );
  }

  return (
    <div
      ref={ref}
      data-slot="bento-card"
      className={cn(
        bentoCardVariants({ variant, interactive, padding }),
        spanClassName,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Concentric Inner Well: Placed inside a <BentoCard padding="framed"> (p-2 / 8px)
 * Enforces exact R_inner = 20px - 8px = 12px (rounded-xl) optical curvature.
 */
export function BentoInnerWell({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="bento-inner-well"
      className={cn(
        "relative flex-1 overflow-hidden rounded-xl bg-canvas-subtle p-4 border border-hairline-subtle",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="bento-header"
      className={cn("flex items-start justify-between gap-3", className)}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-canvas-subtle border border-hairline-subtle text-ink-secondary [&_svg]:size-4">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="type-h3 text-ink truncate">{title}</h3>
          {subtitle && (
            <p className="type-caption text-ink-tertiary truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
