// MANDATORY MOTION ENGINE CONTRACT: src/lib/motion.ts
import type { Transition, Variants } from "motion/react";

/**
 * 1. DETERMINISTIC SPRING PHYSICS MATRIX
 * Calibrated for 120Hz ProMotion displays with sub-pixel rest thresholds.
 */
export const ARGON_SPRINGS = {
  /**
   * SNAPPY: Micro-controls,Segmented Control pills, Toggles, Buttons, Hover indicators.
   * Zero overshoot, instantaneous response (~180ms settling perception).
   */
  snappy: {
    type: "spring",
    stiffness: 520,
    damping: 38,
    mass: 0.8,
    restDelta: 0.001,
    restSpeed: 0.001,
  } satisfies Transition,

  /**
   * FLUID: Command Palette (Cmd+K), Modals, Popovers, Shared layoutId morphs.
   * Critically damped with organic momentum (~260ms settling perception).
   */
  fluid: {
    type: "spring",
    stiffness: 380,
    damping: 32,
    mass: 1.0,
    restDelta: 0.001,
    restSpeed: 0.001,
  } satisfies Transition,

  /**
   * SILK: Bento card expansion, Split-pane sidebars, Page-level layout projections.
   * Luxurious, weighted deceleration with zero bounce.
   */
  silk: {
    type: "spring",
    stiffness: 250,
    damping: 30,
    mass: 1.1,
    restDelta: 0.001,
    restSpeed: 0.001,
  } satisfies Transition,

  /**
   * TACTILE BOUNCE / BOUNCY: Play/pause micro-springs, Floating dock magnification, Notification badges.
   * Controlled ~6-8% elastic overshoot for physical delight and tactile snap.
   */
  tactile: {
    type: "spring",
    stiffness: 460,
    damping: 22,
    mass: 0.85,
    restDelta: 0.001,
  } satisfies Transition,

  bouncy: {
    type: "spring",
    stiffness: 480,
    damping: 20,
    mass: 0.85,
    restDelta: 0.001,
  } satisfies Transition,

  /**
   * HEAVY SHEET: Mobile bottom drawers (Vaul), Full-screen workspace sheets.
   * High inertia that respects swipe release velocity.
   */
  heavy: {
    type: "spring",
    stiffness: 200,
    damping: 28,
    mass: 1.35,
    restDelta: 0.001,
  } satisfies Transition,
} as const;

/**
 * 2. OPTICAL BEZIER TRANSITIONS (FOR OPACITY & BLUR MORPHS)
 */
export const ARGON_EASE = {
  opticalOut: [0.22, 1, 0.36, 1] as const,
  expoOut: [0.16, 1, 0.3, 1] as const,
  snap: [0.2, 0, 0, 1] as const,
};

/**
 * 3. CHOREOGRAPHED STAGGER & ENTRY VARIANTS
 * Uses subtle Y-axis translation (8px), optical blur dissipation (4px -> 0px),
 * and opacity ramp to create a high-craft "materializing" effect.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

export const materializeItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.985,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: ARGON_SPRINGS.fluid,
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.985,
    filter: "blur(2px)",
    transition: {
      duration: 0.14,
      ease: ARGON_EASE.expoOut,
    },
  },
};

/**
 * 4. MODAL, DIALOG & POPOVER OVERLAY VARIANTS
 */
export const overlayBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: ARGON_EASE.opticalOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.14, ease: ARGON_EASE.expoOut },
  },
};

export const modalSurfaceVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: ARGON_SPRINGS.fluid,
  },
  exit: {
    opacity: 0,
    scale: 0.975,
    y: 4,
    filter: "blur(4px)",
    transition: {
      duration: 0.13,
      ease: ARGON_EASE.expoOut,
    },
  },
};

/**
 * 5. TACTILE MICRO-INTERACTION PRESETS (BUTTONS & CARDS)
 */
export const TACTILE_PRESS = {
  /** Standard compact controls (buttons, pills, icon triggers) */
  control: {
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.97 },
    transition: ARGON_SPRINGS.snappy,
  },
  /** Interactive Bento cards and large list rows */
  surface: {
    whileHover: { y: -1 },
    whileTap: { scale: 0.992 },
    transition: ARGON_SPRINGS.snappy,
  },
} as const;
