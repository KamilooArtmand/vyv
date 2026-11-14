// MANDATORY COMPONENT CONTRACT: src/components/ui/input.tsx
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputShellVariants = cva(
  [
    "group/input relative flex w-full items-center bg-surface text-ink",
    "border border-hairline shadow-ambient-xs",
    "transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-optical-out)]",
    "hover:border-hairline-strong",
    "focus-within:border-hairline-focused focus-within:shadow-[0_0_0_3px_var(--ring-focus)]",
    "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 has-[:disabled]:bg-canvas-subtle",
    "has-[[data-invalid=true]]:border-status-danger-dot has-[[data-invalid=true]]:focus-within:shadow-[0_0_0_3px_var(--status-danger-bg)]",
  ],
  {
    variants: {
      size: {
        sm: "h-7 rounded-sm px-2.5 gap-1.5 type-caption",
        md: "h-8 rounded-md px-3 gap-2 type-body-sm",
        lg: "h-9 rounded-md px-3.5 gap-2 type-body",
        xl: "h-10 rounded-[10px] px-4 gap-2.5 type-body",
      },
      surface: {
        default: "bg-surface",
        recessed: "bg-canvas-recessed border-hairline-subtle shadow-none focus-within:bg-surface",
        glass: "glass-pill rounded-md",
      },
    },
    defaultVariants: {
      size: "md",
      surface: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">,
    VariantProps<typeof inputShellVariants> {
  /** Leading icon or inline text prefix */
  leadingSlot?: React.ReactNode;
  /** Trailing action button, unit label, or KBD badge */
  trailingSlot?: React.ReactNode;
  /** Marks input as invalid and triggers semantic crimson border + focus halo */
  isInvalid?: boolean;
  /** Enforces tabular monospace numerals for financial/numeric inputs */
  tabular?: boolean;
  containerClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  className,
  containerClassName,
  size,
  surface,
  leadingSlot,
  trailingSlot,
  isInvalid = false,
  tabular = false,
  ref,
  ...props
}: InputProps) {
  return (
    <div
      data-slot="input-shell"
      className={cn(inputShellVariants({ size, surface }), containerClassName)}
    >
      {leadingSlot && (
        <span className="inline-flex shrink-0 items-center text-ink-tertiary group-focus-within/input:text-ink-secondary transition-colors [&_svg]:size-4">
          {leadingSlot}
        </span>
      )}
      <input
        ref={ref}
        data-slot="input"
        data-invalid={isInvalid ? "true" : undefined}
        aria-invalid={isInvalid || undefined}
        className={cn(
          "h-full w-full min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-disabled focus:outline-none",
          "disabled:cursor-not-allowed",
          "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-ink",
          tabular && "tabular-data font-mono",
          className
        )}
        {...props}
      />
      {trailingSlot && (
        <span className="inline-flex shrink-0 items-center gap-1 text-ink-tertiary">
          {trailingSlot}
        </span>
      )}
    </div>
  );
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
  /** Uses native CSS field-sizing: content for zero-JS auto-expansion */
  autoGrow?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  isInvalid = false,
  autoGrow = true,
  ref,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      data-invalid={isInvalid ? "true" : undefined}
      aria-invalid={isInvalid || undefined}
      className={cn(
        "block w-full min-h-[84px] max-h-[320px] rounded-md bg-surface px-3 py-2 type-body-sm text-ink",
        "border border-hairline shadow-ambient-xs",
        "placeholder:text-ink-disabled",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-[var(--ease-optical-out)]",
        "hover:border-hairline-strong",
        "focus-visible:outline-none focus-visible:border-hairline-focused focus-visible:shadow-[0_0_0_3px_var(--ring-focus)]",
        "disabled:pointer-events-none disabled:opacity-50 disabled:bg-canvas-subtle",
        "data-[invalid=true]:border-status-danger-dot data-[invalid=true]:focus-visible:shadow-[0_0_0_3px_var(--status-danger-bg)]",
        autoGrow ? "[field-sizing:content] resize-none" : "resize-y",
        className
      )}
      {...props}
    />
  );
}
