// MANDATORY COMPONENT CONTRACT: src/components/ui/empty-state.tsx
import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary CTA button or recovery trigger */
  action?: React.ReactNode;
  /** Secondary documentation or filter reset link */
  secondaryAction?: React.ReactNode;
  /** Renders a subtle 1px architectural dot-matrix blueprint background */
  blueprintGrid?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  blueprintGrid = true,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center",
        "bg-canvas-subtle/60 border border-dashed border-hairline",
        className
      )}
      {...props}
    >
      {/* Subtle Radial-Masked 1px Architectural Blueprint Matrix */}
      {blueprintGrid && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            "bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:16px_16px]",
            "[mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-60"
          )}
        />
      )}

      {/* Concentric Double-Ring Icon Well */}
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-canvas-recessed/80 p-1.5 border border-hairline-subtle shadow-ambient-xs">
          <div className="flex size-full items-center justify-center rounded-lg bg-surface text-ink-secondary border border-hairline [&_svg]:size-4 [&_svg]:stroke-[1.5]">
            {icon}
          </div>
        </div>
      )}

      <h3 className="type-h3 text-ink max-w-sm">{title}</h3>

      {description && (
        <p className="mt-1 max-w-md type-body-sm text-ink-secondary text-balance">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
