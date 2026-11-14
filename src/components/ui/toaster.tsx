// MANDATORY COMPONENT CONTRACT: src/components/ui/toaster.tsx
"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Loader2,
} from "lucide-react";

export function ArgonToaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      expand={false}
      visibleToasts={4}
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            "glass-deck group/toast flex w-full max-w-[360px] items-start gap-3 rounded-xl p-3.5 text-ink",
            "border border-hairline shadow-deck select-none",
          ].join(" "),
          title: "type-body-sm font-medium text-ink leading-tight",
          description: "type-caption text-ink-secondary mt-0.5 leading-snug",
          actionButton: [
            "inline-flex h-6 items-center justify-center rounded-sm bg-surface-inverted px-2.5 type-micro font-medium text-ink-inverted",
            "hover:bg-surface-inverted-hover transition-colors shrink-0",
          ].join(" "),
          cancelButton: [
            "inline-flex h-6 items-center justify-center rounded-sm bg-canvas-subtle px-2 type-micro font-medium text-ink-secondary",
            "border border-hairline hover:text-ink transition-colors shrink-0",
          ].join(" "),
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-4 text-status-success-dot shrink-0 mt-0.5" />,
        warning: <AlertTriangle className="size-4 text-status-warning-dot shrink-0 mt-0.5" />,
        error: <XCircle className="size-4 text-status-danger-dot shrink-0 mt-0.5" />,
        info: <Info className="size-4 text-status-info-dot shrink-0 mt-0.5" />,
        loading: <Loader2 className="size-4 text-ink-tertiary animate-spin shrink-0 mt-0.5" />,
      }}
    />
  );
}
