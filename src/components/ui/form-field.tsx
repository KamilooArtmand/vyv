// MANDATORY COMPONENT CONTRACT: src/components/ui/form-field.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { ARGON_SPRINGS } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: React.ReactNode;
  /** Optional metadata hint on the opposite end of the label (e.g., "Optional", "Max 64 chars") */
  labelHint?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | null;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  labelHint,
  description,
  errorMessage,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const hasError = Boolean(errorMessage);

  return (
    <div
      data-slot="form-field"
      data-invalid={hasError ? "true" : undefined}
      className={cn("flex flex-col gap-1.5 w-full", className)}
    >
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="type-body-sm font-medium text-ink select-none cursor-pointer"
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className="ms-1 text-status-danger-dot font-mono"
            >
              *
            </span>
          )}
        </label>
        {labelHint && (
          <span className="type-micro text-ink-tertiary">{labelHint}</span>
        )}
      </div>

      {children}

      <AnimatePresence initial={false} mode="wait">
        {hasError ? (
          <motion.div
            key="error"
            role="alert"
            initial={{ opacity: 0, height: 0, y: -2 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -2 }}
            transition={ARGON_SPRINGS.snappy}
            className="overflow-hidden"
          >
            <p className="flex items-center gap-1.5 pt-0.5 type-caption text-status-danger-ink">
              <AlertCircle className="size-3.5 shrink-0 text-status-danger-dot" />
              <span>{errorMessage}</span>
            </p>
          </motion.div>
        ) : description ? (
          <motion.div
            key="description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="type-caption text-ink-tertiary">{description}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
