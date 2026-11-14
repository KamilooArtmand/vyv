// MANDATORY COMPONENT CONTRACT: src/components/ui/adaptive-overlay.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  BottomSheet,
  BottomSheetContent,
} from "@/components/ui/dialog-drawer";

export function useIsDesktop(breakpointPx = 768): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpointPx]);

  return isDesktop;
}

export interface AdaptiveOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode | any;
  description?: React.ReactNode | any;
  children: React.ReactNode | any;
  className?: string;
}

export function AdaptiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AdaptiveOverlayProps) {
  const isDesktop = useIsDesktop(768);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={className}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className={className}>
        <div className="mb-4 flex flex-col gap-1 text-start">
          <h2 className="type-h2 text-ink">{title}</h2>
          {description && (
            <p className="type-body-sm text-ink-secondary">{description}</p>
          )}
        </div>
        {children}
      </BottomSheetContent>
    </BottomSheet>
  );
}
