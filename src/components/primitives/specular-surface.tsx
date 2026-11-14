// MANDATORY COMPONENT CONTRACT: src/components/primitives/specular-surface.tsx
"use client";

import React, { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface SpecularSurfaceProps extends React.HTMLAttributes<HTMLElement> {
  /** Radius of the optical proximity illumination in pixels (Default: 280) */
  spotlightRadius?: number;
  /** Enable subtle inner surface luminance sheen in addition to 1px border catch */
  enableSurfaceSheen?: boolean;
  /** Semantic HTML tag or Polymorphic wrapper */
  as?: "div" | "article" | "section" | "li";
  ref?: React.Ref<HTMLElement>;
}

export function SpecularSurface({
  children,
  className,
  spotlightRadius = 280,
  enableSurfaceSheen = true,
  as: Component = "div",
  onPointerMove,
  ref,
  ...props
}: SpecularSurfaceProps) {
  const internalRef = useRef<HTMLElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      internalRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const el = internalRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--cursor-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--cursor-y", `${e.clientY - rect.top}px`);
      }
      onPointerMove?.(e);
    },
    [onPointerMove]
  );

  const Comp = Component as any;

  return (
    <Comp
      ref={setRefs}
      data-slot="specular-surface"
      onPointerMove={handlePointerMove}
      style={
        {
          "--spotlight-radius": `${spotlightRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        "group/specular relative overflow-hidden rounded-xl bg-surface border border-hairline shadow-ambient-xs transition-colors duration-200",
        /* 1px Monochrome Specular Border Mask */
        "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:rounded-[inherit] before:p-px",
        "before:bg-[radial-gradient(var(--spotlight-radius)_circle_at_var(--cursor-x,-999px)_var(--cursor-y,-999px),var(--ink-tertiary),transparent_100%)]",
        "before:opacity-0 hover:before:opacity-45 dark:hover:before:opacity-65 before:transition-opacity before:duration-300",
        "before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude]",
        /* Optional 2% Optical Surface Sheen */
        enableSurfaceSheen && [
          "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-[inherit]",
          "after:bg-[radial-gradient(var(--spotlight-radius)_circle_at_var(--cursor-x,-999px)_var(--cursor-y,-999px),var(--ink-primary),transparent_100%)]",
          "after:opacity-0 hover:after:opacity-[0.02] dark:hover:after:opacity-[0.035] after:transition-opacity after:duration-300",
        ],
        className
      )}
      {...props}
    >
      <div className="relative z-10 h-full w-full">{children}</div>
    </Comp>
  );
}
