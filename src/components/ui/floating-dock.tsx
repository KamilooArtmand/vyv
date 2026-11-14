// MANDATORY COMPONENT CONTRACT: src/components/ui/floating-dock.tsx
"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ARGON_SPRINGS } from "@/lib/motion";
import { triggerHaptic } from "@/lib/haptics";
import { MagneticTarget } from "@/components/primitives/magnetic-target";
import { cn } from "@/lib/utils";

export interface DockItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
  badgeCount?: number;
}

export interface FloatingDockProps {
  items: readonly DockItemConfig[];
  className?: string;
}

export function FloatingDock({ items, className }: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <nav
      aria-label="Primary Floating Dock"
      data-slot="floating-dock"
      onPointerMove={(e) => {
        if (e.pointerType !== "touch") {
          mouseX.set(e.pageX);
        }
      }}
      onPointerLeave={() => mouseX.set(Infinity)}
      className={cn(
        "glass-deck surface-grain fixed bottom-4 inset-x-0 z-40 mx-auto flex h-14 w-fit items-center gap-1.5 rounded-2xl px-2.5",
        "mb-[env(safe-area-inset-bottom,0px)] select-none",
        className
      )}
    >
      {items.map((item) => (
        <DockIconButton key={item.id} item={item} mouseX={mouseX} />
      ))}
    </nav>
  );
}

function DockIconButton({
  item,
  mouseX,
}: {
  item: DockItemConfig;
  mouseX: MotionValue<number>;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  /* Maps cursor proximity [-110px, 0px, 110px] to icon button size [40px, 50px, 40px] */
  const rawSize = useTransform(distance, [-110, 0, 110], [40, 50, 40]);
  const size = useSpring(rawSize, ARGON_SPRINGS.tactile);

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={item.label}
      onClick={item.onClick}
      onPointerDown={() => triggerHaptic("tick")}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "group/dock-item relative flex aspect-square items-center justify-center rounded-xl",
        "transition-colors duration-150 argon-focus-ring touch-target-expand",
        item.isActive
          ? "bg-surface-inverted text-ink-inverted shadow-ambient-sm"
          : "bg-surface/60 text-ink-secondary hover:bg-surface hover:text-ink border border-hairline-subtle"
      )}
    >
      {/* Zero-Latency Hover Label Pill */}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap",
          "rounded-sm bg-surface-inverted px-2 py-0.5 type-micro text-ink-inverted shadow-ambient-sm",
          "opacity-0 translate-y-1 scale-95 transition-[opacity,transform] duration-150 ease-[var(--ease-expo-out)]",
          "group-hover/dock-item:opacity-100 group-hover/dock-item:translate-y-0 group-hover/dock-item:scale-100"
        )}
      >
        {item.label}
      </span>

      <MagneticTarget strength={0.2} className="flex items-center justify-center">
        <span className="[&_svg]:size-[18px] [&_svg]:stroke-[1.6]">{item.icon}</span>
      </MagneticTarget>

      {/* Unread / Telemetry Counter Dot */}
      {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
        <span
          data-numeric="true"
          className="tabular-data absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-status-danger-dot px-1 type-micro text-white ring-2 ring-surface"
        >
          {item.badgeCount > 99 ? "99+" : item.badgeCount}
        </span>
      )}

      {/* Active Workspace 4px Specular Dot */}
      {item.isActive && (
        <span className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-pill bg-ink" />
      )}
    </motion.button>
  );
}
