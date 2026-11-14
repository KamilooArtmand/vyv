// MANDATORY COMPONENT CONTRACT: src/components/primitives/magnetic-target.tsx
"use client";

import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ARGON_SPRINGS } from "@/lib/motion";

interface MagneticTargetProps {
  children: React.ReactNode;
  /** Pull intensity multiplier (0.15 = subtle 3-5px pull; never exceed 0.3) */
  strength?: number;
  className?: string;
}

export function MagneticTarget({
  children,
  strength = 0.18,
  className,
}: MagneticTargetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, ARGON_SPRINGS.snappy);
  const y = useSpring(rawY, ARGON_SPRINGS.snappy);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      rawX.set((e.clientX - centerX) * strength);
      rawY.set((e.clientY - centerY) * strength);
    },
    [rawX, rawY, strength]
  );

  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
